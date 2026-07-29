import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Evidence, DocumentRequirement, Indicator, Dimension } from '../../types';
import { EvidenceItem } from './EvidenceItem';
import { UploadModal } from './UploadModal';
import { LinkModal } from './LinkModal';
import { HistoryModal } from './HistoryModal';
import { VerificationModal } from '../verification/VerificationModal';
import { 
  ChevronDown, 
  ChevronUp, 
  Upload, 
  Link2, 
  CheckCircle2, 
  AlertTriangle, 
  FileCheck, 
  Info,
  Sparkles,
  Layers
} from 'lucide-react';

interface DimensionViewProps {
  dimensionId: string;
}

export const DimensionView: React.FC<DimensionViewProps> = ({ dimensionId }) => {
  const { dimensions, indicators, requirements, evidences } = useData();
  const { user } = useAuth();

  const dimension = dimensions.find((d) => d.id === dimensionId);

  // Indicators belonging to this dimension
  const dimIndicators = indicators.filter((i) => i.dimensionId === dimensionId);

  // Expanded indicator state
  const [expandedIndicators, setExpandedIndicators] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    dimIndicators.forEach((ind, idx) => {
      init[ind.id] = idx === 0; // Expand first indicator by default
    });
    return init;
  });

  // Modal States
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

  const [historyModalState, setHistoryModalState] = useState<{
    isOpen: boolean;
    evidenceId: string;
    requirementTitle: string;
  }>({ isOpen: false, evidenceId: '', requirementTitle: '' });

  const [verifyModalState, setVerifyModalState] = useState<{
    isOpen: boolean;
    evidence: Evidence | null;
  }>({ isOpen: false, evidence: null });

  if (!dimension) {
    return (
      <div className="p-8 text-center text-slate-400">
        Dimensi tidak ditemukan.
      </div>
    );
  }

  // Calculate dimension progress
  const dimRequirements = requirements.filter((r) => r.dimensionId === dimensionId);
  const totalDimReqs = dimRequirements.length;
  const filledDimReqs = dimRequirements.filter((r) =>
    evidences.some((e) => e.requirementId === r.id)
  ).length;

  const toggleExpand = (indId: string) => {
    setExpandedIndicators((prev) => ({ ...prev, [indId]: !prev[indId] }));
  };

  const isOperatorOrAdmin = user?.role === 'operator' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      
      {/* Dimension Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded tracking-wider">
                {dimension.code}
              </span>
              <h1 className="text-xl md:text-2xl font-black text-slate-900">{dimension.title}</h1>
              {dimension.isSecondaryData && (
                <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded">
                  DATA SEKUNDER
                </span>
              )}
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-2xl">{dimension.description}</p>
          </div>

          {!dimension.isSecondaryData ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-right shrink-0">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Kebutuhan Terisi</span>
              <div className="text-xl font-black text-emerald-600 mt-0.5">
                {filledDimReqs} / {totalDimReqs}
              </div>
              <span className="text-[10px] text-slate-500">
                ({totalDimReqs > 0 ? Math.round((filledDimReqs / totalDimReqs) * 100) : 0}% Lengkap)
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Secondary Data Banner for Dimensi Output */}
      {dimension.isSecondaryData && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-800 flex items-start gap-3">
          <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Informasi Dimensi Output (Data Sekunder):</p>
            <p className="text-blue-700 leading-relaxed">
              Dimensi Output tidak memerlukan pengunggahan evidence utama oleh Operator karena nilai diambil dari data sekunder resmi yang telah terverifikasi (IKM KemenPAN-RB, IPM BPS, SPM Kemendagri, dan Prioritas Nasional Bappenas).
            </p>
          </div>
        </div>
      )}

      {/* Indicators Accordion List */}
      <div className="space-y-4">
        {dimIndicators.map((indicator) => {
          const isExpanded = !!expandedIndicators[indicator.id];
          const indReqs = requirements.filter((r) => r.indicatorId === indicator.id);
          const indFilled = indReqs.filter((r) => evidences.some((e) => e.requirementId === r.id)).length;
          const indTotal = indReqs.length;

          return (
            <div
              key={indicator.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition"
            >
              
              {/* Indicator Header Bar */}
              <div
                onClick={() => toggleExpand(indicator.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition select-none"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-amber-700 font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                    {indicator.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                        {indicator.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{indicator.title}</h3>
                    </div>
                    {indicator.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{indicator.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {!indicator.isSecondaryData ? (
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        indFilled === indTotal && indTotal > 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      Progress {indFilled}/{indTotal}
                    </span>
                  ) : null}

                  <button className="text-slate-500 hover:text-slate-900 p-1">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Indicator Expanded Body */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-5">
                  
                  {/* Special Note Box (e.g. 15 phone contacts for PR-07) */}
                  {indicator.specialNote && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                      <Sparkles size={18} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-bold text-amber-900">Catatan Khusus Ombudsman 2026:</p>
                        <p className="text-amber-800 leading-relaxed">{indicator.specialNote}</p>
                      </div>
                    </div>
                  )}

                  {/* Requirements Checklist Items */}
                  <div className="space-y-4">
                    {indReqs.map((req) => {
                      const reqEvidences = evidences.filter((e) => e.requirementId === req.id);
                      const hasEvidence = reqEvidences.length > 0;

                      return (
                        <div
                          key={req.id}
                          className={`p-4 rounded-xl border transition ${
                            hasEvidence
                              ? 'bg-white border-slate-200 shadow-xs'
                              : 'bg-white border-amber-200 shadow-xs'
                          }`}
                        >
                          
                          {/* Requirement Title Row */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              {/* Custom Checkbox Status */}
                              <div className="mt-0.5 shrink-0">
                                {hasEvidence ? (
                                  <div className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center font-bold">
                                    ✓
                                  </div>
                                ) : (
                                  <div className="w-5 h-5 rounded border border-slate-300 bg-slate-100 text-transparent flex items-center justify-center text-xs">
                                    [ ]
                                  </div>
                                )}
                              </div>

                              <div>
                                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                  <span>{req.number}. {req.title}</span>
                                  {req.required && (
                                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-semibold">
                                      Wajib
                                    </span>
                                  )}
                                </h4>
                                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                  {req.description}
                                </p>
                              </div>
                            </div>

                            {/* Requirement Status Indicator */}
                            <div className="shrink-0">
                              {!hasEvidence ? (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <AlertTriangle size={12} /> BELUM ADA
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {/* Evidence Items List */}
                          {hasEvidence && (
                            <div className="mt-4 space-y-2 pl-8 border-l-2 border-slate-200">
                              {reqEvidences.map((evidence) => (
                                <EvidenceItem
                                  key={evidence.id}
                                  evidence={evidence}
                                  requirementTitle={req.title}
                                  onReplaceFile={(evId) =>
                                    setUploadModalState({
                                      isOpen: true,
                                      requirementId: req.id,
                                      requirementTitle: req.title,
                                      evidenceIdToReplace: evId,
                                    })
                                  }
                                  onReplaceLink={(evId) =>
                                    setLinkModalState({
                                      isOpen: true,
                                      requirementId: req.id,
                                      requirementTitle: req.title,
                                      evidenceIdToReplace: evId,
                                    })
                                  }
                                  onOpenHistory={(evId) =>
                                    setHistoryModalState({
                                      isOpen: true,
                                      evidenceId: evId,
                                      requirementTitle: req.title,
                                    })
                                  }
                                  onOpenVerifyModal={(ev) =>
                                    setVerifyModalState({
                                      isOpen: true,
                                      evidence: ev,
                                    })
                                  }
                                />
                              ))}
                            </div>
                          )}

                          {/* Add Evidence Buttons (For Operators / Admin) */}
                          {isOperatorOrAdmin && !dimension.isSecondaryData && (
                            <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2.5 pl-8">
                              <button
                                onClick={() =>
                                  setUploadModalState({
                                    isOpen: true,
                                    requirementId: req.id,
                                    requirementTitle: req.title,
                                  })
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 shadow-xs"
                              >
                                <Upload size={14} />
                                <span>{hasEvidence ? 'Tambah File' : 'Upload Bukti'}</span>
                              </button>

                              <button
                                onClick={() =>
                                  setLinkModalState({
                                    isOpen: true,
                                    requirementId: req.id,
                                    requirementTitle: req.title,
                                  })
                                }
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
                              >
                                <Link2 size={14} />
                                <span>Tambah Link</span>
                              </button>

                              <button
                                onClick={() =>
                                  setUploadModalState({
                                    isOpen: true,
                                    requirementId: req.id,
                                    requirementTitle: req.title,
                                  })
                                }
                                title="Deteksi otomatis file yang diupload langsung di Google Drive"
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
                              >
                                <Sparkles size={14} className="text-amber-500" />
                                <span>Auto-Detect Google Drive</span>
                              </button>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={uploadModalState.isOpen}
        requirementId={uploadModalState.requirementId}
        requirementTitle={uploadModalState.requirementTitle}
        evidenceIdToReplace={uploadModalState.evidenceIdToReplace}
        onClose={() =>
          setUploadModalState({ isOpen: false, requirementId: '', requirementTitle: '' })
        }
      />

      <LinkModal
        isOpen={linkModalState.isOpen}
        requirementId={linkModalState.requirementId}
        requirementTitle={linkModalState.requirementTitle}
        evidenceIdToReplace={linkModalState.evidenceIdToReplace}
        onClose={() =>
          setLinkModalState({ isOpen: false, requirementId: '', requirementTitle: '' })
        }
      />

      <HistoryModal
        isOpen={historyModalState.isOpen}
        evidenceId={historyModalState.evidenceId}
        requirementTitle={historyModalState.requirementTitle}
        onClose={() =>
          setHistoryModalState({ isOpen: false, evidenceId: '', requirementTitle: '' })
        }
      />

      <VerificationModal
        isOpen={verifyModalState.isOpen}
        evidence={verifyModalState.evidence}
        onClose={() => setVerifyModalState({ isOpen: false, evidence: null })}
      />

    </div>
  );
};
