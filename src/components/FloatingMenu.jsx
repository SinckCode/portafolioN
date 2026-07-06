import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "./ui/Icon";
import useActiveSection from "../hooks/useActiveSection";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import useFocusTrap from "../hooks/useFocusTrap";
import { SECTIONS, SECTION_IDS } from "../navigation";
import "../estilos/FloatingMenu.css";

const sheetVariants = {
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { y: "100%", transition: { duration: 0.25, ease: "easeIn" } },
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const FloatingMenu = () => {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(SECTION_IDS);
  const sheetRef = useRef(null);

  useBodyScrollLock(open);
  useFocusTrap(sheetRef, open);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`floating-btn${open ? " open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="floating-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
            />
            <motion.nav
              ref={sheetRef}
              className="floating-sheet"
              aria-label="Menú de navegación"
              variants={sheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <span className="floating-sheet__handle" aria-hidden="true" />
              <motion.ul variants={listVariants} initial="hidden" animate="visible">
                {SECTIONS.map((section) => (
                  <motion.li key={section.id} variants={itemVariants}>
                    <a
                      href={`#${section.id}`}
                      className={active === section.id ? "active" : ""}
                      aria-current={active === section.id ? "true" : undefined}
                      onClick={() => setOpen(false)}
                    >
                      <Icon name={section.icon} size={18} />
                      <span>{section.label}</span>
                    </a>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingMenu;
