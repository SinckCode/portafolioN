'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Icon from './ui/Icon';

/**
 * Segunda via de contacto: la mensajeria interna del sitio.
 *
 * El formulario de arriba manda un correo y ahi se acaba la conversacion para
 * quien escribe: no sabe si llego, no tiene copia y para dar seguimiento tiene
 * que buscar el hilo en su bandeja. La mensajeria del sitio ya existe y resuelve
 * eso, pero nadie la descubre porque vive detras del login.
 *
 * Se muestra debajo del formulario, no en lugar de el: pedirle cuenta a alguien
 * que solo quiere mandar un mensaje es la forma mas rapida de perderlo.
 */
export default function ContactAccountCTA() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="contact-alt">
      <div className="contact-alt__divider">
        <span>o</span>
      </div>

      <div className="contact-alt__card">
        <span className="contact-alt__icon" aria-hidden="true">
          <Icon name="pen" size={20} />
        </span>

        <div className="contact-alt__body">
          {isAuthenticated ? (
            <>
              <h3 className="contact-alt__title">
                Tienes tu bandeja aquí mismo
                {user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </h3>
              <p className="contact-alt__text">
                Escríbeme desde tu cuenta y seguimos la conversación en un hilo,
                sin pasar por el correo.
              </p>
              <div className="contact-alt__actions">
                <Link href="/mensajes" className="contact-button">
                  <Icon name="send" size={16} />
                  Abrir mensajes
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="contact-alt__title">Escríbeme desde el sitio</h3>
              <p className="contact-alt__text">
                Con una cuenta hablamos en un hilo aquí mismo: ves cuándo leí tu
                mensaje, la conversación no se pierde en una bandeja de correo y
                puedes retomarla cuando quieras.
              </p>
              <div className="contact-alt__actions">
                <Link href="/registro" className="contact-button">
                  <Icon name="user" size={16} />
                  Crear cuenta
                </Link>
                <Link href="/login" className="contact-button contact-button--ghost">
                  Ya tengo cuenta
                </Link>
              </div>
              <p className="contact-alt__note">
                Toma menos de un minuto y también te sirve para los cursos.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
