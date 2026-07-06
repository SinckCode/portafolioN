'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Subscriber {
  _id: string;
  email: string;
  name: string;
  isActive: boolean;
  subscribedAt: string;
}

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const { accessToken } = useAuth();

  useEffect(() => { fetchSubscribers(); }, []);

  async function fetchSubscribers() {
    try {
      const data = await api.getSubscribers(accessToken!) as any;
      setSubscribers(data.data || data || []);
      setTotal(data.meta?.total || (data.data || data || []).length);
    } catch { /* empty */ } finally { setLoading(false); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-page__title">Newsletter</h1>
        <span className="status-badge status-badge--info">{total} suscriptores activos</span>
      </div>

      {loading ? <p className="admin-table__cell">Cargando...</p> : (
        <div className="admin-card overflow-hidden">
          <table className="w-full">
            <thead><tr className="admin-table__head">
              <th className="px-4 py-3">Email</th><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Fecha</th>
            </tr></thead>
            <tbody>
              {subscribers.map(s => (
                <tr key={s._id} className="admin-table__row">
                  <td className="admin-table__cell px-4 py-3">{s.email}</td>
                  <td className="admin-table__cell px-4 py-3">{s.name || '-'}</td>
                  <td className="px-4 py-3"><span className={s.isActive ? 'status-badge status-badge--success' : 'status-badge status-badge--danger'}>{s.isActive ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="admin-table__cell px-4 py-3">{new Date(s.subscribedAt).toLocaleDateString('es-MX')}</td>
                </tr>
              ))}
              {subscribers.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center admin-table__cell">No hay suscriptores</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
