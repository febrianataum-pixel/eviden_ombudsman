import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  HardDrive,
  RefreshCw,
  FolderSync,
  Sparkles
} from 'lucide-react';

interface UploadModalProps {
  requirementId: string;
  requirementTitle: string;
  evidenceIdToReplace?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  requirementId,
  requirementTitle,
  evidenceIdToReplace,
  isOpen,
  onClose,
}) => {
  const { 
    uploadEvidenceFile, 
    replaceEvidenceFile, 
    syncDriveFolderForRequirement,
    uploading, 
    uploadProgress 
  } = useData();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'file' | 'drive_sync'>('file');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Auto-detect drive state
  const [folderUrl, setFolderUrl] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  if (!isOpen) return null;

  const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];

  const validateAndSetFile = (file: File) => {
    setError(null);
    setSuccessMsg(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      setError(`Format file .${ext} tidak diperbolehkan. Gunakan PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, atau PNG.`);
      return;
    }
    // Limit size 50MB
    if (file.size > 50 * 1024 * 1024) {
      setError('Ukuran file maksimal 50 MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !user) return;

    setError(null);
    setSuccessMsg(null);
    try {
      if (evidenceIdToReplace) {
        await replaceEvidenceFile(
          evidenceIdToReplace,
          selectedFile,
          user.uid,
          user.displayName || 'Operator',
          note
        );
      } else {
        await uploadEvidenceFile(
          requirementId,
          selectedFile,
          user.uid,
          user.displayName || 'Operator'
        );
      }
      onClose();
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err?.message || 'Gagal mengunggah file. Pastikan koneksi stabil.');
    }
  };

  const handleAutoDetectDrive = async () => {
    if (!user) return;
    setError(null);
    setSuccessMsg(null);
    setIsScanning(true);

    try {
      const res = await syncDriveFolderForRequirement(
        requirementId,
        folderUrl,
        user.uid,
        user.displayName || 'Operator'
      );

      if (res.count > 0) {
        setSuccessMsg(`Berhasil mendeteksi & mengimpor ${res.count} file baru dari Google Drive: ${res.importedFiles.join(', ')}`);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setSuccessMsg('Tidak ada file baru di folder Google Drive ini, atau seluruh file telah terdaftar.');
      }
    } catch (err: any) {
      console.error('Drive auto detect failed:', err);
      setError(err?.message || 'Gagal mendeteksi folder Google Drive. Pastikan Link Folder valid.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <Upload size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {evidenceIdToReplace ? 'Ganti File Evidence' : 'Upload Bukti Dukung'}
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{requirementTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={uploading || isScanning}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        {!evidenceIdToReplace && (
          <div className="flex border-b border-slate-200 bg-slate-100/60 p-1 gap-1">
            <button
              type="button"
              onClick={() => { setActiveTab('file'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'file'
                  ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload size={14} />
              <span>Upload dari Komputer</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('drive_sync'); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'drive_sync'
                  ? 'bg-white text-emerald-600 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles size={14} className="text-amber-500" />
              <span>Auto Detect Google Drive</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'file' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : selectedFile
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                }`}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <FileText size={36} className="mx-auto text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 max-w-xs truncate mx-auto">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Klik untuk mengganti
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                      <Upload size={22} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Tarik & lepaskan file di sini, atau <span className="text-blue-600 underline">pilih file</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG (Maks 50MB)
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Optional Catatan Perubahan */}
              {evidenceIdToReplace && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Catatan Perubahan (Opsional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Alasan pembaruan atau perbaikan dokumen..."
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Drive destination info */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2.5 text-xs text-slate-600">
                <HardDrive size={16} className="text-blue-600 shrink-0" />
                <span>File akan diunggah secara otomatis ke lokasi folder Google Drive Ombudsman 2026.</span>
              </div>

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span>Mengunggah ke Google Drive...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center gap-2 shadow-xs"
                >
                  {uploading ? 'Mengunggah...' : evidenceIdToReplace ? 'Simpan Perubahan' : 'Upload ke Google Drive'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <FolderSync size={16} className="text-amber-600 shrink-0" />
                  <span>Auto Detect File dari Google Drive</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Jika Anda telah mengunggah file secara manual langsung ke folder Google Drive, sistem akan memindai isi folder tersebut dan menambahkan dokumennya secara otomatis.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-800 block">
                  Link Folder Google Drive (Opsional)
                </label>
                <input
                  type="url"
                  value={folderUrl}
                  onChange={(e) => setFolderUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/1ABC..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-500">
                  *Kosongkan jika Anda ingin sistem mencari di folder default Google Drive sesuai nama indikator ini.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isScanning}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAutoDetectDrive}
                  disabled={isScanning}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 flex items-center gap-2 shadow-xs"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Memindai Google Drive...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Deteksi & Impor File</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

