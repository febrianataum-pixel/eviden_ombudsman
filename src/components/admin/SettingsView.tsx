import React, { useState } from 'react';
import { Settings, HardDrive, ShieldCheck, Key, Database, Sparkles, FolderPlus, CheckCircle2, AlertCircle, Loader2, Globe, ExternalLink, Copy, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const SettingsView: React.FC = () => {
  const { syncDriveFolders } = useData();
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [resultMessage, setResultMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);

  const vercelDomain = 'evidendinsospppa.vercel.app';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(vercelDomain);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const handleSyncFolders = async () => {
    setSyncing(true);
    setResultMessage(null);
    setSyncStatus('Memulai pembuatan folder Google Drive...');

    try {
      const res = await syncDriveFolders((status) => {
        setSyncStatus(status);
      });
      setResultMessage({ success: res.success, text: res.message });
    } catch (err: any) {
      setResultMessage({
        success: false,
        text: err.message || 'Gagal mensinkronkan folder Google Drive.',
      });
    } finally {
      setSyncing(false);
      setSyncStatus('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pengaturan Sistem E-VIDEN</h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi aplikasi, integrasi Google Drive API, Authorized Domains Vercel, dan database Cloud Firestore.
          </p>
        </div>
      </div>

      {resultMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 shadow-xs ${
            resultMessage.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {resultMessage.success ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold">{resultMessage.success ? 'Berhasil' : 'Pemberitahuan'}</p>
            <p className="mt-0.5 leading-relaxed">{resultMessage.text}</p>
          </div>
        </div>
      )}

      {/* Authorized Domain Guide for Vercel */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white border border-blue-800 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-800/80 rounded-xl">
              <Globe size={20} className="text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Authorized Domain Google Login (Vercel)</h3>
              <p className="text-xs text-blue-200">Domain Vercel Anda yang diizinkan untuk Google Sign-In</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-900/60 border border-blue-400/30 px-3 py-1.5 rounded-xl text-xs font-mono">
            <span className="text-emerald-300 font-semibold">{vercelDomain}</span>
            <button
              onClick={copyToClipboard}
              className="text-blue-200 hover:text-white transition p-1 rounded cursor-pointer"
              title="Salin Domain"
            >
              {copiedDomain ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        <div className="p-4 bg-blue-950/50 border border-blue-800/60 rounded-xl text-xs space-y-2 text-blue-100">
          <p className="font-semibold text-white">Langkah Aktivasi di Firebase & Google Cloud Console:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-200 leading-relaxed">
            <li>
              Buka <a href="https://console.firebase.google.com/u/0/project/leafy-builder-371nt/authentication/settings" target="_blank" rel="noreferrer" className="underline text-amber-300 font-semibold hover:text-amber-200 inline-flex items-center gap-1">Firebase Auth Settings <ExternalLink size={10} /></a> &rarr; tab <strong>Authorized Domains</strong> &rarr; Klik <strong>Add Domain</strong> &rarr; masukkan <code className="bg-blue-900/80 px-1.5 py-0.5 rounded text-amber-300">{vercelDomain}</code>.
            </li>
            <li>
              Buka <a href="https://console.cloud.google.com/apis/credentials?project=leafy-builder-371nt" target="_blank" rel="noreferrer" className="underline text-amber-300 font-semibold hover:text-amber-200 inline-flex items-center gap-1">Google Cloud Credentials <ExternalLink size={10} /></a> &rarr; edit <strong>OAuth 2.0 Client ID</strong> &rarr; tambahkan URL berikut pada <strong>Authorized JavaScript origins</strong>:
              <br />
              <code className="bg-blue-900/80 px-1.5 py-0.5 rounded text-emerald-300 font-mono mt-1 inline-block">https://evidendinsospppa.vercel.app</code>
            </li>
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Google Drive Configuration Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <HardDrive size={18} />
              <span>Integrasi Google Drive API v3</span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Folder Utama:</span>
                <span className="font-bold text-amber-700">OMBUDSMAN 2026</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Struktur Subfolder:</span>
                <span className="font-semibold text-emerald-700">4 Dimensi & 10+ Indikator</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">OAuth Scopes:</span>
                <span className="font-mono text-xs text-slate-700">drive.file</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Format Diizinkan:</span>
                <span className="font-mono text-slate-700">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={handleSyncFolders}
              disabled={syncing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {syncing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Memproses Folder Drive...</span>
                </>
              ) : (
                <>
                  <FolderPlus size={16} />
                  <span>Buat / Sinkronkan Struktur Folder Drive</span>
                </>
              )}
            </button>
            {syncing && syncStatus && (
              <p className="text-[11px] text-blue-600 text-center font-medium animate-pulse">
                {syncStatus}
              </p>
            )}
          </div>
        </div>

        {/* Database & Security Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
            <Database size={18} />
            <span>Database Cloud Firestore & Auth</span>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-500">Firebase Project ID:</span>
              <span className="font-mono text-slate-900">leafy-builder-371nt</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-500">Autentikasi:</span>
              <span className="font-semibold text-emerald-700">Google Auth Provider (Active)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-500">Authorized Domain:</span>
              <span className="font-mono text-xs text-indigo-700 font-bold">{vercelDomain}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Versi Aplikasi:</span>
              <span className="font-mono text-slate-900">v2.6.0 (Ombudsman 2026 Ready)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

