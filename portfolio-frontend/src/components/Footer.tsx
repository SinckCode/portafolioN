'use client';

import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { NAV_LINKS } from '@/lib/navigation';

// Footer slim (port de la SPA): monograma + tagline, nav, sociales,
// copyright y botón back-to-top.
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <span className="site-footer__logo">
            AO<span className="site-footer__logo-dot">.</span>
          </span>
          <p>Full Stack · DevOps · IoT — del hardware a la nube.</p>
        </div>

        <nav className="site-footer__nav" aria-label="Navegación del pie de página">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="site-footer__social">
          <a
            href="https://github.com/SinckCode"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub de Ángel David Onesto"
          >
            <Icon name="github" size={19} />
          </a>
          <a
            href="mailto:soyangeldavid1@gmail.com"
            aria-label="Enviar correo a Ángel David Onesto"
          >
            <Icon name="mail" size={19} />
          </a>
          <a
            href="https://wa.me/524621581879"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escribir por WhatsApp"
          >
            <Icon name="whatsapp" size={19} />
          </a>
        </div>
      </div>

      <div className="site-footer__bottom">
        <span>
          © {new Date().getFullYear()} Ángel David Onesto Frías · Hecho con
          Next.js y Three.js
        </span>
        <button
          type="button"
          className="site-footer__top"
          aria-label="Volver arriba"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Icon name="arrow-up" size={16} />
        </button>
      </div>
    </footer>
  );
}
