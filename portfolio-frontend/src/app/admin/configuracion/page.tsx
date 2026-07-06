'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminConfiguracion() {
  const { accessToken } = useAuth();
  const [config, setConfig] = useState({
    siteName: '', siteDescription: '', ownerName: '', ownerEmail: '', ownerBio: '',
    logoUrl: '', faviconUrl: '', maintenanceMode: false, analyticsId: '',
    socialLinks: { github: '', linkedin: '', twitter: '', youtube: '', instagram: '' },
    hero: { title: '', subtitle: '', ctaText: '', ctaLink: '' },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchConfig(); }, []);

  async function fetchConfig() {
    try {
      const data = await api.getSiteConfig() as any;
      setConfig(prev => ({ ...prev, ...data, socialLinks: { ...prev.socialLinks, ...data.socialLinks }, hero: { ...prev.hero, ...data.hero } }));
    } catch { /* empty */ } finally { setLoading(false); }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await api.updateSiteConfig(config, accessToken!);
    setSaving(false);
  }

  if (loading) return <p className="admin-form__label">Cargando...</p>;

  return (
    <div>
      <h1 className="admin-page__title mb-6">Configuracion del Sitio</h1>
      <form onSubmit={handleSave} className="space-y-6">
        <section className="admin-card p-6">
          <h2 className="admin-page__title mb-4">General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="admin-form__label">Nombre del sitio</label><input value={config.siteName} onChange={e => setConfig({...config, siteName: e.target.value})} className="input w-full" /></div>
            <div><label className="admin-form__label">Email</label><input value={config.ownerEmail} onChange={e => setConfig({...config, ownerEmail: e.target.value})} className="input w-full" /></div>
            <div><label className="admin-form__label">Nombre del propietario</label><input value={config.ownerName} onChange={e => setConfig({...config, ownerName: e.target.value})} className="input w-full" /></div>
            <div><label className="admin-form__label">Analytics ID</label><input value={config.analyticsId} onChange={e => setConfig({...config, analyticsId: e.target.value})} className="input w-full" /></div>
          </div>
          <div className="mt-4"><label className="admin-form__label">Descripcion</label><textarea value={config.siteDescription} onChange={e => setConfig({...config, siteDescription: e.target.value})} className="input w-full h-20" /></div>
          <div className="mt-4"><label className="admin-form__label">Bio</label><textarea value={config.ownerBio} onChange={e => setConfig({...config, ownerBio: e.target.value})} className="input w-full h-20" /></div>
          <label className="admin-form__label flex items-center gap-2 mt-4">
            <input type="checkbox" checked={config.maintenanceMode} onChange={e => setConfig({...config, maintenanceMode: e.target.checked})} />
            Modo mantenimiento
          </label>
        </section>

        <section className="admin-card p-6">
          <h2 className="admin-page__title mb-4">Redes Sociales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(config.socialLinks).map(([key, val]) => (
              <div key={key}><label className="admin-form__label capitalize">{key}</label><input value={val} onChange={e => setConfig({...config, socialLinks: {...config.socialLinks, [key]: e.target.value}})} className="input w-full" /></div>
            ))}
          </div>
        </section>

        <section className="admin-card p-6">
          <h2 className="admin-page__title mb-4">Hero</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="admin-form__label">Titulo</label><input value={config.hero.title} onChange={e => setConfig({...config, hero: {...config.hero, title: e.target.value}})} className="input w-full" /></div>
            <div><label className="admin-form__label">Subtitulo</label><input value={config.hero.subtitle} onChange={e => setConfig({...config, hero: {...config.hero, subtitle: e.target.value}})} className="input w-full" /></div>
            <div><label className="admin-form__label">CTA Texto</label><input value={config.hero.ctaText} onChange={e => setConfig({...config, hero: {...config.hero, ctaText: e.target.value}})} className="input w-full" /></div>
            <div><label className="admin-form__label">CTA Link</label><input value={config.hero.ctaLink} onChange={e => setConfig({...config, hero: {...config.hero, ctaLink: e.target.value}})} className="input w-full" /></div>
          </div>
        </section>

        <button type="submit" disabled={saving} className="btn btn--primary px-8 py-2.5 disabled:opacity-50">
          {saving ? 'Guardando...' : 'Guardar Configuracion'}
        </button>
      </form>
    </div>
  );
}
