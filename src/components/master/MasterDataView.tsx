import React from 'react';
import { useData } from '../../context/DataContext';
import { Database, FileText, FolderTree } from 'lucide-react';

export const MasterDataView: React.FC = () => {
  const { dimensions, indicators, requirements } = useData();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1 text-blue-700">
          <Database size={20} />
          <h1 className="text-xl font-bold text-slate-900">Master Data Penilaian Opini Ombudsman 2026</h1>
        </div>
        <p className="text-xs text-slate-500">
          Struktur hierarki resmi (Dimensi → Indikator → Kebutuhan Dokumen Checklist).
        </p>
      </div>

      {/* Dimensions Loop */}
      <div className="space-y-6">
        {dimensions.map((dim) => {
          const dimInds = indicators.filter((i) => i.dimensionId === dim.id);

          return (
            <div key={dim.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="bg-amber-500 font-black text-white text-xs px-2.5 py-0.5 rounded">
                  {dim.code}
                </span>
                <h2 className="text-lg font-bold text-slate-900">{dim.title}</h2>
              </div>

              <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                {dimInds.map((ind) => {
                  const indReqs = requirements.filter((r) => r.indicatorId === ind.id);

                  return (
                    <div key={ind.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-blue-700 font-bold">{ind.code}</span>
                        <h3 className="text-xs font-bold text-slate-900">{ind.title}</h3>
                      </div>

                      <div className="space-y-1.5 pl-4 pt-1">
                        {indReqs.map((req) => (
                          <div key={req.id} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className="text-slate-400 text-[10px]">•</span>
                            <div>
                              <p className="font-semibold text-slate-900">{req.number}. {req.title}</p>
                              <p className="text-[11px] text-slate-500">{req.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
