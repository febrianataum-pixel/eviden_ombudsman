import React from 'react';
import { useData } from '../../context/DataContext';
import { 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  FolderCheck, 
  HardDrive, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToDimension: (dimId: string) => void;
  onNavigateToMonitoring: (viewId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToDimension,
  onNavigateToMonitoring,
}) => {
  const { dimensions, indicators, requirements, evidences } = useData();

  // Filter out secondary data requirements (Dimensi Output)
  const nonSecondaryRequirements = requirements.filter((r) => {
    const dim = dimensions.find((d) => d.id === r.dimensionId);
    return !dim?.isSecondaryData;
  });

  const totalRequirementsCount = nonSecondaryRequirements.length;

  // Requirement with evidence uploaded
  const requirementsWithEvidence = nonSecondaryRequirements.filter((req) =>
    evidences.some((ev) => ev.requirementId === req.id)
  );

  const filledCount = requirementsWithEvidence.length;
  const missingCount = totalRequirementsCount - filledCount;

  // Status counts
  const pendingCount = evidences.filter((e) => e.verificationStatus === 'pending').length;
  const verifiedCount = evidences.filter((e) => e.verificationStatus === 'verified').length;
  const revisionCount = evidences.filter((e) => e.verificationStatus === 'needs_revision').length;

  // Percentage overall
  const overallPercentage = totalRequirementsCount > 0
    ? Math.round((filledCount / totalRequirementsCount) * 100)
    : 0;

  // Dimension progress calculation
  const getDimensionProgress = (dimId: string) => {
    const dim = dimensions.find((d) => d.id === dimId);
    if (dim?.isSecondaryData) return { total: 0, filled: 0, percent: 100, isSecondary: true };

    const dimReqs = requirements.filter((r) => r.dimensionId === dimId);
    const total = dimReqs.length;
    if (total === 0) return { total: 0, filled: 0, percent: 0, isSecondary: false };

    const filled = dimReqs.filter((r) => evidences.some((e) => e.requirementId === r.id)).length;
    const percent = Math.round((filled / total) * 100);

    return { total, filled, percent, isSecondary: false };
  };

  // Requirements needing attention (Belum Ada or Perlu Perbaikan)
  const uncompleteOrRevisionReqs = nonSecondaryRequirements.filter((req) => {
    const reqEvidences = evidences.filter((e) => e.requirementId === req.id);
    if (reqEvidences.length === 0) return true;
    return reqEvidences.some((e) => e.verificationStatus === 'needs_revision');
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
              <TrendingUp size={14} /> Ringkasan Progres Real-Time
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              E-VIDEN OMBUDSMAN 2026
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl font-medium">
              Sistem Pengumpulan Evidence Penilaian Opini Pengawasan Pelayanan Publik Ombudsman RI — <span className="text-slate-900 font-bold">DINAS SOSIAL PPPA KAB. BLORA</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToDimension('dim-input')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <span>Mulai Input Evidence</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        
        {/* Total Indikator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase">Total Indikator</span>
            <FileText size={18} className="text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{indicators.length}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">21 Terdata</span>
          </div>
        </div>

        {/* Kebutuhan Dokumen */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase">Total Kebutuhan</span>
            <FolderCheck size={18} className="text-blue-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-blue-600">{totalRequirementsCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Checklist Dokumen</span>
          </div>
        </div>

        {/* Sudah Ada Evidence */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase">Ada Evidence</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600">{filledCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {totalRequirementsCount > 0 ? Math.round((filledCount / totalRequirementsCount) * 100) : 0}% Terisi
            </span>
          </div>
        </div>

        {/* Belum Ada Evidence */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase">Belum Ada</span>
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-600">{missingCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Perlu Diupload</span>
          </div>
        </div>

        {/* Menunggu Verifikasi */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase">Menunggu</span>
            <Clock size={18} className="text-blue-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-blue-500">{pendingCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Butuh Verifikasi</span>
          </div>
        </div>

        {/* Terverifikasi */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase">Terverifikasi</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600">{verifiedCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Disetujui</span>
          </div>
        </div>

        {/* Perlu Perbaikan */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase">Perlu Perbaikan</span>
            <XCircle size={18} className="text-rose-600" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-600">{revisionCount}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Revisi</span>
          </div>
        </div>

      </div>

      {/* Overall Progress & Dimension Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Overall Progress & Per Dimension */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Kelengkapan Evidence Overall Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Kelengkapan Evidence Keseluruhan</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Persentase pemenuhan dokumen wajib (Dimensi Output Sekunder tidak dihitung dalam pembagi).
                </p>
              </div>
              <span className="text-3xl font-black text-blue-600">{overallPercentage}%</span>
            </div>

            {/* Custom Styled Progress Bar */}
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <span>Terisi: <strong>{filledCount}</strong> / {totalRequirementsCount} dokumen</span>
              <span>Kekurangan: <strong className="text-amber-600">{missingCount}</strong> dokumen</span>
            </div>
          </div>

          {/* Progress Per Dimensi */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Progres Per Dimensi Penilaian</span>
              <span className="text-xs text-slate-500 font-normal">4 Dimensi</span>
            </h3>

            <div className="space-y-4">
              {dimensions.map((dim) => {
                const prog = getDimensionProgress(dim.id);

                return (
                  <div
                    key={dim.id}
                    onClick={() => onNavigateToDimension(dim.id)}
                    className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl hover:border-blue-400 transition cursor-pointer group space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {dim.code}
                        </span>
                        <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                          {dim.title}
                        </span>
                        {dim.isSecondaryData && (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                            DATA SEKUNDER
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">
                          {prog.isSecondary ? '100%' : `${prog.percent}%`}
                        </span>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-900 transition" />
                      </div>
                    </div>

                    {!prog.isSecondary ? (
                      <>
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              prog.percent >= 80
                                ? 'bg-emerald-600'
                                : prog.percent >= 50
                                ? 'bg-blue-600'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${prog.percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <span>{prog.filled} dari {prog.total} kebutuhan terisi</span>
                          <span>{prog.total - prog.filled} belum terisi</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        Menggunakan data sekunder resmi BPS, Kemendagri, KemenPAN-RB, Bappenas.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Quick Action Box & Drive Structure */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick List: Dokumen yang Perlu Dilengkapi */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Perlu Dilengkapi</h3>
              </div>
              <button
                onClick={() => onNavigateToMonitoring('mon-uncomplete')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <span>Lihat Semua ({uncompleteOrRevisionReqs.length})</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
              {uncompleteOrRevisionReqs.length === 0 ? (
                <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <CheckCircle2 size={28} className="mx-auto text-emerald-600" />
                  <p className="text-xs font-semibold text-slate-800">Seluruh Dokumen Sudah Memiliki Evidence!</p>
                  <p className="text-[11px] text-slate-500">
                    Kerja bagus! Seluruh bukti dukung telah berhasil diunggah.
                  </p>
                </div>
              ) : (
                uncompleteOrRevisionReqs.slice(0, 5).map((req) => {
                  const dim = dimensions.find((d) => d.id === req.dimensionId);
                  const ind = indicators.find((i) => i.id === req.indicatorId);
                  const reqEvs = evidences.filter((e) => e.requirementId === req.id);
                  const isRevision = reqEvs.some((e) => e.verificationStatus === 'needs_revision');

                  return (
                    <div
                      key={req.id}
                      onClick={() => onNavigateToDimension(req.dimensionId)}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-amber-400 transition cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-500">
                          [{dim?.code}] {ind?.title}
                        </span>
                        {isRevision ? (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                            PERLU PERBAIKAN
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                            BELUM ADA
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{req.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{req.description}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        {/* Google Drive Folder Structure Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <HardDrive size={20} className="text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Struktur Google Drive</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Seluruh bukti dukung diorganisir otomatis ke dalam Google Drive resmi:
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-mono space-y-1">
              <div className="font-bold text-amber-700 flex items-center gap-1.5">
                📁 OMBUDSMAN 2026/
              </div>
              <div className="pl-4 text-slate-600">├── 📁 01 - DIMENSI INPUT/</div>
              <div className="pl-4 text-slate-600">├── 📁 02 - DIMENSI PROSES/</div>
              <div className="pl-4 text-slate-600">├── 📁 03 - DIMENSI OUTPUT/</div>
              <div className="pl-4 text-slate-600">└── 📁 04 - DIMENSI PENGADUAN/</div>
            </div>

            <a
              href="https://drive.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition pt-1"
            >
              <span>Buka Google Drive Utama</span>
              <ExternalLink size={14} />
            </a>
          </div>

        </div>

      </div>

    </div>
  );
};
