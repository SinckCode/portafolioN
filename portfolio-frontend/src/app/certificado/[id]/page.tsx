'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import type { Certificate } from '@/types';

export default function CertificadoPage() {
  const params = useParams();
  const id = params.id as string;

  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCertificate() {
      try {
        const data = await api.getCertificate(id) as Certificate;
        setCert(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Certificado no encontrado');
      } finally {
        setLoading(false);
      }
    }
    fetchCertificate();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="certificate">
          <div className="certificate__card">
            <p className="text-on-surface-variant">Verificando certificado...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !cert) {
    return (
      <>
        <Header />
        <div className="certificate">
          <div className="certificate__card">
            <div className="certificate__badge" style={{ background: 'linear-gradient(135deg, #ef4444, rgba(239,68,68,0.4))' }}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="certificate__title">Certificado no encontrado</h1>
            <p className="certificate__subtitle">{error || 'El certificado solicitado no existe o ha sido revocado.'}</p>
            <Link href="/cursos" className="btn btn--primary">Ver cursos</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="certificate">
        <div className="certificate__card">
          <div className="certificate__badge">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <h1 className="certificate__title">Certificado de Finalizacion</h1>
          <p className="certificate__subtitle">
            Se certifica que <strong>{typeof cert.user === 'object' ? cert.user.name : cert.user}</strong> ha
            completado exitosamente el curso
          </p>

          <h2 className="certificate__title" style={{ fontSize: '1.25rem', color: '#4cd6fb' }}>
            {typeof cert.course === 'object' ? cert.course.title : cert.course}
          </h2>

          <div className="certificate__details">
            <div>
              <p className="certificate__label">Fecha de emision</p>
              <p className="certificate__value">
                {new Date(cert.issuedAt).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="certificate__label">Plataforma</p>
              <p className="certificate__value">angelonesto.com</p>
            </div>
          </div>

          <div className="certificate__number">
            ID: {cert.certificateNumber || cert._id}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
