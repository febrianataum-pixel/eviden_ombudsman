import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { 
  FileSpreadsheet, 
  Printer, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Download,
  AlertCircle
} from 'lucide-react';

interface ReportsViewProps {
  onlyMissing?: boolean;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onlyMissing = false }) => {
  const { dimensions, indicators, requirements, evidences, exportReportToExcel } = useData();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDim, setSelectedDim] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showOnlyMissing, setShowOnlyMissing] = useState<boolean>(onlyMissing);

  // Table rows calculation
  const reportRows = requirements.map((req, idx) => {
    const dim = dimensions.find((d) => d.id === req.dimensionId);
    const ind = indicators.find((i) => i.id === req.indicatorId);
    const reqEvidences = evidences.filter((e) => e.requirementId === req.id);

    const isSecondary = dim?.isSecondaryData;
    const hasEvidence = reqEvidences.length > 0;

    let status = 'BELUM ADA';
    if (isSecondary) {
      status = 'DATA SEKUNDER';
    } else if (hasEvidence) {
      if (reqEvidences.some((e) => e.verificationStatus === 'verified')) {
        status = 'TERVERIFIKASI';
      } else if (reqEvidences.some((e) => e.verificationStatus === 'needs_revision')) {
        status = 'PERLU PERBAIKAN';
      } else {
        status = 'MENUNGGU VERIFIKASI';
      }
    }

    return {
      index: idx + 1,
      req,
      dim,
      ind,
      reqEvidences,
      isSecondary,
      status,
    };
  });

  // Filter logic
  const filteredRows = reportRows.filter((row) => {
    if (showOnlyMissing && (row.status === 'TERVERIFIKASI' || row.isSecondary)) {
      return false;
    }

    if (selectedDim !== 'all' && row.req.dimensionId !== selectedDim) return false;
    if (selectedStatus !== 'all' && row.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchReq = row.req.title.toLowerCase().includes(q) || row.req.description.toLowerCase().includes(q);
      const matchInd = row.ind?.title.toLowerCase().includes(q);
      const matchFile = row.reqEvidences.some((e) => e.fileName.toLowerCase().includes(q));
      if (!matchReq && !matchInd && !matchFile) return false;
    }

    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0 font-sans">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {showOnlyMissing ? 'Daftar Kekurangan Evidence (Dokumen Belum Lengkap)' : 'Rekap Kelengkapan Evidence Ombudsman 2026'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Laporan komprehensif rekapitulasi bukti dukung untuk koordinasi internal dan verifikasi.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowOnlyMissing(!showOnlyMissing)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
              showOnlyMissing
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <AlertCircle size={14} />
            <span>{showOnlyMissing ? 'Tampilkan Semua' : 'Filter Belum Lengkap'}</span>
          </button>

          <button
            onClick={exportReportToExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <FileSpreadsheet size={16} />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Printer size={16} />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Title Header */}
      <div className="hidden print:block text-center space-y-1 mb-6 text-slate-900">
        <h2 className="text-xl font-bold uppercase">REKAPITULASI EVIDENCE PENILAIAN OPINI OMBUDSMAN 2026</h2>
        <p className="text-xs font-semibold">DINAS SOSIAL PPPA KABUPATEN BLORA — E-VIDEN OMBUDSMAN 2026</p>
        <p className="text-[10px] text-slate-600">Dicetak pada: {new Date().toLocaleDateString('id-ID')} | Status Real-time</p>
      </div>

      {/* Filter Controls (Hidden in Print) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kebutuhan dokumen atau indikator..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedDim}
            onChange={(e) => setSelectedDim(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-1.5 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Dimensi</option>
            {dimensions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.title}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-1.5 focus:bg-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="BELUM ADA">Belum Ada</option>
            <option value="MENUNGGU VERIFIKASI">Menunggu Verifikasi</option>
            <option value="TERVERIFIKASI">Terverifikasi</option>
            <option value="PERLU PERBAIKAN">Perlu Perbaikan</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs print:border-slate-300 print:bg-white print:text-black">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider print:bg-slate-100 print:text-slate-900 print:border-slate-300">
                <th className="p-3 text-center w-10">No</th>
                <th className="p-3 w-28">Dimensi</th>
                <th className="p-3 w-44">Indikator</th>
                <th className="p-3">Kebutuhan Dokumen</th>
                <th className="p-3 w-32 text-center">Status</th>
                <th className="p-3 w-48">Evidence (File/Link)</th>
                <th className="p-3 w-32">Uploader / Tgl</th>
                <th className="p-3 w-36">Verifikator & Catatan</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 print:divide-slate-200">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada data dokumen ditemukan.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr
                    key={row.req.id}
                    className="hover:bg-slate-50 transition print:hover:bg-transparent"
                  >
                    <td className="p-3 text-center font-bold text-slate-500 print:text-black">{idx + 1}</td>
                    
                    <td className="p-3">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] border border-amber-200 print:text-black print:bg-slate-200">
                        {row.dim?.code}
                      </span>
                    </td>

                    <td className="p-3 font-semibold text-slate-800 print:text-black">
                      {row.ind?.title}
                    </td>

                    <td className="p-3">
                      <p className="font-bold text-slate-900 print:text-black">{row.req.title}</p>
                      <p className="text-[11px] text-slate-500 print:text-slate-600 line-clamp-1">{row.req.description}</p>
                    </td>

                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          row.status === 'TERVERIFIKASI'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : row.status === 'PERLU PERBAIKAN'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : row.status === 'MENUNGGU VERIFIKASI'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : row.status === 'DATA SEKUNDER'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    <td className="p-3 text-slate-700 print:text-black">
                      {row.reqEvidences.length > 0 ? (
                        <div className="space-y-1">
                          {row.reqEvidences.map((ev) => (
                            <a
                              key={ev.id}
                              href={ev.driveUrl || ev.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline block truncate max-w-[180px] print:text-black font-medium"
                            >
                              📄 {ev.fileName}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">-</span>
                      )}
                    </td>

                    <td className="p-3 text-[11px] text-slate-600 print:text-black">
                      {row.reqEvidences.length > 0 ? (
                        <div>
                          <span className="font-bold text-slate-900 block print:text-black">{row.reqEvidences[0].uploadedByName}</span>
                          <span>
                            {new Date(row.reqEvidences[0].uploadedAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="p-3 text-[11px] text-slate-600 print:text-black">
                      {row.reqEvidences.some((e) => e.verifiedByName) ? (
                        <div>
                          <span className="font-semibold text-slate-800 block print:text-black">
                            {row.reqEvidences.find((e) => e.verifiedByName)?.verifiedByName}
                          </span>
                          <span className="text-rose-600 text-[10px] block italic print:text-slate-700">
                            {row.reqEvidences.find((e) => e.verificationNote)?.verificationNote}
                          </span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
};
