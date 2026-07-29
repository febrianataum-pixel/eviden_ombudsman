import React, { useState } from 'react';
import { Evidence, VerificationStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { X, ShieldCheck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface VerificationModalProps {
  evidence: Evidence | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  evidence,
  isOpen,
  onClose,
}) => {
  const { verifyEvidence } = useData();
  const { user } = useAuth();

  const [status, setStatus] = useState<VerificationStatus>('verified');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen || !evidence) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (status === 'needs_revision' && !note.trim()) {
      setError('Harap isi catatan perbaikan agar operator mengetahui kekurangan dokumen.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await verifyEvidence(
        evidence.id,
        status,
        note.trim(),
        user.uid,
        user.displayName || 'Verifikator'
      );
      onClose();
    } catch (err: any) {
      console.error('Failed to submit verification:', err);
      setError('Gagal menyimpan status verifikasi.');
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
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Verifikasi Evidence Dokumen</h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{evidence.fileName}</p>
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

          {/* Status Selection Cards */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Keputusan Verifikator <span className="text-rose-600">*</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('verified')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col items-center justify-center gap-2 ${
                  status === 'verified'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <CheckCircle2 size={24} className={status === 'verified' ? 'text-emerald-600' : 'text-slate-400'} />
                <span className="text-xs font-bold uppercase tracking-wider">TERIMA (Sesuai)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('needs_revision')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col items-center justify-center gap-2 ${
                  status === 'needs_revision'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <XCircle size={24} className={status === 'needs_revision' ? 'text-rose-600' : 'text-slate-400'} />
                <span className="text-xs font-bold uppercase tracking-wider">PERLU PERBAIKAN</span>
              </button>
            </div>
          </div>

          {/* Catatan Verifikator */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Catatan Verifikasi {status === 'needs_revision' && <span className="text-rose-600">*</span>}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                status === 'needs_revision'
                  ? 'Tuliskan instruksi perbaikan (contoh: Dokumen belum ditandatangani pejabat berwenang).'
                  : 'Catatan opsional...'
              }
              rows={3}
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
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 shadow-xs"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Verifikasi'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
