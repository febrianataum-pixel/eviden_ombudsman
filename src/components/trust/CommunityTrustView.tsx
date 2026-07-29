import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { CommunityTrustUnit } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { 
  HeartHandshake, 
  Users, 
  ExternalLink, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  X,
  Target
} from 'lucide-react';

export const CommunityTrustView: React.FC = () => {
  const { 
    communityTrustUnits, 
    addCommunityTrustUnit, 
    updateCommunityTrustUnit, 
    deleteCommunityTrustUnit 
  } = useData();
  const { user } = useAuth();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    unitToEdit?: CommunityTrustUnit;
  }>({ isOpen: false });

  const [unitToDelete, setUnitToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [unitName, setUnitName] = useState<string>('');
  const [targetRespondents, setTargetRespondents] = useState<number>(30);
  const [currentRespondents, setCurrentRespondents] = useState<number>(0);
  const [questionnaireUrl, setQuestionnaireUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const canEdit = user?.role === 'admin' || user?.role === 'operator';

  const handleOpenModal = (unit?: CommunityTrustUnit) => {
    if (unit) {
      setModalState({ isOpen: true, unitToEdit: unit });
      setUnitName(unit.unitName);
      setTargetRespondents(unit.targetRespondents);
      setCurrentRespondents(unit.currentRespondents);
      setQuestionnaireUrl(unit.questionnaireUrl);
    } else {
      setModalState({ isOpen: true });
      setUnitName('');
      setTargetRespondents(30);
      setCurrentRespondents(0);
      setQuestionnaireUrl('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) return;

    setSubmitting(true);
    try {
      if (modalState.unitToEdit) {
        await updateCommunityTrustUnit(modalState.unitToEdit.id, {
          unitName: unitName.trim(),
          targetRespondents,
          currentRespondents,
          questionnaireUrl: questionnaireUrl.trim(),
        });
      } else {
        await addCommunityTrustUnit({
          unitName: unitName.trim(),
          targetRespondents,
          currentRespondents,
          questionnaireUrl: questionnaireUrl.trim(),
        });
      }
      setModalState({ isOpen: false });
    } catch (err) {
      console.error('Failed to save unit:', err);
      alert('Gagal menyimpan data unit layanan.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteUnit = async () => {
    if (!unitToDelete) return;
    setDeleting(true);
    try {
      await deleteCommunityTrustUnit(unitToDelete.id);
      setUnitToDelete(null);
    } catch (err) {
      console.error('Failed to delete unit:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
              <HeartHandshake size={14} /> Kuesioner Ombudsman 2026
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">Kepercayaan Masyarakat (Survei Responden)</h1>
          <p className="text-slate-600 text-xs mt-1 max-w-2xl">
            Pengelolaan target responden masyarakat pengguna layanan di Lokus Penilaian Opini Ombudsman.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 shrink-0"
          >
            <Plus size={16} />
            <span>Tambah Unit Layanan</span>
          </button>
        )}
      </div>

      {/* Target Info Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
        <Target size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900">Ketentuan Target Ombudsman 2026:</p>
          <p className="text-amber-800 leading-relaxed">
            Setiap Unit Layanan Publik yang menjadi Lokus Penilaian wajib memenuhi <strong>minimal 30 responden masyarakat</strong> yang pernah melakukan kepengurusan per produk layanan.
          </p>
        </div>
      </div>

      {/* Unit Layanan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {communityTrustUnits.map((unit) => {
          const percent = Math.min(
            100,
            Math.round((unit.currentRespondents / (unit.targetRespondents || 30)) * 100)
          );
          const isTargetMet = unit.currentRespondents >= (unit.targetRespondents || 30);

          return (
            <div
              key={unit.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{unit.unitName}</h3>
                  {isTargetMet ? (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shrink-0 flex items-center gap-1">
                      <CheckCircle2 size={12} /> MEMENUHI
                    </span>
                  ) : (
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded shrink-0 flex items-center gap-1">
                      <AlertCircle size={12} /> PROGRES
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Responden Terkumpul</span>
                    <span className="font-bold text-slate-900">
                      {unit.currentRespondents} / {unit.targetRespondents || 30} ({percent}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTargetMet ? 'bg-emerald-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {unit.questionnaireUrl && (
                  <a
                    href={unit.questionnaireUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 pt-1"
                  >
                    <span>Buka Link Kuesioner</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Admin Actions */}
              {canEdit && (
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => handleOpenModal(unit)}
                    className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition"
                    title="Edit Data Unit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setUnitToDelete({ id: unit.id, name: unit.unitName })}
                    className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Hapus Unit"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col text-slate-900">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {modalState.unitToEdit ? 'Edit Unit Layanan' : 'Tambah Unit Layanan'}
              </h3>
              <button
                onClick={() => setModalState({ isOpen: false })}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Nama Unit Layanan *</label>
                <input
                  type="text"
                  required
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  placeholder="Contoh: Disdukcapil Kota"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Target Responden</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={targetRespondents}
                    onChange={(e) => setTargetRespondents(parseInt(e.target.value) || 30)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Responden Saat Ini</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={currentRespondents}
                    onChange={(e) => setCurrentRespondents(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">URL Kuesioner (Google Forms / Web)</label>
                <input
                  type="url"
                  value={questionnaireUrl}
                  onChange={(e) => setQuestionnaireUrl(e.target.value)}
                  placeholder="https://forms.google.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: false })}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(unitToDelete)}
        title="Konfirmasi Hapus Unit Layanan"
        itemName={unitToDelete?.name}
        message="Apakah Anda yakin ingin menghapus data unit layanan ini? Data statistik responden unit ini akan dihapus secara permanen."
        confirmButtonText="Hapus Unit"
        loading={deleting}
        onConfirm={confirmDeleteUnit}
        onClose={() => setUnitToDelete(null)}
      />

    </div>
  );
};
