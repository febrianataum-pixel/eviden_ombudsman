import React from 'react';
import { useData } from '../../context/DataContext';
import { X, Clock, FileText, ExternalLink, History, User } from 'lucide-react';

interface HistoryModalProps {
  evidenceId: string;
  requirementTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  evidenceId,
  requirementTitle,
  isOpen,
  onClose,
}) => {
  const { evidenceHistory } = useData();

  if (!isOpen) return null;

  const historyList = evidenceHistory.filter((h) => h.evidenceId === evidenceId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-900">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <History size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Riwayat Versi Dokumen</h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{requirementTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* History Timeline */}
        <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {historyList.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Belum ada riwayat perubahan versi untuk dokumen ini.
            </div>
          ) : (
            <div className="relative border-l border-slate-200 ml-3 pl-6 space-y-6">
              {historyList.map((item, idx) => (
                <div key={item.id} className="relative group">
                  
                  {/* Circle Marker */}
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-xs" />

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase bg-slate-200 px-2 py-0.5 rounded">
                        {item.action === 'uploaded' ? 'Versi Perdana' : item.action === 'replaced' ? 'Penggantian File' : 'Pembaruan Link'}
                      </span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(item.uploadedAt).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
                      <FileText size={14} />
                      <span>{item.fileName}</span>
                    </p>

                    {(item.driveUrl || item.externalUrl) && (
                      <a
                        href={item.driveUrl || item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 inline-block"
                      >
                        <span>Lihat Versi Ini</span>
                        <ExternalLink size={10} />
                      </a>
                    )}

                    {item.note && (
                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                        Catatan: "{item.note}"
                      </p>
                    )}

                    <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                      <User size={12} />
                      <span>Oleh: {item.uploadedByName}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
