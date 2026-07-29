import React, { useState } from 'react';
import { Settings, HardDrive, ShieldCheck, Key, Database, Sparkles, FolderPlus, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const SettingsView: React.FC = () => {
  const { syncDriveFolders } = useData();
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [resultMessage, setResultMessage] = useState<{ success: boolean; text: string } | null>(null);

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
            Konfigurasi aplikasi, integrasi Google Drive API, dan database Cloud Firestore.
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
              <span className="text-slate-500">Aturan Keamanan Rules:</span>
              <span className="font-semibold text-emerald-700">Role-Based Access Control</span>
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
