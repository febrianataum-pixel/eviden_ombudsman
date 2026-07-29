import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Lock,
  UserPlus,
  LogIn,
  UserCheck
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'google' | 'login' | 'register'>('google');
  
  // Email/Password Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google login error:', err);
      setError('Gagal masuk dengan Google. Pastikan popup tidak diblokir oleh browser.');
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim() || !password) {
      setError('Silakan isi Email dan Kata Sandi.');
      return;
    }

    try {
      await loginWithEmail(email.trim(), password);
    } catch (err: any) {
      console.error('Email login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email atau kata sandi tidak cocok. Silakan periksa kembali.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Terlalu banyak percobaan gagal. Silakan coba lagi nanti.');
      } else {
        setError('Gagal masuk dengan Email. Pastikan email dan kata sandi benar.');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!displayName.trim()) {
      setError('Silakan masukkan Nama Lengkap Anda.');
      return;
    }
    if (!email.trim()) {
      setError('Silakan masukkan Email valid.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok dengan kata sandi.');
      return;
    }

    try {
      await registerWithEmail(email.trim(), password, displayName.trim());
      setSuccessMsg('Pendaftaran berhasil! Anda otomatis masuk ke aplikasi.');
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email ini sudah terdaftar. Silakan pilih tab "Masuk Email" atau gunakan email lain.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Format email tidak valid.');
      } else if (err.code === 'auth/weak-password') {
        setError('Kata sandi terlalu lemah. Gunakan kombinasi minimal 6 karakter.');
      } else {
        setError('Gagal mendaftarkan akun. Silakan periksa koneksi internet Anda.');
      }
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
                <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">E-VIDEN DINSOS PPPA</h1>
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
            <span>E-VIDEN DINSOS PPPA — Ombudsman RI 2026</span>
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="md:col-span-6 p-8 md:p-10 flex flex-col justify-center bg-white">
          <div className="space-y-5">
            <div className="text-center md:text-left space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Portal Masuk & Registrasi</h3>
              <p className="text-xs text-slate-500">
                Masuk dengan Google atau daftar akun email baru untuk memulai.
              </p>
            </div>

            {/* Authentication Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setActiveTab('google'); setError(null); }}
                className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'google' 
                    ? 'bg-white text-slate-900 shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(null); }}
                className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'login' 
                    ? 'bg-white text-slate-900 shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn size={13} />
                <span>Masuk Email</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError(null); }}
                className={`flex-1 py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'register' 
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-bold' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus size={13} />
                <span>Registrasi</span>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-start gap-2">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: GOOGLE SIGN-IN */}
            {activeTab === 'google' && (
              <div className="space-y-4 pt-2">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Metode tercepat. Masuk secara instan menggunakan akun Google instansi atau pribadi Anda.
                </p>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
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
              </div>
            )}

            {/* TAB 2: EMAIL LOGIN */}
            {activeTab === 'login' && (
              <form onSubmit={handleEmailLogin} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@dinsos.go.id"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <LogIn size={15} />
                  <span>{loading ? 'Memproses...' : 'Masuk Akun'}</span>
                </button>
              </form>
            )}

            {/* TAB 3: REGISTRATION */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <UserCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ahmad Subagyo, S.ST"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operator@dinsos.go.id"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Konfirmasi
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-2.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition text-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  <UserPlus size={15} />
                  <span>{loading ? 'Mendaftarkan...' : 'Daftar Akun Baru'}</span>
                </button>
              </form>
            )}

            {/* Role Info Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-900 block">
                Ketentuan Hak Akses Akun Terdaftar:
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Pengguna yang baru mendaftar/login pertama kali akan mendapatkan hak akses dasar sebagai <strong>Operator</strong>. Role dapat disesuaikan (menjadi <strong>Verifikator</strong> atau <strong>Admin</strong>) oleh Administrator Sistem.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

