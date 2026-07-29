import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Users, Shield, CheckCircle, FileCheck, RefreshCw } from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const { allUsers, refreshUsers, updateUserRole, user: currentUser } = useAuth();

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      await updateUserRole(uid, newRole);
    } catch (err) {
      alert('Gagal memperbarui role pengguna.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manajemen Pengguna & Role</h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola hak akses role (Admin, Verifikator, Operator) pengguna sistem E-VIDEN Ombudsman.
          </p>
        </div>

        <button
          onClick={() => refreshUsers()}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-2 border border-slate-200"
        >
          <RefreshCw size={14} />
          <span>Muat Ulang Pengguna</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-4">Pengguna</th>
                <th className="p-4">Email Google</th>
                <th className="p-4">Role Saat Ini</th>
                <th className="p-4">Ubah Hak Akses (Role)</th>
                <th className="p-4 text-right">Login Terakhir</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {allUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
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
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                            {u.displayName?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{u.displayName}</p>
                          <span className="text-[10px] text-slate-500 font-mono">UID: {u.uid.slice(0, 10)}...</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-700 font-mono">{u.email}</td>

                    {/* Role Badge */}
                    <td className="p-4">
                      {u.role === 'admin' ? (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                          <Shield size={12} /> ADMIN
                        </span>
                      ) : u.role === 'verifikator' ? (
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                          <CheckCircle size={12} /> VERIFIKATOR
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                          <FileCheck size={12} /> OPERATOR
                        </span>
                      )}
                    </td>

                    {/* Change Role Selector */}
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                        disabled={currentUser?.role !== 'admin'}
                        className="bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-1.5 focus:bg-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                      >
                        <option value="operator">Operator</option>
                        <option value="verifikator">Verifikator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="p-4 text-right text-slate-500">
                      {new Date(u.lastLogin).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
