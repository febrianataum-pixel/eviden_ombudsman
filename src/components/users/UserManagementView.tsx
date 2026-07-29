import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, UserProfile } from '../../types';
import { 
  Users, 
  Shield, 
  CheckCircle, 
  FileCheck, 
  RefreshCw, 
  UserPlus, 
  Trash2, 
  Key, 
  X, 
  KeyRound, 
  User, 
  Mail, 
  Lock, 
  Check 
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const { 
    allUsers, 
    refreshUsers, 
    updateUserRole, 
    createManualUser, 
    deleteUserAccount, 
    updateUserPassword, 
    user: currentUser 
  } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<UserProfile | null>(null);

  // Form states for Add User
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('operator');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Reset password state
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleRoleChange = async (uid: string, role: UserRole) => {
    try {
      await updateUserRole(uid, role);
    } catch (err) {
      alert('Gagal memperbarui role pengguna.');
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newDisplayName.trim() || !newUsername.trim() || !newPassword) {
      setFormError('Nama lengkap, username, dan password wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      await createManualUser({
        displayName: newDisplayName,
        username: newUsername,
        email: newEmail || `${newUsername.trim().toLowerCase()}@ombudsman.go.id`,
        password: newPassword,
        role: newRole,
      });

      setIsAddModalOpen(false);
      setNewDisplayName('');
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('operator');
    } catch (err: any) {
      setFormError(err.message || 'Gagal menambahkan akun pengguna.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (u: UserProfile) => {
    if (u.uid === currentUser?.uid) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan.');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${u.displayName}" (${u.username || u.email})?`)) {
      try {
        await deleteUserAccount(u.uid);
      } catch (err) {
        alert('Gagal menghapus pengguna.');
      }
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset || !resetPasswordValue.trim()) return;

    try {
      await updateUserPassword(selectedUserForReset.uid, resetPasswordValue.trim());
      alert(`Password untuk ${selectedUserForReset.displayName} telah diperbarui.`);
      setIsResetPasswordModalOpen(false);
      setSelectedUserForReset(null);
      setResetPasswordValue('');
    } catch (err) {
      alert('Gagal memperbarui password.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={22} className="text-blue-600" />
            <span>Manajemen Pengguna & Role</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tambah akun pengguna baru, atur password manual, serta kelola hak akses (Admin, Verifikator, Operator).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => { setFormError(null); setIsAddModalOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-xs"
            >
              <UserPlus size={16} />
              <span>Tambah Pengguna</span>
            </button>
          )}

          <button
            onClick={() => refreshUsers()}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-2 border border-slate-200"
          >
            <RefreshCw size={14} />
            <span>Muat Ulang</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-4">Pengguna</th>
                <th className="p-4">Username / Email</th>
                <th className="p-4">Tipe Akses</th>
                <th className="p-4">Role / Hak Akses</th>
                <th className="p-4 text-center">Login Terakhir</th>
                <th className="p-4 text-right">Aksi Admin</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {allUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Tidak ada pengguna terdaftar saat ini.
                  </td>
                </tr>
              ) : (
                allUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50 transition">
                    
                    {/* User Profile */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {u.photoURL ? (
                          <img
                            src={u.photoURL}
                            alt={u.displayName}
                            className="w-8 h-8 rounded-full ring-2 ring-slate-200 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                            {u.displayName?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{u.displayName}</p>
                          <span className="text-[10px] text-slate-400 font-mono">UID: {u.uid.slice(0, 10)}...</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-0.5">
                        {u.username && (
                          <span className="text-slate-900 font-semibold block text-xs">@{u.username}</span>
                        )}
                        <span className="text-slate-500 font-mono text-[11px] block">{u.email || '-'}</span>
                      </div>
                    </td>

                    {/* Auth Type Badge */}
                    <td className="p-4">
                      {u.authType === 'google' ? (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1">
                          <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                          </svg>
                          Google Auth
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1">
                          <KeyRound size={11} />
                          Manual / Password
                        </span>
                      )}
                    </td>

                    {/* Role Badge & Selector */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {u.role === 'admin' ? (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                            <Shield size={11} /> ADMIN
                          </span>
                        ) : u.role === 'verifikator' ? (
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                            <CheckCircle size={11} /> VERIFIKATOR
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                            <FileCheck size={11} /> OPERATOR
                          </span>
                        )}

                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                          disabled={currentUser?.role !== 'admin'}
                          className="bg-slate-50 border border-slate-200 text-[11px] text-slate-800 rounded-lg px-2 py-1 focus:bg-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                          <option value="operator">Operator</option>
                          <option value="verifikator">Verifikator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>

                    <td className="p-4 text-center text-slate-500 text-[11px]">
                      {new Date(u.lastLogin).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      {currentUser?.role === 'admin' && (
                        <div className="flex items-center justify-end gap-1.5">
                          {u.authType === 'manual' && (
                            <button
                              onClick={() => { setSelectedUserForReset(u); setResetPasswordValue(''); setIsResetPasswordModalOpen(true); }}
                              title="Reset Password"
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            >
                              <Key size={15} />
                            </button>
                          )}

                          {u.uid !== currentUser.uid && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              title="Hapus Akun Pengguna"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah Akun Pengguna */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tambah Akun Pengguna Baru</h3>
                  <p className="text-[11px] text-slate-500">Buat kredensial akun manual untuk staf Ombudsman</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ahmad Syahputra"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="ahmadsyah"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Akses *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="operator">Operator</option>
                    <option value="verifikator">Verifikator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email (Opsional)</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="ahmad@ombudsman.go.id"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Password akun"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {isResetPasswordModalOpen && selectedUserForReset && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Reset Password Pengguna</h3>
              </div>
              <button onClick={() => setIsResetPasswordModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Ubah password untuk akun <strong>{selectedUserForReset.displayName}</strong> (@{selectedUserForReset.username}):
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <input
                type="password"
                required
                placeholder="Masukkan password baru"
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

