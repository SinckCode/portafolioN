'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Category {
  _id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
}

export default function AdminCategorias() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', type: 'project' });
  const { accessToken } = useAuth();

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    try {
      const data = await api.getCategories() as any;
      setCategories(Array.isArray(data) ? data : data.data || []);
    } catch { /* empty */ } finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.createCategory(form, accessToken!);
    setShowForm(false);
    setForm({ name: '', slug: '', description: '', type: 'project' });
    fetchCategories();
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminar esta categoria?')) return;
    await api.deleteCategory(id, accessToken!);
    fetchCategories();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-page__title">Categorias</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn--primary px-4 py-2">
          {showForm ? 'Cancelar' : '+ Nueva Categoria'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input" required />
            <input placeholder="Slug" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="input" required />
          </div>
          <input placeholder="Descripcion" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input w-full" />
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="input">
            <option value="project">Proyecto</option>
            <option value="post">Post</option>
            <option value="course">Curso</option>
          </select>
          <button type="submit" className="btn btn--primary px-6 py-2">Guardar</button>
        </form>
      )}

      {loading ? <p className="admin-table__cell">Cargando...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(c => (
            <div key={c._id} className="admin-card p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="admin-table__cell">{c.name}</h3>
                <span className="status-badge status-badge--info">{c.type}</span>
              </div>
              <p className="admin-table__cell mb-3">{c.description || 'Sin descripcion'}</p>
              <div className="flex items-center justify-between">
                <span className="admin-table__cell">/{c.slug}</span>
                <button onClick={() => handleDelete(c._id)} className="admin-action admin-action--delete">Eliminar</button>
              </div>
            </div>
          ))}
          {categories.length === 0 && <p className="admin-table__cell col-span-3 text-center py-8">No hay categorias</p>}
        </div>
      )}
    </div>
  );
}
