'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import Icon from '@/components/ui/Icon';
import SectionHeading from '@/components/ui/SectionHeading';
import { useScrollReveal } from '@/hooks/useScrollReveal';

// Contacto premium (port de la SPA): labels flotantes, validación,
// honeypot, checkmark animado y cards de contacto con copy-to-clipboard.

const EMAIL = 'soyangeldavid1@gmail.com';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = 'idle' | 'sending' | 'success' | 'error';

const validate = (name: string, value: string): string => {
  switch (name) {
    case 'name':
      return value.trim() === '' ? 'Escribe tu nombre.' : '';
    case 'email':
      if (value.trim() === '') return 'Escribe tu correo.';
      return EMAIL_REGEX.test(value) ? '' : 'Ese correo no parece válido.';
    case 'message':
      if (value.trim() === '') return 'Escribe tu mensaje.';
      return value.trim().length < 10
        ? 'Cuéntame un poco más (mínimo 10 caracteres).'
        : '';
    default:
      return '';
  }
};

const SuccessCheck = () => (
  <motion.svg viewBox="0 0 52 52" className="contact-success__check" aria-hidden="true">
    <motion.circle
      cx="26"
      cy="26"
      r="23"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
    <motion.path
      d="M15 27l8 8 15-16"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.35, delay: 0.45, ease: 'easeOut' }}
    />
  </motion.svg>
);

const infoVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const formVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function ContactSection() {
  const form = useRef<HTMLFormElement>(null);
  const info = useScrollReveal({ once: true, amount: 0.3 });
  const formContainer = useScrollReveal({ once: true, amount: 0.3 });
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [copied, setCopied] = useState(false);

  // ServicesSection dispara este evento al pulsar "Cotizar proyecto"
  useEffect(() => {
    const handlePrefill = (e: Event) => {
      const subject = (e as CustomEvent<{ subject?: string }>).detail?.subject;
      if (!subject) return;
      setStatus('idle');
      setValues((prev) => ({
        ...prev,
        message: `Hola, me interesa el servicio de ${subject}. `,
      }));
    };
    window.addEventListener('contact:prefill', handlePrefill);
    return () => window.removeEventListener('contact:prefill', handlePrefill);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard no disponible; el mailto sigue funcionando
    }
  };

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.current) return;

    // Honeypot anti-spam
    const honeypot = form.current.elements.namedItem('website') as HTMLInputElement | null;
    if (honeypot?.value) return;

    const newErrors = {
      name: validate('name', values.name),
      email: validate('email', values.email),
      message: validate('message', values.message),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setStatus('sending');
    emailjs
      .sendForm('service_302lpx4', 'template_ryuenca', form.current, 'f3miXzQ6E7d-ctWBE')
      .then(
        () => {
          setStatus('success');
          setValues({ name: '', email: '', message: '' });
          setErrors({});
        },
        (error) => {
          setStatus('error');
          console.error(error);
        }
      );
  };

  const field = (name: 'name' | 'email' | 'message') => ({
    id: `contact-${name}`,
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': errors[name] ? ('true' as const) : undefined,
    'aria-describedby': errors[name] ? `contact-${name}-error` : undefined,
    className: `contact-input${errors[name] ? ' contact-input--invalid' : ''}${values[name] ? ' contact-input--filled' : ''}`,
  });

  return (
    <section id="contact" className="contact-section">
      <div className="contact-inner">
        <SectionHeading
          kicker="Contacto"
          title="Hablemos de tu proyecto"
          subtitle="¿Tienes una idea, un proyecto o una vacante? Escríbeme y te respondo pronto."
        />

        <div className="contact-columns">
          <motion.div
            ref={info.ref}
            animate={info.animate}
            variants={infoVariants}
            className="contact-info"
          >
            <div className="contact-card-premium">
              <span className="contact-card-premium__icon" aria-hidden="true">
                <Icon name="mail" size={20} />
              </span>
              <div className="contact-card-premium__body">
                <span className="contact-card-premium__label">Correo</span>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </div>
              <button
                type="button"
                className="contact-card-premium__copy"
                aria-label={copied ? 'Correo copiado' : 'Copiar correo'}
                onClick={handleCopyEmail}
              >
                <Icon name={copied ? 'check' : 'copy'} size={15} />
              </button>
            </div>

            <div className="contact-card-premium">
              <span className="contact-card-premium__icon" aria-hidden="true">
                <Icon name="whatsapp" size={20} />
              </span>
              <div className="contact-card-premium__body">
                <span className="contact-card-premium__label">WhatsApp</span>
                <a
                  href="https://wa.me/524621581879"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +52 462 158 1879
                </a>
              </div>
            </div>

            <div className="contact-card-premium">
              <span className="contact-card-premium__icon" aria-hidden="true">
                <Icon name="github" size={20} />
              </span>
              <div className="contact-card-premium__body">
                <span className="contact-card-premium__label">GitHub</span>
                <a
                  href="https://github.com/SinckCode"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/SinckCode
                </a>
              </div>
            </div>

            <div className="contact-card-premium">
              <span className="contact-card-premium__icon" aria-hidden="true">
                <Icon name="map-pin" size={20} />
              </span>
              <div className="contact-card-premium__body">
                <span className="contact-card-premium__label">Ubicación</span>
                <span className="contact-card-premium__text">
                  Guanajuato, México · remoto disponible
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            ref={formContainer.ref}
            animate={formContainer.animate}
            variants={formVariants}
            className="contact-container"
          >
            {status === 'success' ? (
              <div className="contact-success" role="status">
                <SuccessCheck />
                <h3>¡Mensaje enviado!</h3>
                <p>Gracias por escribir. Te responderé lo antes posible.</p>
                <button
                  type="button"
                  className="contact-button contact-button--ghost"
                  onClick={() => setStatus('idle')}
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form ref={form} onSubmit={sendEmail} className="contact-form" noValidate>
                <div className="contact-field">
                  <input type="text" placeholder=" " {...field('name')} />
                  <label htmlFor="contact-name">Tu nombre</label>
                  {errors.name && (
                    <span id="contact-name-error" className="contact-error">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className="contact-field">
                  <input type="email" placeholder=" " {...field('email')} />
                  <label htmlFor="contact-email">Tu correo</label>
                  {errors.email && (
                    <span id="contact-email-error" className="contact-error">
                      {errors.email}
                    </span>
                  )}
                </div>

                <div className="contact-field">
                  <textarea rows={5} placeholder=" " {...field('message')} />
                  <label htmlFor="contact-message">Tu mensaje</label>
                  {errors.message && (
                    <span id="contact-message-error" className="contact-error">
                      {errors.message}
                    </span>
                  )}
                </div>

                {/* Campos que EmailJS lee del form */}
                <input
                  type="hidden"
                  name="title"
                  value="Nuevo mensaje desde el Portafolio"
                />
                <input type="hidden" name="reply_to" value={values.email} />

                {/* Honeypot anti-spam */}
                <div className="contact-honeypot" aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    type="text"
                    id="contact-website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <button
                  type="submit"
                  className="contact-button"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? (
                    <>
                      <span className="contact-spinner" aria-hidden="true" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <Icon name="send" size={16} />
                      Enviar mensaje
                    </>
                  )}
                </button>

                <div aria-live="polite" className="contact-status">
                  {status === 'error' && (
                    <span className="contact-status--error">
                      <Icon name="alert-circle" size={15} />
                      Hubo un error al enviar. Intenta de nuevo o escríbeme
                      directo al correo.
                    </span>
                  )}
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
