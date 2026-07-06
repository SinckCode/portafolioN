'use client';

import { useLayoutEffect } from 'react';

// Bloquea el scroll del body mientras `locked` sea true (port de la SPA).
const useBodyScrollLock = (locked: boolean): void => {
  useLayoutEffect(() => {
    if (!locked) return undefined;

    const originalOverflow = document.body.style.overflow;
    const originalPadding = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPadding;
    };
  }, [locked]);
};

export default useBodyScrollLock;
