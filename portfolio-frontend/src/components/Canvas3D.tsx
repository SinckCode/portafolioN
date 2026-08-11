'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Canvas 3D con las mejoras del rediseño de la SPA: callbacks de carga,
// controles que no secuestran el scroll, movimiento ligado al scroll,
// fade tras el hero y pausa cuando la pestaña no es visible.

interface Canvas3DProps {
  onProgress?: (pct: number) => void;
  onLoaded?: () => void;
  onError?: (err: unknown) => void;
}

const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
};

export default function Canvas3D({ onProgress, onLoaded, onError }: Canvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onProgress, onLoaded, onError });
  callbacksRef.current = { onProgress, onLoaded, onError };

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const container = containerRef.current;

    const emit = <K extends keyof typeof callbacksRef.current>(
      name: K,
      ...args: unknown[]
    ) => {
      const cb = callbacksRef.current[name] as ((...a: unknown[]) => void) | undefined;
      if (cb) cb(...args);
    };

    if (!isWebGLAvailable()) {
      emit('onError', new Error('WebGL no disponible'));
      return undefined;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      emit('onError', err);
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const scene = new THREE.Scene();
    scene.background = null; // el gradiente CSS del contenedor se ve detrás

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    camera.position.set(0, 1, 5);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.touchAction = 'pan-y';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.5;
    // Órbita vertical limitada a ±0.4 rad alrededor del ecuador
    controls.minPolarAngle = Math.PI / 2 - 0.4;
    controls.maxPolarAngle = Math.PI / 2 + 0.4;
    // Un dedo rota; el scroll táctil vertical no se secuestra
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

    let model: THREE.Group | null = null;
    let autoRotation = 0;

    const loader = new GLTFLoader();
    loader.load(
      '/portafolio.glb',
      (gltf) => {
        model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3()).length();

        model.position.sub(center);
        const scaleFactor = 10 / size;
        model.scale.setScalar(scaleFactor);
        model.position.y += 0.3;

        scene.add(model);

        controls.target.set(0, 0.3, 0);
        controls.update();

        emit('onLoaded');
      },
      (xhr) => {
        if (xhr.total > 0) {
          emit('onProgress', Math.min((xhr.loaded / xhr.total) * 100, 100));
        }
      },
      (error) => {
        console.error('Error loading GLTF model:', error);
        emit('onError', error);
      }
    );

    let scrollY = window.scrollY;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    let animationId: number | null = null;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (model) {
        if (prefersReducedMotion) {
          model.rotation.y = autoRotation;
        } else {
          autoRotation += 0.0015;
          // El scroll aporta rotación extra
          model.rotation.y = autoRotation + scrollY * 0.0006;
        }
      }

      if (!prefersReducedMotion) {
        const vh = window.innerHeight;
        const t = Math.min(scrollY / (vh * 2), 1);
        camera.position.y = 1 + t * 0.6;

        // Fade a 35% tras el hero para dar contraste al contenido
        const fadeStart = vh * 0.4;
        const fadeEnd = vh * 1.1;
        const f = Math.min(Math.max((scrollY - fadeStart) / (fadeEnd - fadeStart), 0), 1);
        renderer.domElement.style.opacity = String(1 - f * 0.65);
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleVisibility = () => {
      if (document.hidden) {
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      } else if (animationId === null) {
        animate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationId !== null) cancelAnimationFrame(animationId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="canvas3d-mount" aria-hidden="true" />;
}
