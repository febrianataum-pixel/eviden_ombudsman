import React, { useState } from 'react';
import { Evidence } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { 
  FileText, 
  Link2, 
  ExternalLink, 
  Trash2, 
  RefreshCw, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  XCircle,
  Eye,
  User,
  Calendar,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

interface EvidenceItemProps {
  evidence: Evidence;
  requirementTitle: string;
  onReplaceFile: (evidenceId: string) => void;
  onReplaceLink: (evidenceId: string) => void;
  onOpenHistory: (evidenceId: string) => void;
  onOpenVerifyModal?: (evidence: Evidence) => void;
}

export const EvidenceItem: React.FC<EvidenceItemProps> = ({
  evidence,
  requirementTitle,
  onReplaceFile,
  onReplaceLink,
  onOpenHistory,
  onOpenVerifyModal,
}) => {
  const { user } = useAuth();
  const { deleteEvidence } = useData();
  const [deleting, setDeleting] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const canEditOrDelete = user?.role === 'admin' || user?.uid === evidence.uploadedBy;
  const canVerify = user?.role === 'admin' || user?.role === 'verifikator';

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteEvidence(evidence.id, user?.uid || '', user?.displayName || 'Pengguna');
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Failed to delete evidence:', err);
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = () => {
    switch (evidence.verificationStatus) {
      case 'verified':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <CheckCircle2 size={12} /> TERVERIFIKASI
          </span>
        );
      case 'needs_revision':
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <XCircle size={12} /> PERLU PERBAIKAN
          </span>
        );
      default:
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <Clock size={12} /> MENUNGGU VERIFIKASI
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 transition hover:border-slate-300 shadow-xs">
      
      {/* Top Row: File Name & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 shrink-0 mt-0.5">
            {evidence.type === 'link' ? <Link2 size={16} /> : <FileText size={16} />}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 break-all flex items-center gap-1.5">
              <span>{evidence.fileName}</span>
              {evidence.version > 1 && (
                <span className="bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0.2 rounded font-mono">
                  v{evidence.version}
                </span>
              )}
            </h4>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <User size={11} /> {evidence.uploadedByName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={11} />{' '}
                {new Date(evidence.uploadedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              {evidence.fileSize ? (
                <>
                  <span>•</span>
                  <span>{(evidence.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="shrink-0">{getStatusBadge()}</div>
      </div>

      {/* Verification Note (if Revision Needed) */}
      {evidence.verificationStatus === 'needs_revision' && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
          <div className="font-bold text-rose-800 flex items-center gap-1.5">
            <MessageSquare size={14} /> Catatan Verifikator ({evidence.verifiedByName || 'Verifikator'}):
          </div>
          <p className="text-rose-900 leading-relaxed italic">
            "{evidence.verificationNote || 'Dokumen perlu diperbaiki sesuai petunjuk.'}"
          </p>
        </div>
      )}

      {/* Action Buttons Toolbar */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs flex-wrap">
        
        {/* Left Side: Open Link & History */}
        <div className="flex items-center gap-2">
          <a
            href={evidence.driveUrl || evidence.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 text-[11px]"
          >
            <Eye size={13} />
            <span>Lihat File Google Drive</span>
            <ExternalLink size={11} />
          </a>

          <button
            onClick={() => onOpenHistory(evidence.id)}
            className="text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition inline-flex items-center gap-1 text-[11px]"
            title="Riwayat Versi"
          >
            <History size={13} />
            <span>Riwayat</span>
          </button>
        </div>

        {/* Right Side: Replace, Delete, Verify */}
        <div className="flex items-center gap-2">
          
          {/* Verifikator verification button */}
          {canVerify && onOpenVerifyModal && (
            <button
              onClick={() => onOpenVerifyModal(evidence)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 text-[11px] shadow-xs"
            >
              <ShieldCheck size={13} />
              <span>Verifikasi</span>
            </button>
          )}

          {/* Replace button */}
          {canEditOrDelete && (
            <button
              onClick={() =>
                evidence.type === 'link'
                  ? onReplaceLink(evidence.id)
                  : onReplaceFile(evidence.id)
              }
              className="text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition inline-flex items-center gap-1 text-[11px]"
              title="Ganti Evidence"
            >
              <RefreshCw size={13} />
              <span>Ganti</span>
            </button>
          )}

          {/* Delete button */}
          {canEditOrDelete && (
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={deleting}
              className="text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg transition inline-flex items-center gap-1 text-[11px] cursor-pointer"
              title="Hapus Evidence"
            >
              <Trash2 size={13} />
              <span>Hapus</span>
            </button>
          )}

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="Konfirmasi Hapus Bukti Dukung"
        itemName={evidence.fileName}
        message="Apakah Anda yakin ingin menghapus dokumen evidence ini? Data dan catatan histori evidence akan dihapus secara permanen."
        confirmButtonText="Hapus Evidence"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={() => setShowDeleteModal(false)}
      />

    </div>
  );
};
