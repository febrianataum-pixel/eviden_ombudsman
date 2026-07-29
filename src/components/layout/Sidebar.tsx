import React from 'react';
import { 
  LayoutDashboard, 
  FileInput, 
  SlidersHorizontal, 
  BarChart2, 
  MessageSquare, 
  ListFilter, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Users, 
  FileSpreadsheet, 
  Database, 
  Settings,
  HeartHandshake,
  FolderTree,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
  counts?: {
    uncomplete: number;
    pending: number;
    revision: number;
    verified: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onClose,
  counts,
}) => {
  const { user } = useAuth();

  const navSections = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'PENILAIAN OMBUDSMAN 2026',
      items: [
        { id: 'dim-input', label: '01 - Dimensi Input', icon: FileInput, badge: 'Input' },
        { id: 'dim-proses', label: '02 - Dimensi Proses', icon: SlidersHorizontal, badge: 'Proses' },
        { id: 'dim-output', label: '03 - Dimensi Output', icon: BarChart2, badge: 'Sekunder' },
        { id: 'dim-pengaduan', label: '04 - Dimensi Pengaduan', icon: MessageSquare, badge: 'Aduan' },
      ],
    },
    {
      title: 'MONITORING EVIDENCE',
      items: [
        { id: 'mon-all', label: 'Semua Evidence', icon: ListFilter },
        { id: 'mon-uncomplete', label: 'Belum Lengkap', icon: AlertTriangle, count: counts?.uncomplete, color: 'text-amber-400' },
        { id: 'mon-pending', label: 'Menunggu Verifikasi', icon: Clock, count: counts?.pending, color: 'text-blue-400' },
        { id: 'mon-revision', label: 'Perlu Perbaikan', icon: XCircle, count: counts?.revision, color: 'text-rose-400' },
        { id: 'mon-verified', label: 'Terverifikasi', icon: CheckCircle2, count: counts?.verified, color: 'text-emerald-400' },
      ],
    },
    {
      title: 'PELAYANAN PUBLIK',
      items: [
        { id: 'trust', label: 'Kepercayaan Masyarakat', icon: HeartHandshake, badge: 'Min 30' },
      ],
    },
    {
      title: 'LAPORAN & REKAP',
      items: [
        { id: 'report-summary', label: 'Rekap Kelengkapan Evidence', icon: FileSpreadsheet },
        { id: 'report-missing', label: 'Daftar Kekurangan Evidence', icon: FolderTree },
      ],
    },
    ...(user?.role === 'admin'
      ? [
          {
            title: 'ADMINISTRASI',
            items: [
              { id: 'admin-users', label: 'Pengguna & Role', icon: Users },
              { id: 'admin-master', label: 'Master Data Indikator', icon: Database },
              { id: 'admin-settings', label: 'Pengaturan Sistem', icon: Settings },
            ],
          },
        ]
      : []),
  ];

  const handleItemClick = (id: string) => {
    onSelectView(id);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar element */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto custom-scrollbar`}
      >
        <div className="p-4 space-y-6">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-3 py-1">
                {sec.title}
              </h3>

              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition group ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          size={16}
                          className={`${
                            isActive ? 'text-white' : item.color || 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 ml-2">
                        {item.count !== undefined && item.count > 0 && (
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                        {item.badge && !item.count && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-800/80 text-amber-400 border border-slate-700/80'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight size={14} className="text-white/80" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-400">Versi Sistem</span>
            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">v2.6.0</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Ombudsman RI © 2026. Penilaian Opini Pengawasan Pelayanan Publik.
          </p>
        </div>
      </aside>
    </>
  );
};
