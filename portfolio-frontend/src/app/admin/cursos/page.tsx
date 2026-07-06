'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Lesson {
  title: string;
  slug: string;
  type: string;
  content: string;
  videoUrl: string;
  duration: number;
  isFree: boolean;
  order: number;
}

interface CourseModule {
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  duration: string;
  price: number;
  status: string;
  tags: string[];
  requirements: string[];
  whatYouLearn: string[];
  modules: CourseModule[];
  enrollmentCount: number;
  createdAt: string;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const emptyLesson = (order: number): Lesson => ({
  title: '',
  slug: '',
  type: 'video',
  content: '',
  videoUrl: '',
  duration: 0,
  isFree: false,
  order,
});

const emptyModule = (order: number): CourseModule => ({
  title: '',
  order,
  lessons: [emptyLesson(1)],
});

const emptyCreateForm = {
  title: '',
  description: '',
  level: 'beginner',
  price: 0,
  duration: '',
  status: 'draft',
};

export default function AdminCursos() {
  const { accessToken, isAdmin } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyCreateForm);

  // Editor de curso completo (campos + módulos/lecciones)
  const [editing, setEditing] = useState<Course | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    level: 'beginner',
    price: 0,
    duration: '',
    status: 'draft',
    tags: '',
    requirements: '',
    whatYouLearn: '',
  });
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const fetchCourses = useCallback(async () => {
    try {
      // Un maestro (editor) solo administra SUS cursos
      const data = (
        isAdmin
          ? await api.getCourses({ status: 'all', limit: '100' })
          : await api.getMyCourses(accessToken!)
      ) as any;
      setCourses(data.data || data || []);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  }, [isAdmin, accessToken]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await api.createCourse(form, accessToken!);
    setShowForm(false);
    setForm(emptyCreateForm);
    fetchCourses();
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este curso?')) return;
    await api.deleteCourse(id, accessToken!);
    if (editing?._id === id) setEditing(null);
    fetchCourses();
  }

  async function togglePublish(course: Course) {
    const next = course.status === 'published' ? 'draft' : 'published';
    await api.updateCourse(course._id, { status: next }, accessToken!);
    fetchCourses();
  }

  function openEditor(course: Course) {
    setEditing(course);
    setSaveMessage('');
    setEditForm({
      title: course.title,
      description: course.description,
      level: course.level || 'beginner',
      price: course.price ?? 0,
      duration: course.duration || '',
      status: course.status || 'draft',
      tags: (course.tags || []).join(', '),
      requirements: (course.requirements || []).join('\n'),
      whatYouLearn: (course.whatYouLearn || []).join('\n'),
    });
    setModules(
      (course.modules || []).map((m) => ({
        title: m.title,
        order: m.order,
        lessons: (m.lessons || []).map((l) => ({ ...l })),
      }))
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Mutaciones del editor de módulos/lecciones ---
  const updateModule = (mi: number, patch: Partial<CourseModule>) =>
    setModules((prev) => prev.map((m, i) => (i === mi ? { ...m, ...patch } : m)));

  const updateLesson = (mi: number, li: number, patch: Partial<Lesson>) =>
    setModules((prev) =>
      prev.map((m, i) =>
        i === mi
          ? { ...m, lessons: m.lessons.map((l, j) => (j === li ? { ...l, ...patch } : l)) }
          : m
      )
    );

  const addModule = () => setModules((prev) => [...prev, emptyModule(prev.length + 1)]);

  const removeModule = (mi: number) =>
    setModules((prev) => prev.filter((_, i) => i !== mi).map((m, i) => ({ ...m, order: i + 1 })));

  const moveModule = (mi: number, delta: number) =>
    setModules((prev) => {
      const next = [...prev];
      const target = mi + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[mi], next[target]] = [next[target], next[mi]];
      return next.map((m, i) => ({ ...m, order: i + 1 }));
    });

  const addLesson = (mi: number) =>
    setModules((prev) =>
      prev.map((m, i) =>
        i === mi ? { ...m, lessons: [...m.lessons, emptyLesson(m.lessons.length + 1)] } : m
      )
    );

  const removeLesson = (mi: number, li: number) =>
    setModules((prev) =>
      prev.map((m, i) =>
        i === mi
          ? {
              ...m,
              lessons: m.lessons.filter((_, j) => j !== li).map((l, j) => ({ ...l, order: j + 1 })),
            }
          : m
      )
    );

  async function handleSaveEditor(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setSaveMessage('');
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        level: editForm.level,
        price: Number(editForm.price) || 0,
        duration: editForm.duration,
        status: editForm.status,
        tags: editForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
        requirements: editForm.requirements.split('\n').map((r) => r.trim()).filter(Boolean),
        whatYouLearn: editForm.whatYouLearn.split('\n').map((w) => w.trim()).filter(Boolean),
        modules: modules.map((m, mi) => ({
          title: m.title,
          order: mi + 1,
          lessons: m.lessons.map((l, li) => ({
            title: l.title,
            slug: l.slug || slugify(l.title),
            type: l.type,
            content: l.content,
            videoUrl: l.videoUrl,
            duration: Number(l.duration) || 0,
            isFree: !!l.isFree,
            order: li + 1,
          })),
        })),
      };
      await api.updateCourse(editing._id, payload, accessToken!);
      setSaveMessage('✓ Curso guardado');
      fetchCourses();
    } catch (err: any) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const lessonCount = (c: Course) =>
    (c.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="admin-page__title">Cursos</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn--primary">
          {showForm ? 'Cancelar' : '+ Nuevo Curso'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="admin-card p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" required />
            <input placeholder="Duración (ej: 4h 30m)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input" />
          </div>
          <textarea placeholder="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input h-24" required />
          <div className="flex flex-wrap gap-4">
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="select">
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
            <input type="number" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="input w-32" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select">
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>
          <p className="admin-form__label">Después de crearlo usa &quot;Editar&quot; para agregar módulos y lecciones.</p>
          <button type="submit" className="btn btn--primary">Crear curso</button>
        </form>
      )}

      {editing && (
        <form onSubmit={handleSaveEditor} className="admin-card p-6 mb-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="admin-page__title" style={{ fontSize: '1.15rem' }}>
              Editando: {editing.title}
            </h2>
            <button type="button" onClick={() => setEditing(null)} className="admin-action">
              Cerrar editor
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Título" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="input" required />
            <input placeholder="Duración total (ej: 4h 30m)" value={editForm.duration} onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })} className="input" />
          </div>
          <textarea placeholder="Descripción" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="input h-24" required />
          <div className="flex flex-wrap gap-4">
            <select value={editForm.level} onChange={(e) => setEditForm({ ...editForm, level: e.target.value })} className="select">
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
            <input type="number" placeholder="Precio" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} className="input w-32" />
            <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="select">
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="archived">Archivado</option>
            </select>
          </div>
          <input placeholder="Tags (separados por coma)" value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} className="input" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <textarea placeholder="Requisitos (uno por línea)" value={editForm.requirements} onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })} className="input h-24" />
            <textarea placeholder="Qué aprenderán (uno por línea)" value={editForm.whatYouLearn} onChange={(e) => setEditForm({ ...editForm, whatYouLearn: e.target.value })} className="input h-24" />
          </div>

          {/* --- Módulos y lecciones --- */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="admin-form__label" style={{ fontSize: '1rem', fontWeight: 600 }}>
                Módulos ({modules.length})
              </h3>
              <button type="button" onClick={addModule} className="btn btn--primary">
                + Módulo
              </button>
            </div>

            {modules.map((mod, mi) => (
              <div key={mi} className="admin-card p-4 space-y-3" style={{ border: '1px solid rgba(76,214,251,0.25)' }}>
                <div className="flex items-center gap-2">
                  <span className="admin-form__label shrink-0">Módulo {mi + 1}</span>
                  <input placeholder="Título del módulo" value={mod.title} onChange={(e) => updateModule(mi, { title: e.target.value })} className="input flex-1" required />
                  <button type="button" onClick={() => moveModule(mi, -1)} className="admin-action" title="Subir">↑</button>
                  <button type="button" onClick={() => moveModule(mi, 1)} className="admin-action" title="Bajar">↓</button>
                  <button type="button" onClick={() => removeModule(mi)} className="admin-action admin-action--delete">Quitar</button>
                </div>

                {mod.lessons.map((lesson, li) => (
                  <div key={li} className="p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="admin-form__label shrink-0">Lección {li + 1}</span>
                      <input placeholder="Título de la lección" value={lesson.title} onChange={(e) => updateLesson(mi, li, { title: e.target.value })} className="input flex-1" required />
                      <select value={lesson.type} onChange={(e) => updateLesson(mi, li, { type: e.target.value })} className="select">
                        <option value="video">Video</option>
                        <option value="text">Texto</option>
                      </select>
                      <input type="number" placeholder="Min" title="Duración en minutos" value={lesson.duration} onChange={(e) => updateLesson(mi, li, { duration: Number(e.target.value) })} className="input w-20" />
                      <label className="flex items-center gap-1 admin-form__label shrink-0">
                        <input type="checkbox" checked={lesson.isFree} onChange={(e) => updateLesson(mi, li, { isFree: e.target.checked })} className="rounded" />
                        Gratis
                      </label>
                      <button type="button" onClick={() => removeLesson(mi, li)} className="admin-action admin-action--delete">✕</button>
                    </div>
                    {lesson.type === 'video' ? (
                      <input placeholder="URL del video (YouTube, Vimeo, mp4...)" value={lesson.videoUrl} onChange={(e) => updateLesson(mi, li, { videoUrl: e.target.value })} className="input" />
                    ) : (
                      <textarea placeholder="Contenido de la lección (Markdown)" value={lesson.content} onChange={(e) => updateLesson(mi, li, { content: e.target.value })} className="input h-24" />
                    )}
                  </div>
                ))}

                <button type="button" onClick={() => addLesson(mi)} className="admin-action">
                  + Agregar lección
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar curso completo'}
            </button>
            {saveMessage && (
              <span className="admin-form__label" style={{ color: saveMessage.startsWith('Error') ? '#ff5470' : '#4cd6fb' }}>
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
                <th className="admin-table__head">Título</th>
                <th className="admin-table__head">Nivel</th>
                <th className="admin-table__head hidden md:table-cell">Lecciones</th>
                <th className="admin-table__head">Estado</th>
                <th className="admin-table__head">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id} className="admin-table__row">
                  <td className="admin-table__cell">{c.title}</td>
                  <td className="admin-table__cell admin-table__cell--muted capitalize">{c.level}</td>
                  <td className="admin-table__cell admin-table__cell--muted hidden md:table-cell">
                    {lessonCount(c)} en {(c.modules || []).length} módulos
                  </td>
                  <td className="admin-table__cell">
                    <button
                      onClick={() => togglePublish(c)}
                      className="admin-action"
                      style={{ color: c.status === 'published' ? '#4cd6fb' : '#ffc857' }}
                      title="Clic para alternar publicado/borrador"
                    >
                      {c.status === 'published' ? 'Publicado' : c.status === 'archived' ? 'Archivado' : 'Borrador'}
                    </button>
                  </td>
                  <td className="admin-table__cell space-x-3">
                    <button onClick={() => openEditor(c)} className="admin-action">Editar</button>
                    <button onClick={() => handleDelete(c._id)} className="admin-action admin-action--delete">Eliminar</button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-table__cell admin-table__cell--muted text-center py-8">
                    No hay cursos
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
