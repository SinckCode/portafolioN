'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Project {
  _id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  featured: boolean;
  technologies: string[];
  demoUrl?: string;
  repoUrl?: string;
  createdAt: string;
}

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  technologies: '',
  demoUrl: '',
  repoUrl: '',
  featured: false,
  status: 'completed',
};

export default function AdminProyectos() {
  const { accessToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const data = await api.getProjects() as any;
      setProjects(data.data || data || []);
    } catch { /* empty */ } finally { setLoading(false); }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setSaveMessage('');
  }

  function openEditor(project: Project) {
    setForm({
      title: project.title,
      slug: project.slug || '',
      description: project.description || '',
      technologies: (project.technologies || []).join(', '),
      demoUrl: project.demoUrl || '',
      repoUrl: project.repoUrl || '',
      featured: project.featured || false,
      status: project.status || 'completed',
    });
    setEditingId(project._id);
    setShowForm(true);
    setSaveMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');
    const payload = {
      ...form,
      technologies: form.technologies.split(',').map(t => t.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await api.updateProject(editingId, payload, accessToken!);
      } else {
        await api.createProject(payload, accessToken!);
      }
      setSaveMessage('Guardado');
      fetchProjects();
      if (!editingId) resetForm();
    } catch (err: any) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminar este proyecto?')) return;
    await api.deleteProject(id, accessToken!);
    if (editingId === id) resetForm();
    fetchProjects();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-page__title">Proyectos</h1>
        <button onClick={() => (showForm ? resetForm() : setShowForm(true))} className="btn btn--primary">
          {showForm ? 'Cancelar' : '+ Nuevo Proyecto'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card p-6 mb-6 space-y-4">
          {editingId && (
            <p className="admin-form__label">Editando: {form.title}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Titulo" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input" required />
            <input placeholder="Slug" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="input" required />
            <input placeholder="Demo URL" value={form.demoUrl} onChange={e => setForm({...form, demoUrl: e.target.value})} className="input" />
            <input placeholder="Repo URL" value={form.repoUrl} onChange={e => setForm({...form, repoUrl: e.target.value})} className="input" />
          </div>
          <textarea placeholder="Descripcion" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input h-24" required />
          <input placeholder="Tecnologias (separadas por coma)" value={form.technologies} onChange={e => setForm({...form, technologies: e.target.value})} className="input" />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 admin-form__label">
              <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="rounded" />
              Destacado
            </label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="select">
              <option value="completed">Completado</option>
              <option value="in-progress">En progreso</option>
              <option value="planned">Planeado</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear proyecto'}
            </button>
            {saveMessage && (
              <span
                className="admin-form__label"
                style={{ color: saveMessage.startsWith('Error') ? '#ff5470' : '#4cd6fb' }}
              >
                {saveMessage}
              </span>
            )}
          </div>
        </form>
      )}

      {loading ? (
        <p className="admin-form__label">Cargando...</p>
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="admin-table">
            <thead><tr>
              <th className="admin-table__head">Titulo</th><th className="admin-table__head hidden md:table-cell">Tecnologias</th><th className="admin-table__head">Estado</th><th className="admin-table__head">Acciones</th>
            </tr></thead>
            <tbody>
              {projects.map(p => (
                <tr key={p._id} className="admin-table__row">
                  <td className="admin-table__cell">{p.featured && <span className="text-[#00b4d8] mr-1">★</span>}{p.title}</td>
                  <td className="admin-table__cell hidden md:table-cell"><div className="flex flex-wrap gap-1">{p.technologies?.slice(0,3).map(t => <span key={t} className="status-badge status-badge--info">{t}</span>)}</div></td>
                  <td className="admin-table__cell"><span className={`status-badge ${p.status === 'completed' ? 'status-badge--success' : 'status-badge--warning'}`}>{p.status}</span></td>
                  <td className="admin-table__cell space-x-3">
                    <button onClick={() => openEditor(p)} className="admin-action">Editar</button>
                    <button onClick={() => handleDelete(p._id)} className="admin-action admin-action--delete">Eliminar</button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && <tr><td colSpan={4} className="admin-table__cell admin-table__cell--muted text-center py-8">No hay proyectos</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
