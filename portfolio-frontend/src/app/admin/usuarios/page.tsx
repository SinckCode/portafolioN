'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface User {
  _id: string;
  email: string;
  displayName: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function AdminUsuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuth();

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try {
      const data = await api.getUsers(accessToken!) as any;
      setUsers(data.data || data || []);
    } catch { /* empty */ } finally { setLoading(false); }
  }

  async function changeRole(id: string, role: string) {
    await api.updateUser(id, { role }, accessToken!);
    fetchUsers();
  }

  return (
    <div>
      <h1 className="admin-page__title mb-6">Usuarios</h1>
      {loading ? <p className="admin-table__cell">Cargando...</p> : (
        <div className="admin-card overflow-hidden">
          <table className="w-full">
            <thead><tr className="admin-table__head">
              <th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Rol</th><th className="px-4 py-3 hidden md:table-cell">Verificado</th><th className="px-4 py-3">Registro</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="admin-table__row">
                  <td className="admin-table__cell px-4 py-3">{u.displayName}</td>
                  <td className="admin-table__cell px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={e => changeRole(u._id, e.target.value)} className="input px-2 py-1">
                      <option value="subscriber">Subscriber</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={u.isEmailVerified ? 'status-badge status-badge--success' : 'status-badge status-badge--warning'}>{u.isEmailVerified ? 'Si' : 'No'}</span>
                  </td>
                  <td className="admin-table__cell px-4 py-3">{new Date(u.createdAt).toLocaleDateString('es-MX')}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center admin-table__cell">No hay usuarios</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
