import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { EvidenceItem } from '../dimension/EvidenceItem';
import { VerificationModal } from '../verification/VerificationModal';
import { HistoryModal } from '../dimension/HistoryModal';
import { UploadModal } from '../dimension/UploadModal';
import { LinkModal } from '../dimension/LinkModal';
import { Evidence, VerificationStatus } from '../../types';
import { 
  Filter, 
  Search, 
  ListFilter, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';

interface MonitoringViewProps {
  filterType: string; // mon-all, mon-uncomplete, mon-pending, mon-revision, mon-verified
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({ filterType }) => {
  const { dimensions, indicators, requirements, evidences } = useData();
  const { user } = useAuth();

  const [selectedDimFilter, setSelectedDimFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [verifyModalState, setVerifyModalState] = useState<{ isOpen: boolean; evidence: Evidence | null }>({
    isOpen: false,
    evidence: null,
  });

  const [historyModalState, setHistoryModalState] = useState<{ isOpen: boolean; evidenceId: string; title: string }>({
    isOpen: false,
    evidenceId: '',
    title: '',
  });

  const [uploadModalState, setUploadModalState] = useState<{
    isOpen: boolean;
    requirementId: string;
    requirementTitle: string;
    evidenceIdToReplace?: string;
  }>({ isOpen: false, requirementId: '', requirementTitle: '' });

  const [linkModalState, setLinkModalState] = useState<{
    isOpen: boolean;
    requirementId: string;
    requirementTitle: string;
    evidenceIdToReplace?: string;
  }>({ isOpen: false, requirementId: '', requirementTitle: '' });

  const getTitle = () => {
    switch (filterType) {
      case 'mon-uncomplete':
        return { title: 'Dokumen Belum Lengkap', subtitle: 'Daftar kebutuhan dokumen yang belum diunggah atau membutuhkan perbaikan' };
      case 'mon-pending':
        return { title: 'Evidence Menunggu Verifikasi', subtitle: 'Daftar evidence yang diunggah dan membutuhkan pemeriksaan verifikator' };
      case 'mon-revision':
        return { title: 'Evidence Perlu Perbaikan', subtitle: 'Daftar dokumen yang dikembalikan verifikator dengan catatan perbaikan' };
      case 'mon-verified':
        return { title: 'Evidence Terverifikasi', subtitle: 'Daftar bukti dukung yang telah disetujui verifikator' };
      default:
        return { title: 'Semua Evidence', subtitle: 'Pemantauan seluruh dokumen bukti dukung Ombudsman 2026' };
    }
  };

  // Filter logic
  const filteredEvidences = evidences.filter((ev) => {
    // Tab filter
    if (filterType === 'mon-pending' && ev.verificationStatus !== 'pending') return false;
    if (filterType === 'mon-revision' && ev.verificationStatus !== 'needs_revision') return false;
    if (filterType === 'mon-verified' && ev.verificationStatus !== 'verified') return false;

    // Dimension dropdown filter
    if (selectedDimFilter !== 'all' && ev.dimensionId !== selectedDimFilter) return false;

    // Status dropdown filter
    if (selectedStatusFilter !== 'all' && ev.verificationStatus !== selectedStatusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchFile = ev.fileName.toLowerCase().includes(q);
      const matchUploader = ev.uploadedByName.toLowerCase().includes(q);
      const req = requirements.find((r) => r.id === ev.requirementId);
      const matchReq = req?.title.toLowerCase().includes(q) || req?.description.toLowerCase().includes(q);
      if (!matchFile && !matchUploader && !matchReq) return false;
    }

    return true;
  });

  // For "mon-uncomplete" tab: List requirements that have no evidence or need revision
  const uncompleteRequirements = requirements.filter((req) => {
    const dim = dimensions.find((d) => d.id === req.dimensionId);
    if (dim?.isSecondaryData) return false; // Exclude secondary

    if (selectedDimFilter !== 'all' && req.dimensionId !== selectedDimFilter) return false;

    const reqEvidences = evidences.filter((e) => e.requirementId === req.id);
    if (reqEvidences.length === 0) return true; // Missing
    return reqEvidences.some((e) => e.verificationStatus === 'needs_revision');
  });

  const pageInfo = getTitle();

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{pageInfo.title}</h1>
          <p className="text-xs text-slate-500 mt-1">{pageInfo.subtitle}</p>
        </div>

        {/* Global Filter Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedDimFilter}
            onChange={(e) => setSelectedDimFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Dimensi</option>
            {dimensions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.title}
              </option>
            ))}
          </select>

          {filterType === 'mon-all' && (
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu Verifikasi</option>
              <option value="verified">Terverifikasi</option>
              <option value="needs_revision">Perlu Perbaikan</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Content List */}
      {filterType === 'mon-uncomplete' ? (
        <div className="space-y-3">
          {uncompleteRequirements.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs space-y-2 shadow-xs">
              <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
              <p className="font-bold text-slate-900">Luar Biasa!</p>
              <p>Tidak ada dokumen yang kekurangan evidence pada kriteria ini.</p>
            </div>
          ) : (
            uncompleteRequirements.map((req) => {
              const dim = dimensions.find((d) => d.id === req.dimensionId);
              const ind = indicators.find((i) => i.id === req.indicatorId);
              const reqEvs = evidences.filter((e) => e.requirementId === req.id);
              const isRevision = reqEvs.some((e) => e.verificationStatus === 'needs_revision');

              return (
                <div
                  key={req.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs hover:border-slate-300 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {dim?.code}
                        </span>
                        <span className="text-xs font-semibold text-blue-700">
                          {ind?.title}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{req.number}. {req.title}</h3>
                      <p className="text-xs text-slate-600 mt-0.5">{req.description}</p>
                    </div>

                    <div>
                      {isRevision ? (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <XCircle size={12} /> PERLU PERBAIKAN
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          <AlertTriangle size={12} /> BELUM ADA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions for Operator */}
                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                    <button
                      onClick={() =>
                        setUploadModalState({
                          isOpen: true,
                          requirementId: req.id,
                          requirementTitle: req.title,
                        })
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition"
                    >
                      Upload Evidence
                    </button>
                    <button
                      onClick={() =>
                        setLinkModalState({
                          isOpen: true,
                          requirementId: req.id,
                          requirementTitle: req.title,
                        })
                      }
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-xl transition border border-slate-200"
                    >
                      Tambah Link
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Evidences List View */
        <div className="space-y-3">
          {filteredEvidences.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs space-y-2 shadow-xs">
              <FileText size={32} className="mx-auto text-slate-400" />
              <p className="font-bold text-slate-900">Tidak ada evidence ditemukan</p>
              <p>Belum ada bukti dukung yang cocok dengan kriteria filter saat ini.</p>
            </div>
          ) : (
            filteredEvidences.map((evidence) => {
              const req = requirements.find((r) => r.id === evidence.requirementId);
              const ind = indicators.find((i) => i.id === evidence.indicatorId);
              const dim = dimensions.find((d) => d.id === evidence.dimensionId);

              return (
                <div
                  key={evidence.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {dim?.code || '01'}
                    </span>
                    <span className="text-slate-800 font-semibold">{ind?.title}</span>
                    <span>•</span>
                    <span className="text-blue-700">{req?.title}</span>
                  </div>

                  <EvidenceItem
                    evidence={evidence}
                    requirementTitle={req?.title || ''}
                    onReplaceFile={(evId) =>
                      setUploadModalState({
                        isOpen: true,
                        requirementId: evidence.requirementId,
                        requirementTitle: req?.title || '',
                        evidenceIdToReplace: evId,
                      })
                    }
                    onReplaceLink={(evId) =>
                      setLinkModalState({
                        isOpen: true,
                        requirementId: evidence.requirementId,
                        requirementTitle: req?.title || '',
                        evidenceIdToReplace: evId,
                      })
                    }
                    onOpenHistory={(evId) =>
                      setHistoryModalState({
                        isOpen: true,
                        evidenceId: evId,
                        title: req?.title || '',
                      })
                    }
                    onOpenVerifyModal={(ev) =>
                      setVerifyModalState({
                        isOpen: true,
                        evidence: ev,
                      })
                    }
                  />
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modals */}
      <VerificationModal
        isOpen={verifyModalState.isOpen}
        evidence={verifyModalState.evidence}
        onClose={() => setVerifyModalState({ isOpen: false, evidence: null })}
      />

      <HistoryModal
        isOpen={historyModalState.isOpen}
        evidenceId={historyModalState.evidenceId}
        requirementTitle={historyModalState.title}
        onClose={() => setHistoryModalState({ isOpen: false, evidenceId: '', title: '' })}
      />

      <UploadModal
        isOpen={uploadModalState.isOpen}
        requirementId={uploadModalState.requirementId}
        requirementTitle={uploadModalState.requirementTitle}
        evidenceIdToReplace={uploadModalState.evidenceIdToReplace}
        onClose={() => setUploadModalState({ isOpen: false, requirementId: '', requirementTitle: '' })}
      />

      <LinkModal
        isOpen={linkModalState.isOpen}
        requirementId={linkModalState.requirementId}
        requirementTitle={linkModalState.requirementTitle}
        evidenceIdToReplace={linkModalState.evidenceIdToReplace}
        onClose={() => setLinkModalState({ isOpen: false, requirementId: '', requirementTitle: '' })}
      />

    </div>
  );
};
