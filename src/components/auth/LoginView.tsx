import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  User,
  Lock,
  LogIn,
  KeyRound
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, loginWithCredentials, loading } = useAuth();
  const [loginMode, setLoginMode] = useState<'credentials' | 'google'>('credentials');
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Gagal masuk dengan Google. Pastikan popup tidak diblokir oleh browser.');
    }
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Harap isi username/email dan password.');
      return;
    }

    setError(null);
    try {
      await loginWithCredentials(identifier, password);
    } catch (err: any) {
      setError(err.message || 'Username/Email atau Password tidak valid.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden z-10">
        
        {/* Left Side: Branding & Ombudsman Info */}
        <div className="md:col-span-6 bg-slate-900 p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 text-white">
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
                Sistem Pengumpulan Evidence Penilaian Opini Ombudsman 2026
              </h2>
              <p className="text-slate-300 text-xs leading-relaxed">
                Platform terintegrasi untuk pengelolaan, pengumpulan, verifikasi, dan pemantauan dokumen bukti dukung Penilaian Opini Pengawasan Pelayanan Publik secara akuntabel.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="mt-8 space-y-3">
              <div className="flex items-start gap-3 text-xs text-slate-200">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Dukungan Multi-Akun:</strong> Bebas masuk menggunakan Username & Password terdaftar atau akun Google.
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-200">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Sinkronisasi Google Drive:</strong> Penyimpanan evidence otomatis tersambung aman ke Google Drive.
                </span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-200">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Struktur Hierarki Lengkap:</strong> Mengacu pada instrumen Ombudsman (Input, Proses, Output, Pengaduan).
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
        <div className="md:col-span-6 p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Selamat Datang</h3>
              <p className="text-xs text-slate-500">
                Pilih metode masuk yang paling sesuai dengan akses Anda.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setLoginMode('credentials'); setError(null); }}
                className={`py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 ${
                  loginMode === 'credentials'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <KeyRound size={14} />
                <span>Username / Password</span>
              </button>

              <button
                type="button"
                onClick={() => { setLoginMode('google'); setError(null); }}
                className={`py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 ${
                  loginMode === 'google'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                <span>Akun Google</span>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Mode 1: Username & Password Form */}
            {loginMode === 'credentials' && (
              <form onSubmit={handleCredentialsLogin} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Username atau Email
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Masukkan username atau email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
                >
                  <LogIn size={16} />
                  <span>{loading ? 'Memproses...' : 'Masuk ke Sistem'}</span>
                </button>

                {/* Quick Fill Credentials Helper */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 font-medium mb-1.5">Akses Cepat (Akun Standar):</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setIdentifier('admin'); setPassword('admin123'); }}
                      className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] rounded-lg font-medium transition"
                    >
                      Admin (admin / admin123)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIdentifier('verifikator'); setPassword('verifikator123'); }}
                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-[10px] rounded-lg font-medium transition"
                    >
                      Verifikator (verifikator / verifikator123)
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIdentifier('operator'); setPassword('operator123'); }}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] rounded-lg font-medium transition"
                    >
                      Operator (operator / operator123)
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Mode 2: Google Login Button */}
            {loginMode === 'google' && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-3 disabled:opacity-50 text-xs group"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span>{loading ? 'Menghubungkan...' : 'Masuk dengan Akun Google'}</span>
                </button>
                <p className="text-[11px] text-slate-500 text-center leading-normal">
                  Pilih opsi ini untuk menghubungkan langsung akun Google Drive resmi Anda untuk upload dokumen.
                </p>
              </div>
            )}

            {/* Role Info Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-900 block">
                Hak Akses Peran Pengguna (Role):
              </span>
              <ul className="space-y-1 list-disc pl-4 text-slate-600">
                <li>
                  <strong className="text-amber-700">Admin:</strong> Kelola akun pengguna, atur role, dan atur master data.
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

