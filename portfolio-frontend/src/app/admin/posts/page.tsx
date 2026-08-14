'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { marked } from 'marked';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const TipTapEditor = dynamic(() => import('@/components/admin/TipTapEditor'), { ssr: false });

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentFormat?: string;
  tags: string[];
  status: string;
  category: { name: string } | null;
  author?: { name: string } | null;
  createdAt: string;
  seo?: { metaTitle?: string; metaDescription?: string };
}

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  tags: '',
  status: 'draft',
  metaTitle: '',
  metaDescription: '',
};

export default function AdminPosts() {
  const { accessToken, isAdmin } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSeo, setShowSeo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genStyle, setGenStyle] = useState('guide');
  const [genLang, setGenLang] = useState('es');

  const fetchPosts = useCallback(async () => {
    try {
      // Un maestro (editor) solo administra SUS posts
      const data = (
        isAdmin
          ? await api.getPosts({ limit: '100' })
          : await api.getMyPosts(accessToken!)
      ) as any;
      setPosts(data.data || data || []);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [isAdmin, accessToken]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setShowSeo(false);
    setSaveMessage('');
  }

  function openEditor(post: Post) {
    // Si el post es markdown, convertirlo a HTML para TipTap
    let content = post.content || '';
    if (post.contentFormat !== 'html' && content) {
      content = marked.parse(content, { async: false }) as string;
    }
    setForm({
      title: post.title,
      excerpt: post.excerpt || '',
      content,
      tags: (post.tags || []).join(', '),
      status: post.status || 'draft',
      metaTitle: post.seo?.metaTitle || '',
      metaDescription: post.seo?.metaDescription || '',
    });
    setEditingId(post._id);
    setShowForm(true);
    setSaveMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');
    const payload = {
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      contentFormat: 'html',
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: form.status,
      seo: {
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
      },
    };
    try {
      if (editingId) {
        await api.updatePost(editingId, payload, accessToken!);
      } else {
        await api.createPost(payload, accessToken!);
      }
      setSaveMessage('✓ Guardado');
      fetchPosts();
      if (!editingId) resetForm();
    } catch (err: any) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este post?')) return;
    await api.deletePost(id, accessToken!);
    if (editingId === id) resetForm();
    fetchPosts();
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!genTopic.trim()) return;
    setGenerating(true);
    try {
      await api.generateBlogPost(
        { topic: genTopic, style: genStyle, language: genLang },
        accessToken!,
      );
      setShowGenerate(false);
      setGenTopic('');
      fetchPosts();
    } catch (err: any) {
      alert(`Error generando: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  }

  async function toggleStatus(id: string, current: string) {
    await api.updatePost(
      id,
      { status: current === 'published' ? 'draft' : 'published' },
      accessToken!
    );
    fetchPosts();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-page__title">Posts del Blog</h1>
        <div className="flex gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowGenerate((v) => !v)}
              className="btn btn--ghost"
            >
              {showGenerate ? 'Cancelar' : 'Generar con IA'}
            </button>
          )}
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="btn btn--primary"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Post'}
          </button>
        </div>
      </div>

      {showGenerate && (
        <form onSubmit={handleGenerate} className="admin-card p-6 mb-6 space-y-4">
          <p className="admin-form__label">Generar post con IA</p>
          <input
            placeholder="Tema del artículo (ej: Introducción a Docker)"
            value={genTopic}
            onChange={(e) => setGenTopic(e.target.value)}
            className="input"
            required
          />
          <div className="flex flex-wrap gap-4">
            <select
              value={genStyle}
              onChange={(e) => setGenStyle(e.target.value)}
              className="select"
            >
              <option value="guide">Guía</option>
              <option value="tutorial">Tutorial</option>
              <option value="opinion">Opinión</option>
              <option value="review">Review</option>
            </select>
            <select
              value={genLang}
              onChange={(e) => setGenLang(e.target.value)}
              className="select"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <button type="submit" className="btn btn--primary" disabled={generating}>
            {generating ? 'Generando… (10-30s)' : 'Generar borrador'}
          </button>
        </form>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card p-6 mb-6 space-y-4">
          {editingId && (
            <p className="admin-form__label">Editando: {form.title}</p>
          )}
          <input
            placeholder="Título"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
            required
          />
          <input
            placeholder="Extracto (aparece en las cards del blog)"
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="input"
          />

          {/* Editor visual TipTap */}
          <TipTapEditor
            value={form.content}
            onChange={(content) => setForm({ ...form, content })}
            onImageUpload={async (file) => {
              const res = await api.uploadFile(file, accessToken!) as any;
              const url = res.url || res.data?.url;
              const origin = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
              return url.startsWith('http') ? url : `${origin}${url}`;
            }}
          />

          <div className="flex flex-wrap items-center gap-4">
            <input
              placeholder="Tags (separados por coma)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="input flex-1"
              style={{ minWidth: '220px' }}
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="select"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>

          {/* SEO colapsable */}
          <button
            type="button"
            className="admin-action"
            onClick={() => setShowSeo((v) => !v)}
          >
            {showSeo ? '▾' : '▸'} SEO (opcional)
          </button>
          {showSeo && (
            <div className="space-y-3 pl-4 border-l-2" style={{ borderColor: 'var(--color-primary-border)' }}>
              <input
                placeholder="Meta título (si difiere del título)"
                value={form.metaTitle}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                className="input"
              />
              <textarea
                placeholder="Meta descripción (~155 caracteres)"
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                className="input h-20"
                maxLength={170}
              />
            </div>
          )}

          <div className="flex items-center gap-4">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Crear post'}
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
            <thead>
              <tr>
                <th className="admin-table__head">Titulo</th>
                <th className="admin-table__head hidden md:table-cell">Autor</th>
                <th className="admin-table__head">Estado</th>
                <th className="admin-table__head hidden md:table-cell">Fecha</th>
                <th className="admin-table__head">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p._id} className="admin-table__row">
                  <td className="admin-table__cell">{p.title}</td>
                  <td className="admin-table__cell admin-table__cell--muted hidden md:table-cell">
                    {p.author?.name || '—'}
                  </td>
                  <td className="admin-table__cell">
                    <button
                      onClick={() => toggleStatus(p._id, p.status)}
                      className={`status-badge cursor-pointer ${p.status === 'published' ? 'status-badge--success' : 'status-badge--warning'}`}
                      title="Clic para alternar publicado/borrador"
                    >
                      {p.status === 'published' ? 'Publicado' : 'Borrador'}
                    </button>
                  </td>
                  <td className="admin-table__cell admin-table__cell--muted hidden md:table-cell">
                    {new Date(p.createdAt).toLocaleDateString('es-MX')}
                  </td>
                  <td className="admin-table__cell space-x-3">
                    <button onClick={() => openEditor(p)} className="admin-action">
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="admin-action admin-action--delete"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-table__cell admin-table__cell--muted text-center py-8">
                    No hay posts
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
