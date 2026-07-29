import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { 
  db, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  serverTimestamp 
} from '../lib/firebase';
import { 
  Dimension, 
  Indicator, 
  DocumentRequirement, 
  Evidence, 
  EvidenceHistory, 
  CommunityTrustUnit, 
  ActivityLog,
  VerificationStatus,
  EvidenceType
} from '../types';
import { 
  SEED_DIMENSIONS, 
  SEED_INDICATORS, 
  SEED_REQUIREMENTS 
} from '../data/seedData';
import { 
  uploadFileToDrive, 
  deleteFileFromDrive, 
  extractDriveFileId, 
  extractDriveFolderId,
  fetchFilesInDriveFolder,
  getOrCreateTargetFolder,
  getDriveAccessToken,
  syncAllDriveFolderStructure, 
  DriveUploadResult 
} from '../lib/googleDriveService';
import * as XLSX from 'xlsx';

interface DataContextType {
  dimensions: Dimension[];
  indicators: Indicator[];
  requirements: DocumentRequirement[];
  evidences: Evidence[];
  evidenceHistory: EvidenceHistory[];
  communityTrustUnits: CommunityTrustUnit[];
  activityLogs: ActivityLog[];
  loading: boolean;
  uploading: boolean;
  uploadProgress: number;

  // Actions
  syncDriveFolders: (
    onProgress?: (status: string) => void
  ) => Promise<{ success: boolean; createdFolders: number; message: string }>;

  syncDriveFolderForRequirement: (
    requirementId: string,
    folderUrlOrId?: string,
    uploaderUid?: string,
    uploaderName?: string
  ) => Promise<{ count: number; importedFiles: string[] }>;

  uploadEvidenceFile: (
    requirementId: string,
    file: File,
    uploaderUid: string,
    uploaderName: string
  ) => Promise<void>;

  addEvidenceLink: (
    requirementId: string,
    title: string,
    externalUrl: string,
    description: string,
    uploaderUid: string,
    uploaderName: string
  ) => Promise<void>;

  replaceEvidenceFile: (
    evidenceId: string,
    file: File,
    uploaderUid: string,
    uploaderName: string,
    note?: string
  ) => Promise<void>;

  replaceEvidenceLink: (
    evidenceId: string,
    title: string,
    externalUrl: string,
    uploaderUid: string,
    uploaderName: string,
    note?: string
  ) => Promise<void>;

  deleteEvidence: (
    evidenceId: string,
    userUid: string,
    userName: string
  ) => Promise<void>;

  verifyEvidence: (
    evidenceId: string,
    status: VerificationStatus,
    note: string,
    verifierUid: string,
    verifierName: string
  ) => Promise<void>;

  // Community Trust
  addCommunityTrustUnit: (unit: Omit<CommunityTrustUnit, 'id' | 'updatedAt'>) => Promise<void>;
  updateCommunityTrustUnit: (id: string, unit: Partial<CommunityTrustUnit>) => Promise<void>;
  deleteCommunityTrustUnit: (id: string) => Promise<void>;

  // Master Data Admin
  addCustomIndicator: (indicator: Omit<Indicator, 'id'>) => Promise<void>;
  addCustomRequirement: (req: Omit<DocumentRequirement, 'id'>) => Promise<void>;

