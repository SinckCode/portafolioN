'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Comment {
  _id: string;
  content: string;
  author: { displayName: string; email: string } | null;
  post: { title: string } | null;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminComentarios() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuth();

  useEffect(() => { fetchComments(); }, []);

  async function fetchComments() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comments?limit=50`, { headers: { Authorization: `Bearer ${accessToken}` } });
      const data = await res.json();
      setComments(data.data || []);
    } catch { /* empty */ } finally { setLoading(false); }
  }

  async function toggleApproval(id: string, current: boolean) {
    await api.updateComment(id, { isApproved: !current }, accessToken!);
    fetchComments();
  }

  async function handleDelete(id: string) {
    if (!confirm('Eliminar este comentario?')) return;
    await api.deleteComment(id, accessToken!);
    fetchComments();
  }

  return (
    <div>
      <h1 className="admin-page__title mb-6">Comentarios</h1>
      {loading ? <p className="admin-table__cell">Cargando...</p> : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c._id} className="admin-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="admin-table__cell">{c.author?.displayName || 'Anonimo'}</span>
                    <span className="admin-table__cell">en {c.post?.title || 'Post eliminado'}</span>
                    <span className="admin-table__cell">{new Date(c.createdAt).toLocaleDateString('es-MX')}</span>
                  </div>
                  <p className="admin-table__cell">{c.content}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleApproval(c._id, c.isApproved)} className={c.isApproved ? 'status-badge status-badge--success' : 'status-badge status-badge--warning'}>
                    {c.isApproved ? 'Aprobado' : 'Pendiente'}
                  </button>
                  <button onClick={() => handleDelete(c._id)} className="admin-action admin-action--delete">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="admin-card p-8 text-center admin-table__cell">No hay comentarios</div>
          )}
        </div>
      )}
    </div>
  );
}
