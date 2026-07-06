'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Service {
  _id: string;
  title: string;
  slug: string;
  icon: string;
  tagline: string;
  description: string;
  deliverables: string[];
  stack: string[];
  startingPrice: string | null;
  ctaLabel: string;
  order: number;
  status: string;
}

const emptyForm = {
  title: '',
  icon: '',
  tagline: '',
  description: '',
  deliverables: '',
  stack: '',
  startingPrice: '',
  ctaLabel: 'Cotizar proyecto',
  order: 0,
  status: 'active',
};

export default function AdminServicios() {
  const { accessToken } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchServices = useCallback(async () => {
    try {
      const data = (await api.getServices({ status: 'all' })) as any;
      setServices(data.data || data || []);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(service: Service) {
    setForm({
      title: service.title,
      icon: service.icon || '',
      tagline: service.tagline || '',
      description: service.description,
      deliverables: (service.deliverables || []).join('\n'),
      stack: (service.stack || []).join(', '),
      startingPrice: service.startingPrice || '',
      ctaLabel: service.ctaLabel || 'Cotizar proyecto',
      order: service.order ?? 0,
      status: service.status || 'active',
    });
    setEditingId(service._id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      icon: form.icon,
      tagline: form.tagline,
      description: form.description,
      deliverables: form.deliverables.split('\n').map((d) => d.trim()).filter(Boolean),
      stack: form.stack.split(',').map((s) => s.trim()).filter(Boolean),
      startingPrice: form.startingPrice.trim() || null,
      ctaLabel: form.ctaLabel,
      order: Number(form.order) || 0,
      status: form.status,
    };
    if (editingId) {
      await api.updateService(editingId, payload, accessToken!);
    } else {
      await api.createService(payload, accessToken!);
    }
    resetForm();
    fetchServices();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este servicio?')) return;
    await api.deleteService(id, accessToken!);
    fetchServices();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-page__title">Servicios</h1>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="btn btn--primary"
        >
          {showForm ? 'Cancelar' : '+ Nuevo Servicio'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" required />
            <input placeholder="Tagline (ej: De la idea al deploy)" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="input" />
            <input placeholder="Icono (code, server, cloud, wifi, monitor, cpu)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input" />
            <input placeholder="Precio inicial (opcional, ej: Desde $5,000 MXN)" value={form.startingPrice} onChange={(e) => setForm({ ...form, startingPrice: e.target.value })} className="input" />
          </div>
          <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input h-20" required />
          <textarea placeholder="Entregables (uno por línea)" value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} className="input h-24" />
          <input placeholder="Stack (separado por comas)" value={form.stack} onChange={(e) => setForm({ ...form, stack: e.target.value })} className="input" />
          <div className="flex flex-wrap items-center gap-4">
            <input placeholder="Texto del CTA" value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} className="input w-52" />
            <input type="number" placeholder="Orden" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="input w-28" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select">
              <option value="active">Activo</option>
              <option value="hidden">Oculto</option>
            </select>
          </div>
          <button type="submit" className="btn btn--primary">
            {editingId ? 'Guardar cambios' : 'Crear servicio'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="admin-form__label">Cargando...</p>
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-table__head">Título</th>
                <th className="admin-table__head hidden md:table-cell">Tagline</th>
                <th className="admin-table__head">Orden</th>
                <th className="admin-table__head">Estado</th>
                <th className="admin-table__head">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s._id} className="admin-table__row">
                  <td className="admin-table__cell">{s.title}</td>
                  <td className="admin-table__cell admin-table__cell--muted hidden md:table-cell">{s.tagline}</td>
                  <td className="admin-table__cell admin-table__cell--muted">{s.order}</td>
                  <td className="admin-table__cell">
                    <span style={{ color: s.status === 'active' ? '#4cd6fb' : '#888' }}>
                      {s.status === 'active' ? 'Activo' : 'Oculto'}
                    </span>
                  </td>
                  <td className="admin-table__cell space-x-3">
                    <button onClick={() => handleEdit(s)} className="admin-action">Editar</button>
                    <button onClick={() => handleDelete(s._id)} className="admin-action admin-action--delete">Eliminar</button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-table__cell admin-table__cell--muted text-center py-8">
                    No hay servicios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
