import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LogOut, 
  User as UserIcon, 
  Shield, 
  CheckCircle, 
  FileCheck, 
  Search,
  Menu,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  currentView,
}) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1"><Shield size={12}/> ADMIN</span>;
      case 'verifikator':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1"><CheckCircle size={12}/> VERIFIKATOR</span>;
      default:
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1"><FileCheck size={12}/> OPERATOR</span>;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left section: Hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 p-0.5 flex items-center justify-center shadow-xs">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Sparkles size={20} className="text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg text-slate-900">E-VIDEN</span>
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded tracking-wider">OMBUDSMAN 2026</span>
              </div>
              <p className="text-[11px] font-semibold text-amber-700 hidden sm:block">DINAS SOSIAL PPPA KAB. BLORA</p>
            </div>
          </div>
        </div>

        {/* Middle section: Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari indikator, kebutuhan dokumen, atau uploader..."
              className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Right section: User Profile & Actions */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-800 max-w-[140px] truncate">
                {user.displayName}
              </span>
              <div className="mt-0.5">{getRoleBadge(user.role)}</div>
            </div>

            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-9 h-9 rounded-full ring-2 ring-slate-200 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm ring-2 ring-slate-200">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            )}

            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition border border-slate-200"
              title="Keluar dari Aplikasi"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-500">Belum Login</div>
        )}

      </div>
    </header>
  );
};
