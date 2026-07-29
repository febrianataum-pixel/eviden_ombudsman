import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Sparkles, 
  FileCheck, 
  Cloud, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Gagal masuk dengan Google. Pastikan popup tidak diblokir oleh browser.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden z-10">
        
        {/* Left Side: Branding & Ombudsman Info */}
        <div className="md:col-span-7 bg-slate-900 p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 text-white">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Sparkles size={24} className="text-amber-400" />
                </div>
              </div>
              <div>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Sistem Resmi 2026
                </span>
                <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">E-VIDEN OMBUDSMAN</h1>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-100 leading-snug">
                Sistem Pengumpulan Evidence Penilaian Opini Ombudsman Tahun 2026
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Platform terintegrasi untuk pengelolaan, pengumpulan, verifikasi, dan pemantauan dokumen bukti dukung Penilaian Opini Pengawasan Pelayanan Publik secara akuntabel.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-3">
              <div className="flex items-start gap-3 text-xs text-slate-200">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Penyimpanan Google Drive Resmi:</strong> Seluruh file evidence tersimpan aman di Google Drive dengan struktur folder otomatis.
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-200">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Struktur Hierarki Lengkap:</strong> Mengacu pada instrumen Ombudsman 2026 (Input, Proses, Output, dan Pengaduan).
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-200">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Alur Verifikasi Bereputasi:</strong> Fitur catatan perbaikan, jejak riwayat revisi, dan audit trail transparan.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-2 text-slate-400 text-xs">
            <ShieldCheck size={16} className="text-blue-400" />
            <span>Hak Cipta © 2026 Ombudsman Republik Indonesia.</span>
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="md:col-span-5 p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="space-y-6">
            <div className="text-center md:text-left space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Selamat Datang</h3>
              <p className="text-xs text-slate-500">
                Silakan masuk menggunakan akun Google resmi instansi Anda.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-3 disabled:opacity-50 text-sm group"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
            </button>

            {/* Role Info Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-900 block mb-1">
                Akses Peran Pengguna (Role):
              </span>
              <ul className="space-y-1 list-disc pl-4 text-slate-600">
                <li>
                  <strong className="text-amber-700">Admin:</strong> Kelola akun, atur role, dan kelola master data.
                </li>
                <li>
                  <strong className="text-blue-700">Verifikator:</strong> Periksa evidence & berikan catatan persetujuan/revisi.
                </li>
                <li>
                  <strong className="text-emerald-700">Operator:</strong> Upload file/link evidence ke Google Drive & pantau status.
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
