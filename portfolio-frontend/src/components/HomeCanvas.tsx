'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Preloader from '@/components/Preloader';
import CanvasFallback from '@/components/CanvasFallback';

const Canvas3D = dynamic(() => import('@/components/Canvas3D'), { ssr: false });

export default function HomeCanvas() {
  const [modelState, setModelState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [progress, setProgress] = useState(0);

  const handleProgress = useCallback((pct: number) => setProgress(pct), []);
  const handleLoaded = useCallback(() => {
    setProgress(100);
    setModelState('ready');
  }, []);
  const handleError = useCallback(() => setModelState('error'), []);

  // Fallback: si Canvas3D no dispara onLoaded en 3s, forzar ready
  useEffect(() => {
    const timer = setTimeout(() => {
      setModelState((prev) => (prev === 'loading' ? 'ready' : prev));
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {modelState === 'error' ? (
        <CanvasFallback />
      ) : (
        <Canvas3D
          onProgress={handleProgress}
          onLoaded={handleLoaded}
          onError={handleError}
        />
      )}
      <Preloader visible={modelState === 'loading'} progress={progress} />
    </>
  );
}
