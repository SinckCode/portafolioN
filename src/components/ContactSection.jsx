import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";
import "../estilos/ContactSection.css";

const ContactSection = () => {
  const form = useRef();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const sendEmail = (e) => {
    e.preventDefault();
    setLoading(true);

    emailjs
      .sendForm(
        "service_302lpx4",
        "template_ryuenca",
        form.current,
        "f3miXzQ6E7d-ctWBE"
      )
      .then(
        () => {
          setMessage("✅ Tu mensaje fue enviado correctamente.");
          setLoading(false);
          form.current.reset();
        },
        (error) => {
          setMessage("❌ Hubo un error al enviar tu mensaje. Intenta de nuevo.");
          setLoading(false);
          console.error(error);
        }
      );
  };

  return (
    <section id="contact" className="contact-wrapper">
      {/* Fondo blur */}
      <div className="contact-background-blur"></div>

      {/* Contenido real */}
      <div className="contact-section">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="contact-left"
        >
          <div className="contact-card">
            <p>📧 Correo</p>
            <p>soyangeldavid1@gmail.com</p>
            <a href="mailto:soyangeldavid1@gmail.com">Envíame un correo</a>
          </div>

          <div className="contact-card">
            <p>📱 Whatsapp</p>
            <p>+52 4621581879</p>
            <a
              href="https://wa.me/524621581879"
              target="_blank"
              rel="noopener noreferrer"
            >
              Escríbeme por WhatsApp
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="contact-container"
        >
          <h3 className="contact-title">Contáctame</h3>
          <form ref={form} onSubmit={sendEmail} className="contact-form">
            <input
              type="text"
              name="name"
              placeholder="Tu Nombre Completo"
              className="contact-input"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Tu Email"
              className="contact-input"
              required
            />
            <input
              type="hidden"
              name="title"
              value="Nuevo mensaje desde el Portafolio"
            />
            <textarea
              name="message"
              placeholder="Tu Mensaje"
              className="contact-textarea"
              rows="5"
              required
            ></textarea>
            <button type="submit" className="contact-button" disabled={loading}>
              {loading ? "Enviando..." : "Enviar Mensaje"}
            </button>
          </form>
          {message && <p className="contact-message">{message}</p>}
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
