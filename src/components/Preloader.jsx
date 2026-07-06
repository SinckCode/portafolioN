import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../estilos/Preloader.css";

const Preloader = ({ visible, progress }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        className="preloader"
        role="status"
        aria-label="Cargando portafolio"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="preloader__monogram" aria-hidden="true">
          AO
        </span>
        <div className="preloader__bar" aria-hidden="true">
          <span
            className="preloader__bar-fill"
            style={{ width: `${Math.min(Math.round(progress), 100)}%` }}
          />
        </div>
        <span className="preloader__pct" aria-hidden="true">
          {Math.min(Math.round(progress), 100)}%
        </span>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Preloader;
