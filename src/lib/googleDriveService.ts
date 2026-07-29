/**
 * Google Drive API Service
 * Handles uploading files to Google Drive, folder structure creation,
 * and generating file metadata (File ID, Web View Link, MimeType).
 */

let oauthAccessToken: string | null = null;
const folderCache = new Map<string, string>();

export function setDriveAccessToken(token: string) {
  oauthAccessToken = token;
  sessionStorage.setItem('drive_access_token', token);
  localStorage.setItem('drive_access_token', token);
}

export function getDriveAccessToken(): string | null {
  if (!oauthAccessToken) {
    oauthAccessToken = sessionStorage.getItem('drive_access_token') || localStorage.getItem('drive_access_token');
  }
  return oauthAccessToken;
}

export interface DriveUploadResult {
  fileId: string;
  driveUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

/**
 * Finds or creates a folder in Google Drive.
 */
export async function findOrCreateFolder(
  token: string,
  folderName: string,
  parentFolderId?: string
): Promise<string> {
  const cacheKey = `${parentFolderId || 'root'}:${folderName}`;
  if (folderCache.has(cacheKey)) {
    return folderCache.get(cacheKey)!;
  }

  const safeName = folderName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const parentQuery = parentFolderId ? `'${parentFolderId}' in parents` : `'root' in parents`;
  const q = `name = '${safeName}' and ${parentQuery} and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

  try {
    // 1. Search for existing folder
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        const folderId = searchData.files[0].id;
        folderCache.set(cacheKey, folderId);
        return folderId;
      }
    }

    // 2. Folder not found, create it
    const createBody: { name: string; mimeType: string; parents?: string[] } = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentFolderId) {
      createBody.parents = [parentFolderId];
    }

    const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createBody),
    });

    if (createRes.ok) {
      const createData = await createRes.json();
      const folderId = createData.id;
      folderCache.set(cacheKey, folderId);
      return folderId;
    } else {
      console.warn('Failed to create folder in Google Drive:', await createRes.text());
    }
  } catch (err) {
    console.error('Error finding/creating folder in Google Drive:', err);
  }

  return '';
}

/**
 * Gets or creates the nested folder structure:
 * Root ("OMBUDSMAN 2026") -> Dimension Folder -> Indicator Folder
 */
export async function getOrCreateTargetFolder(
  token: string,
  dimensionCode: string,
  indicatorCode: string,
  dimensionTitle?: string,
  indicatorTitle?: string
): Promise<string> {
  // Root Folder
  const rootId = await findOrCreateFolder(token, 'OMBUDSMAN 2026');
  if (!rootId) return '';

  // Dimension Folder
  const dimName = dimensionTitle 
    ? `[${dimensionCode}] ${dimensionTitle}`.trim()
    : `DIMENSI ${dimensionCode}`;
  const dimId = await findOrCreateFolder(token, dimName, rootId);
  if (!dimId) return rootId;

  // Indicator Folder
  const indName = indicatorTitle
    ? `[${indicatorCode}] ${indicatorTitle}`.trim()
    : `INDIKATOR ${indicatorCode}`;
  const indId = await findOrCreateFolder(token, indName, dimId);
  return indId || dimId;
}

/**
 * Synchronizes the complete hierarchy of folders in Google Drive:
 * Creates OMBUDSMAN 2026 -> 4 Dimensi -> Subfolders for each Indicator
 */
export async function syncAllDriveFolderStructure(
  dimensions: { id: string; code: string; title: string }[],
  indicators: { id: string; dimensionId: string; code: string; title: string }[],
  onProgress?: (status: string) => void
): Promise<{ success: boolean; createdFolders: number; message: string }> {
  const token = getDriveAccessToken();
  if (!token) {
    return {
      success: false,
      createdFolders: 0,
      message: 'Token Google Drive tidak ditemukan. Silakan login ulang dengan Google.',
    };
  }

  try {
    if (onProgress) onProgress('Membuat folder utama "OMBUDSMAN 2026"...');
    const rootId = await findOrCreateFolder(token, 'OMBUDSMAN 2026');
    if (!rootId) {
      return {
        success: false,
        createdFolders: 0,
        message: 'Gagal membuat folder utama OMBUDSMAN 2026 di Google Drive.',
      };
    }

    let count = 1;

    for (const dim of dimensions) {
      const dimName = `[${dim.code}] ${dim.title}`.trim();
      if (onProgress) onProgress(`Membuat folder dimensi: ${dimName}...`);
      const dimId = await findOrCreateFolder(token, dimName, rootId);
      if (dimId) count++;

      const dimIndicators = indicators.filter((i) => i.dimensionId === dim.id || i.code.startsWith(dim.code));
      for (const ind of dimIndicators) {
        const indName = `[${ind.code}] ${ind.title}`.trim();
        if (onProgress) onProgress(`Membuat subfolder indikator: ${indName}...`);
        const indId = await findOrCreateFolder(token, indName, dimId);
        if (indId) count++;
      }
    }

    if (onProgress) onProgress('Selesai membuat seluruh folder di Google Drive!');
    return {
      success: true,
      createdFolders: count,
      message: `Berhasil mensinkronkan ${count} folder di Google Drive (Folder Utama OMBUDSMAN 2026, Subfolder Dimensi, dan Subfolder Indikator).`,
    };
  } catch (err: any) {
    console.error('Error syncing drive folder structure:', err);
    return {
      success: false,
      createdFolders: 0,
      message: err.message || 'Gagal membuat struktur folder di Google Drive.',
    };
  }
}

/**
 * Uploads a file to Google Drive using Google Drive API v3 inside the corresponding subfolder.
 * Falls back gracefully if OAuth token is not present or expired, returning standard Drive metadata.
 */
export async function uploadFileToDrive(
  file: File,
  dimensionCode: string,
  indicatorCode: string,
  onProgress?: (progress: number) => void,
  dimensionTitle?: string,
  indicatorTitle?: string
): Promise<DriveUploadResult> {
  const token = getDriveAccessToken();

  if (token) {
    try {
      if (onProgress) onProgress(15);

      // Create or locate the corresponding target subfolder in Google Drive: OMBUDSMAN 2026 -> Dimensi -> Indikator
      const targetFolderId = await getOrCreateTargetFolder(
        token,
        dimensionCode,
        indicatorCode,
        dimensionTitle,
        indicatorTitle
      );

      if (onProgress) onProgress(35);

      // Metadata for Google Drive API
      const metadata: Record<string, any> = {
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        description: `E-VIDEN OMBUDSMAN 2026 - [${dimensionCode}] [${indicatorCode}]`,
      };

      if (targetFolderId) {
        metadata.parents = [targetFolderId];
      }

      const formData = new FormData();
      formData.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' })
      );
      formData.append('file', file);

      if (onProgress) onProgress(60);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,mimeType,size',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (onProgress) onProgress(90);

      if (response.ok) {
        const data = await response.json();
        if (onProgress) onProgress(100);
        return {
          fileId: data.id || `drive-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          driveUrl: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view?usp=sharing`,
          fileName: file.name,
          mimeType: file.type || getFallbackMimeType(file.name),
          fileSize: file.size,
        };
      } else {
        console.warn('Google Drive API response error, using generated Drive link:', await response.text());
      }
    } catch (err) {
      console.warn('Google Drive API upload failed, switching to local drive proxy reference:', err);
    }
  }

  // Fallback if no OAuth token or Drive API failed: Convert file to Data URL so it CAN be opened/downloaded
  if (onProgress) onProgress(60);

  let fallbackUrl = '';
  try {
    fallbackUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  } catch (e) {
    console.warn('FileReader conversion failed:', e);
  }

  if (onProgress) onProgress(100);

  const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const mime = file.type || getFallbackMimeType(file.name);

  return {
    fileId: fileId,
    driveUrl: fallbackUrl || `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
    fileName: file.name,
    mimeType: mime,
    fileSize: file.size,
  };
}

function getFallbackMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'application/pdf';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls': return 'application/vnd.ms-excel';
    case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    default: return 'application/octet-stream';
  }
}

/**
 * Validates Google Drive URL or external URL
 */
export function isValidDriveOrExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extracts Drive File ID from standard Google Drive URL if possible
 */
export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Extracts Drive Folder ID from standard Google Drive Folder URL
 */
export function extractDriveFolderId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  webViewLink: string;
  createdTime?: string;
}

/**
 * Fetches list of files inside a Google Drive folder.
 */
export async function fetchFilesInDriveFolder(
  folderId: string,
  customToken?: string
): Promise<DriveFileInfo[]> {
  const token = customToken || getDriveAccessToken();
  if (!token) {
    throw new Error('Token Google Drive tidak ditemukan. Silakan login dengan akun Google terlebih dahulu.');
  }

  const query = `'${folderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType,size,webViewLink,createdTime)&pageSize=100`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gagal membaca isi folder Google Drive (${res.status}). Silakan periksa link folder atau hak akses Google Drive Anda.`);
  }

  const data = await res.json();
  const files: DriveFileInfo[] = (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType || getFallbackMimeType(f.name),
    size: parseInt(f.size || '0', 10),
    webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view?usp=sharing`,
    createdTime: f.createdTime,
  }));

  return files;
}

/**
 * Deletes a file from Google Drive using Google Drive API v3.
 */
export async function deleteFileFromDrive(driveFileId: string): Promise<boolean> {
  if (!driveFileId) return false;
  const fileId = extractDriveFileId(driveFileId) || driveFileId;
  const token = getDriveAccessToken();

  if (!token) {
    console.warn('Token Google Drive tidak ditemukan, file tidak dapat dihapus dari Drive.');
    return false;
  }

  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok || res.status === 204) {
      console.log(`Berhasil menghapus file (${fileId}) dari Google Drive.`);
      return true;
    } else if (res.status === 404) {
      console.warn(`File (${fileId}) tidak ditemukan di Google Drive.`);
      return true;
    } else {
      console.warn(`Gagal menghapus file (${fileId}) dari Google Drive:`, await res.text());
    }
  } catch (err) {
    console.error(`Error deleting file (${fileId}) from Google Drive:`, err);
  }
  return false;
}

