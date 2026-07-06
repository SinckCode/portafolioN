'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/api$/, '');

// Edición de perfil conectada al API: PATCH /auth/me + subida de avatar.
export default function EditarPerfilPage() {
  const router = useRouter();
  const { user, accessToken, isLoading, isAuthenticated, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<'ok' | 'error' | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Precarga los datos reales del usuario
  useEffect(() => {
    if (!user) return;
    setName(user.name || '');
    setBio(user.bio || '');
    setGithub(user.socialLinks?.github || '');
    setLinkedin(user.socialLinks?.linkedin || '');
    setWebsite(user.socialLinks?.website || '');
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 flex items-center justify-center">
          <p className="text-on-surface-variant">Cargando…</p>
        </main>
        <Footer />
      </>
    );
  }

  const avatarSrc =
    avatarPreview ||
    (user.avatar
      ? user.avatar.startsWith('/uploads')
        ? `${API_ORIGIN}${user.avatar}`
        : user.avatar
      : null);

  const initials = (user.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !accessToken) return;

    setAvatarPreview(URL.createObjectURL(file));
    setUploadingAvatar(true);
    setMessage(null);
    try {
      await api.uploadAvatar(file, accessToken);
      await refreshUser();
      setMessage('ok');
    } catch {
      setMessage('error');
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setSaving(true);
    setMessage(null);
    try {
      await api.updateProfile(
        {
          name,
          bio,
          socialLinks: { github, linkedin, website },
        },
        accessToken
      );
      await refreshUser();
      setMessage('ok');
    } catch {
      setMessage('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="section__title">Editar perfil</h1>
            <Link href="/perfil" className="profile__link">Cancelar</Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
                  alt="Tu avatar"
                  className="w-20 h-20 rounded-full object-cover border"
                  style={{ borderColor: 'var(--color-primary-border)' }}
                />
              ) : (
                <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center text-black text-2xl font-bold">
                  {initials}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                className="profile__edit-btn"
                disabled={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingAvatar ? 'Subiendo…' : 'Cambiar avatar'}
              </button>
            </div>

            <div>
              <label className="text-sm text-on-surface-variant mb-1 block">Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
            </div>

            <div>
              <label className="text-sm text-on-surface-variant mb-1 block">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="input" />
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="section__subtitle">Redes sociales</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-on-surface-variant mb-1 block">GitHub</label>
                  <input type="url" value={github} onChange={(e) => setGithub(e.target.value)} className="input" placeholder="https://github.com/..." />
                </div>
                <div>
                  <label className="text-sm text-on-surface-variant mb-1 block">LinkedIn</label>
                  <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="input" placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className="text-sm text-on-surface-variant mb-1 block">Website</label>
                  <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="input" placeholder="https://..." />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button type="submit" disabled={saving} className="btn btn--primary">
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <Link href="/perfil" className="profile__edit-btn">
                Cancelar
              </Link>
              {message === 'ok' && (
                <span className="text-sm" style={{ color: 'var(--tag-devops)' }} aria-live="polite">
                  ✓ Cambios guardados
                </span>
              )}
              {message === 'error' && (
                <span className="text-sm" style={{ color: '#ff5470' }} aria-live="polite">
                  Hubo un error al guardar
                </span>
              )}
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