  // Exports
  exportReportToExcel: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dimensions, setDimensions] = useState<Dimension[]>(SEED_DIMENSIONS);
  const [indicators, setIndicators] = useState<Indicator[]>(SEED_INDICATORS);
  const [requirements, setRequirements] = useState<DocumentRequirement[]>(SEED_REQUIREMENTS);
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [evidenceHistory, setEvidenceHistory] = useState<EvidenceHistory[]>([]);
  const [communityTrustUnits, setCommunityTrustUnits] = useState<CommunityTrustUnit[]>([
    {
      id: 'unit-1',
      unitName: 'Dinas Kependudukan dan Pencatatan Sipil (Disdukcapil)',
      targetRespondents: 30,
      currentRespondents: 28,
      questionnaireUrl: 'https://forms.google.com/sample-disdukcapil',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'unit-2',
      unitName: 'Dinas Penanaman Modal dan PTSP (DPMPTSP)',
      targetRespondents: 30,
      currentRespondents: 32,
      questionnaireUrl: 'https://forms.google.com/sample-dpmptsp',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'unit-3',
      unitName: 'RSUD Utama Kota / Kab',
      targetRespondents: 30,
      currentRespondents: 24,
      questionnaireUrl: 'https://forms.google.com/sample-rsud',
      updatedAt: new Date().toISOString(),
    },
  ]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const { firebaseUser, user } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Initialize master data in state and setup Firestore real-time listeners
  useEffect(() => {
    if (!firebaseUser && !user) {
      setLoading(false);
      return;
    }

    let unsubEvidences: () => void;
    let unsubHistory: () => void;
    let unsubTrust: () => void;
    let unsubLogs: () => void;

    const setupListeners = async () => {
      try {
        setLoading(true);

        // 1. Evidences Listener
        unsubEvidences = onSnapshot(
          collection(db, 'evidences'), 
          (snapshot) => {
            const list: Evidence[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              list.push({
                id: docSnap.id,
                requirementId: data.requirementId || '',
                indicatorId: data.indicatorId || '',
                dimensionId: data.dimensionId || '',
                type: data.type || 'upload',
                fileName: data.fileName || '',
                driveFileId: data.driveFileId || '',
                driveUrl: data.driveUrl || '',
                externalUrl: data.externalUrl || '',
                mimeType: data.mimeType || '',
                fileSize: data.fileSize || 0,
                uploadedBy: data.uploadedBy || '',
                uploadedByName: data.uploadedByName || 'Operator',
                uploadedAt: data.uploadedAt ? formatTimestamp(data.uploadedAt) : new Date().toISOString(),
                verificationStatus: data.verificationStatus || 'pending',
                verificationNote: data.verificationNote || '',
                verifiedBy: data.verifiedBy || null,
                verifiedByName: data.verifiedByName || null,
                verifiedAt: data.verifiedAt ? formatTimestamp(data.verifiedAt) : null,
                version: data.version || 1,
              });
            });
            setEvidences(list);
            setLoading(false);
          },
          (error) => {
            console.warn('Evidences snapshot listener error:', error);
            setLoading(false);
          }
        );

        // 2. Evidence History Listener
        unsubHistory = onSnapshot(
          collection(db, 'evidenceHistory'), 
          (snapshot) => {
            const list: EvidenceHistory[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              list.push({
                id: docSnap.id,
                evidenceId: data.evidenceId || '',
                requirementId: data.requirementId || '',
                type: data.type || 'upload',
                fileName: data.fileName || '',
                driveFileId: data.driveFileId,
                driveUrl: data.driveUrl,
                externalUrl: data.externalUrl,
                mimeType: data.mimeType,
                fileSize: data.fileSize,
                uploadedBy: data.uploadedBy || '',
                uploadedByName: data.uploadedByName || 'Operator',
                uploadedAt: data.uploadedAt ? formatTimestamp(data.uploadedAt) : new Date().toISOString(),
                action: data.action || 'uploaded',
                note: data.note || '',
              });
            });
            setEvidenceHistory(list.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
          },
          (error) => {
            console.warn('EvidenceHistory snapshot listener error:', error);
          }
        );

        // 3. Community Trust Listener
        unsubTrust = onSnapshot(
          collection(db, 'communityTrust'), 
          (snapshot) => {
            if (!snapshot.empty) {
              const list: CommunityTrustUnit[] = [];
              snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                list.push({
                  id: docSnap.id,
                  unitName: data.unitName || '',
                  targetRespondents: data.targetRespondents || 30,
                  currentRespondents: data.currentRespondents || 0,
                  questionnaireUrl: data.questionnaireUrl || '',
                  updatedAt: data.updatedAt ? formatTimestamp(data.updatedAt) : new Date().toISOString(),
                });
              });
              setCommunityTrustUnits(list);
            }
          },
          (error) => {
            console.warn('CommunityTrust snapshot listener error:', error);
          }
        );

        // 4. Activity Logs Listener
        unsubLogs = onSnapshot(
          collection(db, 'activityLogs'), 
          (snapshot) => {
            const list: ActivityLog[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              list.push({
                id: docSnap.id,
                userId: data.userId || '',
                userName: data.userName || 'Pengguna',
                userRole: data.userRole || 'operator',
                action: data.action || '',
                details: data.details || '',
                timestamp: data.timestamp ? formatTimestamp(data.timestamp) : new Date().toISOString(),
              });
            });
            setActivityLogs(list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
          },
          (error) => {
            console.warn('ActivityLogs snapshot listener error:', error);
          }
        );

      } catch (err) {
        console.error('Error listening to Firestore collections:', err);
        setLoading(false);
      }
    };

    setupListeners();

    return () => {
      if (unsubEvidences) unsubEvidences();
      if (unsubHistory) unsubHistory();
      if (unsubTrust) unsubTrust();
      if (unsubLogs) unsubLogs();
    };
  }, [firebaseUser, user]);

  const formatTimestamp = (ts: any): string => {
    if (!ts) return new Date().toISOString();
    if (typeof ts === 'string') return ts;
    if (ts.toDate) return ts.toDate().toISOString();
    if (ts.seconds) return new Date(ts.seconds * 1000).toISOString();
    return new Date().toISOString();
  };

  const logActivity = async (userId: string, userName: string, action: string, details: string) => {
    try {
      await addDoc(collection(db, 'activityLogs'), {
        userId,
        userName,
        userRole: 'operator',
        action,
        details,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  // Sync Drive Folders
  const syncDriveFolders = async (
    onProgress?: (status: string) => void
  ) => {
    return await syncAllDriveFolderStructure(dimensions, indicators, onProgress);
  };

  // Auto-Detect & Sync Google Drive folder for requirement
  const syncDriveFolderForRequirement = async (
    requirementId: string,
    folderUrlOrId?: string,
    uploaderUid: string = 'system',
    uploaderName: string = 'Operator'
  ): Promise<{ count: number; importedFiles: string[] }> => {
    const req = requirements.find((r) => r.id === requirementId);
    if (!req) throw new Error('Dokumen kebutuhan tidak ditemukan.');

    const indicator = indicators.find((i) => i.id === req.indicatorId);
    const dimension = dimensions.find((d) => d.id === req.dimensionId);

    let folderId = folderUrlOrId ? (extractDriveFolderId(folderUrlOrId) || folderUrlOrId.trim()) : '';

    if (!folderId) {
      const token = getDriveAccessToken();
      if (token) {
        folderId = await getOrCreateTargetFolder(
          token,
          dimension?.code || '01',
          indicator?.code || 'IN-01',
          dimension?.title,
          indicator?.title
        );
      }
    }

    if (!folderId) {
      throw new Error('Masukkan Link Folder Google Drive atau login dengan akun Google.');
    }

    const driveFiles = await fetchFilesInDriveFolder(folderId);

    if (!driveFiles || driveFiles.length === 0) {
      return { count: 0, importedFiles: [] };
    }

    const existingEvidences = evidences.filter((e) => e.requirementId === requirementId);
    const existingFileIds = new Set(existingEvidences.map((e) => e.driveFileId).filter(Boolean));
    const existingUrls = new Set(existingEvidences.map((e) => e.driveUrl).filter(Boolean));

    const importedFiles: string[] = [];
    let count = 0;

    for (const file of driveFiles) {
      if (existingFileIds.has(file.id) || existingUrls.has(file.webViewLink)) {
        continue;
      }

      const evidenceDocData = {
        requirementId,
        indicatorId: req.indicatorId,
        dimensionId: req.dimensionId,
        type: 'upload' as EvidenceType,
        fileName: file.name,
        driveFileId: file.id,
        driveUrl: file.webViewLink,
        mimeType: file.mimeType,
        fileSize: file.size,
        uploadedBy: uploaderUid,
        uploadedByName: uploaderName,
        uploadedAt: serverTimestamp(),
        verificationStatus: 'pending' as VerificationStatus,
        verificationNote: 'Auto-detected dari Google Drive',
        verifiedBy: null,
        verifiedByName: null,
        verifiedAt: null,
        version: 1,
      };

      const docRef = await addDoc(collection(db, 'evidences'), evidenceDocData);

      await addDoc(collection(db, 'evidenceHistory'), {
        evidenceId: docRef.id,
        requirementId,
        type: 'upload',
        fileName: file.name,
        driveFileId: file.id,
        driveUrl: file.webViewLink,
        mimeType: file.mimeType,
        fileSize: file.size,
        uploadedBy: uploaderUid,
        uploadedByName: uploaderName,
        uploadedAt: serverTimestamp(),
        action: 'uploaded',
        note: 'Terdeteksi otomatis dari folder Google Drive',
      });

      importedFiles.push(file.name);
      count++;
    }

    if (count > 0) {
      await logActivity(
        uploaderUid,
        uploaderName,
        'Auto Detect Google Drive',
        `Mendeteksi ${count} file baru dari Google Drive untuk: ${req.title}`
      );
    }

    return { count, importedFiles };
  };

  // Upload Evidence File
  const uploadEvidenceFile = async (
    requirementId: string,
    file: File,
    uploaderUid: string,
    uploaderName: string
  ) => {
    const req = requirements.find((r) => r.id === requirementId);
    if (!req) throw new Error('Dokumen kebutuhan tidak ditemukan.');

    const indicator = indicators.find((i) => i.id === req.indicatorId);
    const dimension = dimensions.find((d) => d.id === req.dimensionId);

    setUploading(true);
    setUploadProgress(10);

    try {
      const driveResult: DriveUploadResult = await uploadFileToDrive(
        file,
        dimension?.code || '01',
        indicator?.code || 'IN-01',
        (prog) => setUploadProgress(prog),
        dimension?.title,
        indicator?.title
      );

      const now = new Date().toISOString();
      const evidenceDocData = {
        requirementId,
        indicatorId: req.indicatorId,
        dimensionId: req.dimensionId,
        type: 'upload' as EvidenceType,
        fileName: driveResult.fileName,
        driveFileId: driveResult.fileId,
        driveUrl: driveResult.driveUrl,
        mimeType: driveResult.mimeType,
        fileSize: driveResult.fileSize,
        uploadedBy: uploaderUid,
        uploadedByName: uploaderName,
        uploadedAt: serverTimestamp(),
        verificationStatus: 'pending' as VerificationStatus,
        verificationNote: '',
        verifiedBy: null,
        verifiedByName: null,
        verifiedAt: null,
        version: 1,
      };

      const docRef = await addDoc(collection(db, 'evidences'), evidenceDocData);

      // Audit History
      await addDoc(collection(db, 'evidenceHistory'), {
        evidenceId: docRef.id,
        requirementId,
        type: 'upload',
        fileName: driveResult.fileName,
        driveFileId: driveResult.fileId,
        driveUrl: driveResult.driveUrl,
        mimeType: driveResult.mimeType,
        fileSize: driveResult.fileSize,
        uploadedBy: uploaderUid,
        uploadedByName: uploaderName,
        uploadedAt: serverTimestamp(),
        action: 'uploaded',
        note: 'Upload perdana evidence ke Google Drive',
      });

      await logActivity(
        uploaderUid,
        uploaderName,
        'Upload Evidence',
        `Mengupload file "${file.name}" untuk kebutuhan: ${req.title}`
      );
    } catch (err) {
      console.error('Failed to upload evidence file:', err);
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Add Evidence Link
  const addEvidenceLink = async (
    requirementId: string,
    title: string,
    externalUrl: string,
    description: string,
    uploaderUid: string,
    uploaderName: string
  ) => {
    const req = requirements.find((r) => r.id === requirementId);
    if (!req) throw new Error('Dokumen kebutuhan tidak ditemukan.');

    try {
      const evidenceDocData = {
        requirementId,
        indicatorId: req.indicatorId,
        dimensionId: req.dimensionId,
        type: 'link' as EvidenceType,
        fileName: title || 'Link Bukti Dukung',
        externalUrl,
        driveUrl: externalUrl,
        uploadedBy: uploaderUid,
        uploadedByName: uploaderName,
        uploadedAt: serverTimestamp(),
        verificationStatus: 'pending' as VerificationStatus,
        verificationNote: description || '',
        verifiedBy: null,
        verifiedByName: null,
        verifiedAt: null,
        version: 1,
      };

      const docRef = await addDoc(collection(db, 'evidences'), evidenceDocData);

      await addDoc(collection(db, 'evidenceHistory'), {
        evidenceId: docRef.id,
        requirementId,
        type: 'link',
        fileName: title || 'Link Bukti Dukung',
        externalUrl,
        uploadedBy: uploaderUid,
        uploadedByName: uploaderName,
        uploadedAt: serverTimestamp(),
        action: 'uploaded',
        note: `Menambahkan link external: ${externalUrl}`,
      });

      await logActivity(
        uploaderUid,
        uploaderName,
        'Tambah Link Evidence',
        `Menambahkan link "${title}" untuk kebutuhan: ${req.title}`
      );
    } catch (err) {
      console.error('Failed to add evidence link:', err);
      throw err;
    }
  };

  // Replace Evidence File
  const replaceEvidenceFile = async (
    evidenceId: string,
    file: File,
    uploaderUid: string,
    uploaderName: string,
    note: string = ''
  ) => {
    const existing = evidences.find((e) => e.id === evidenceId);
    if (!existing) throw new Error('Evidence tidak ditemukan.');

    const req = requirements.find((r) => r.id === existing.requirementId);
    const indicator = indicators.find((i) => i.id === existing.indicatorId);
    const dimension = dimensions.find((d) => d.id === existing.dimensionId);

    setUploading(true);
    setUploadProgress(10);

    try {
      // Delete old file from Google Drive if present
      const oldDriveId = existing.driveFileId || (existing.driveUrl ? extractDriveFileId(existing.driveUrl) : null);
      if (oldDriveId) {
        deleteFileFromDrive(oldDriveId).catch((e) => console.warn('Could not delete old file from Drive:', e));
      }

      const driveResult = await uploadFileToDrive(
        file,
        dimension?.code || '01',
        indicator?.code || 'IN-01',
        (p) => setUploadProgress(p),
        dimension?.title,
        indicator?.title
      );

      const updatedVersion = (existing.version || 1) + 1;

      const evidenceRef = doc(db, 'evidences', evidenceId);
      await updateDoc(evidenceRef, {
        type: 'upload',
        fileName: driveResult.fileName,
        driveFileId: driveResult.fileId,
        driveUrl: driveResult.driveUrl,
        mimeType: driveResult.mimeType,
        fileSize: driveResult.fileSize,
        uploadedBy: uploaderUid,
        uploadedByName: uploaderName,
        uploadedAt: serverTimestamp(),
        verificationStatus: 'pending',
        verificationNote: '',
        version: updatedVersion,
      });

      // Audit Log
      await addDoc(collection(db, 'evidenceHistory'), {
        evidenceId,
        requirementId: existing.requirementId,
        type: 'upload',
        fileName: driveResult.fileName,
        driveFileId: driveResult.fileId,
        driveUrl: driveResult.driveUrl,
        mimeType: driveResult.mimeType,
        fileSize: driveResult.fileSize,
        uploadedBy: uploaderUid,
        uploadedByName: uploaderName,
        uploadedAt: serverTimestamp(),
        action: 'replaced',
        note: note || `Mengganti dokumen ke versi ${updatedVersion}`,
      });

      await logActivity(
        uploaderUid,
        uploaderName,
        'Ganti Evidence File',
        `Mengganti file evidence "${existing.fileName}" menjadi "${file.name}" (Kebutuhan: ${req?.title})`
      );
    } catch (err) {
      console.error('Failed to replace evidence file:', err);
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Replace Evidence Link
  const replaceEvidenceLink = async (
    evidenceId: string,
    title: string,
    externalUrl: string,
    uploaderUid: string,
    uploaderName: string,
    note: string = ''
  ) => {
    const existing = evidences.find((e) => e.id === evidenceId);
    if (!existing) throw new Error('Evidence tidak ditemukan.');

    const req = requirements.find((r) => r.id === existing.requirementId);
    const updatedVersion = (existing.version || 1) + 1;

    try {
      const evidenceRef = doc(db, 'evidences', evidenceId);
      await updateDoc(evidenceRef, {
        type: 'link',
        fileName: title || 'Link Bukti Dukung',
        externalUrl,
        driveUrl: externalUrl,
        uploadedBy: uploaderUid,
        uploadedByName: uploaderName,
        uploadedAt: serverTimestamp(),
        verificationStatus: 'pending',
        verificationNote: note || '',
        version: updatedVersion,
      });

      await addDoc(collection(db, 'evidenceHistory'), {
        evidenceId,
        requirementId: existing.requirementId,
        type: 'link',
        fileName: title || 'Link Bukti Dukung',
        externalUrl,
        uploadedBy: uploaderUid,
        uploadedByName: uploaderName,
        uploadedAt: serverTimestamp(),
        action: 'updated',
        note: note || `Memperbarui link ke v${updatedVersion}`,
      });

      await logActivity(
        uploaderUid,
        uploaderName,
        'Ganti Evidence Link',
        `Memperbarui link evidence "${title}" (Kebutuhan: ${req?.title})`
      );
    } catch (err) {
      console.error('Failed to replace evidence link:', err);
      throw err;
    }
  };

  // Delete Evidence
  const deleteEvidence = async (evidenceId: string, userUid: string, userName: string) => {
    const existing = evidences.find((e) => e.id === evidenceId);
    if (!existing) return;

    try {
      // 1. Delete associated file from Google Drive if exists
      const driveFileId = existing.driveFileId || (existing.driveUrl ? extractDriveFileId(existing.driveUrl) : null);
      if (driveFileId) {
        await deleteFileFromDrive(driveFileId);
      }

      // 2. Delete document from Firestore
      await deleteDoc(doc(db, 'evidences', evidenceId));

      await logActivity(
        userUid,
        userName,
        'Hapus Evidence',
        `Menghapus evidence "${existing.fileName}" (otomatis dihapus dari Google Drive)`
      );
    } catch (err) {
      console.error('Failed to delete evidence:', err);
      throw err;
    }
  };

  // Verify Evidence
  const verifyEvidence = async (
    evidenceId: string,
    status: VerificationStatus,
    note: string,
    verifierUid: string,
    verifierName: string
  ) => {
    const existing = evidences.find((e) => e.id === evidenceId);
    if (!existing) throw new Error('Evidence tidak ditemukan.');

    try {
      const evidenceRef = doc(db, 'evidences', evidenceId);
      await updateDoc(evidenceRef, {
        verificationStatus: status,
        verificationNote: note || '',
        verifiedBy: verifierUid,
        verifiedByName: verifierName,
        verifiedAt: serverTimestamp(),
      });

      const statusText = status === 'verified' ? 'TERIMA (Terverifikasi)' : 'PERLU PERBAIKAN';

      await logActivity(
        verifierUid,
        verifierName,
        'Verifikasi Evidence',
        `Mengubah status evidence "${existing.fileName}" menjadi ${statusText}. Catatan: ${note || '-'}`
      );
    } catch (err) {
      console.error('Failed to verify evidence:', err);
      throw err;
    }
  };

  // Community Trust Handlers
  const addCommunityTrustUnit = async (unit: Omit<CommunityTrustUnit, 'id' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'communityTrust'), {
        ...unit,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to add community trust unit:', err);
      throw err;
    }
  };

  const updateCommunityTrustUnit = async (id: string, unit: Partial<CommunityTrustUnit>) => {
    try {
      await updateDoc(doc(db, 'communityTrust', id), {
        ...unit,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to update community trust unit:', err);
      throw err;
    }
  };

  const deleteCommunityTrustUnit = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'communityTrust', id));
    } catch (err) {
      console.error('Failed to delete community trust unit:', err);
      throw err;
    }
  };

  // Custom Master Data Handlers
  const addCustomIndicator = async (ind: Omit<Indicator, 'id'>) => {
    const newId = `ind-custom-${Date.now()}`;
    const newIndicator: Indicator = { ...ind, id: newId };
    setIndicators((prev) => [...prev, newIndicator]);
  };

  const addCustomRequirement = async (req: Omit<DocumentRequirement, 'id'>) => {
    const newId = `req-custom-${Date.now()}`;
    const newReq: DocumentRequirement = { ...req, id: newId };
    setRequirements((prev) => [...prev, newReq]);
  };

  // Export to Excel
  const exportReportToExcel = () => {
    const exportData = requirements.map((req, index) => {
      const dim = dimensions.find((d) => d.id === req.dimensionId);
      const ind = indicators.find((i) => i.id === req.indicatorId);
      const evList = evidences.filter((e) => e.requirementId === req.id);

      const statusStr = dim?.isSecondaryData
        ? 'DATA SEKUNDER'
        : evList.length === 0
        ? 'BELUM ADA'
        : evList.some((e) => e.verificationStatus === 'verified')
        ? 'TERVERIFIKASI'
        : evList.some((e) => e.verificationStatus === 'needs_revision')
        ? 'PERLU PERBAIKAN'
        : 'MENUNGGU VERIFIKASI';

      const fileNames = evList.map((e) => e.fileName).join('; ') || '-';
      const fileUrls = evList.map((e) => e.driveUrl || e.externalUrl || '-').join('; ') || '-';
      const uploaders = evList.map((e) => e.uploadedByName).join('; ') || '-';
      const dates = evList.map((e) => new Date(e.uploadedAt).toLocaleDateString('id-ID')).join('; ') || '-';
      const verifiers = evList.map((e) => e.verifiedByName || '-').join('; ') || '-';
      const notes = evList.map((e) => e.verificationNote || '-').join('; ') || '-';

      return {
        No: index + 1,
        Dimensi: dim?.title || '',
        'Kode Indikator': ind?.code || '',
        Indikator: ind?.title || '',
        'Kebutuhan Dokumen': req.title,
        Deskripsi: req.description,
        'Status Evidence': statusStr,
        'Nama File / Link': fileNames,
        'URL Google Drive': fileUrls,
        Uploader: uploaders,
        'Tanggal Upload': dates,
        Verifikator: verifiers,
        Catatan: notes,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Evidence Ombudsman');
    XLSX.writeFile(workbook, `Rekap_Evidence_Ombudsman_2026_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <DataContext.Provider
      value={{
        dimensions,
        indicators,
        requirements,
        evidences,
        evidenceHistory,
        communityTrustUnits,
        activityLogs,
        loading,
        uploading,
        uploadProgress,
        syncDriveFolders,
        syncDriveFolderForRequirement,
        uploadEvidenceFile,
        addEvidenceLink,
        replaceEvidenceFile,
        replaceEvidenceLink,
        deleteEvidence,
        verifyEvidence,
        addCommunityTrustUnit,
        updateCommunityTrustUnit,
        deleteCommunityTrustUnit,
        addCustomIndicator,
        addCustomRequirement,
        exportReportToExcel,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
