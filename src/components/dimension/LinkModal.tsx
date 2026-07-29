import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { X, Link2, AlertCircle, ExternalLink } from 'lucide-react';
import { isValidDriveOrExternalUrl } from '../../lib/googleDriveService';

interface LinkModalProps {
  requirementId: string;
  requirementTitle: string;
  evidenceIdToReplace?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LinkModal: React.FC<LinkModalProps> = ({
  requirementId,
  requirementTitle,
  evidenceIdToReplace,
  isOpen,
  onClose,
}) => {
  const { addEvidenceLink, replaceEvidenceLink } = useData();
  const { user } = useAuth();

  const [title, setTitle] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !user) return;

    if (!isValidDriveOrExternalUrl(url.trim())) {
      setError('URL tidak valid. Masukkan URL lengkap diawali dengan https:// atau http://');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (evidenceIdToReplace) {
        await replaceEvidenceLink(
          evidenceIdToReplace,
          title || 'Link Bukti Dukung',
          url.trim(),
          user.uid,
          user.displayName || 'Operator',
          description
        );
      } else {
        await addEvidenceLink(
          requirementId,
          title || 'Link Bukti Dukung',
          url.trim(),
          description,
          user.uid,
          user.displayName || 'Operator'
        );
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to add link:', err);
      setError('Gagal menyimpan link evidence.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col text-slate-900">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              <Link2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {evidenceIdToReplace ? 'Ganti Link Bukti Dukung' : 'Tambah Link Bukti Dukung'}
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{requirementTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={submitting}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Judul Link */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Judul / Nama Dokumen <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Peraturan Bupati No 12 Tahun 2026 (Google Drive)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* URL Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              URL Google Drive / Link Dokumen <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Masukkan URL Google Drive atau portal dokumen yang dapat diakses publik/verifikator.
            </p>
          </div>

          {/* Keterangan */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Keterangan Tambahan (Opsional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan mengenai isi link dokumen..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!url.trim() || submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center gap-2 shadow-xs"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Link'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
