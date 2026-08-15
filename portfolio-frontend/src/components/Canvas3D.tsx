'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

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

// Genera posiciones aleatorias en una esfera grande (cielo estrellado)
function generateStarPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Distribución uniforme en esfera con radio entre 8 y 25
    const radius = 8 + Math.random() * 17;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  return positions;
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;

  attribute float aScale;
  attribute float aPhase;
  attribute float aTwinkleSpeed;
  attribute float aColorMix;

  varying float vAlpha;
  varying float vColorMix;

  void main() {
    vec3 pos = position;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Tamaño variado — estrellas más grandes y más pequeñas
    float size = aScale * 2.5 * uPixelRatio;
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // Twinkle: cada estrella parpadea a su propio ritmo
    float twinkle = sin(uTime * aTwinkleSpeed + aPhase) * 0.5 + 0.5;
    vAlpha = 0.3 + twinkle * 0.7;
    vColorMix = aColorMix;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vAlpha;
  varying float vColorMix;

  void main() {
    // Punto circular suave
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.05, dist) * vAlpha;

    // Mezcla entre blanco puro y azul-claro sutil
    vec3 white = vec3(1.0, 1.0, 1.0);
    vec3 lightBlue = vec3(0.7, 0.85, 1.0);
    vec3 color = mix(white, lightBlue, vColorMix);

    // Glow sutil en el centro
    float glow = smoothstep(0.5, 0.0, dist) * 0.15;
    color += glow;

    gl_FragColor = vec4(color, alpha * 0.9);
  }
`;

export default function Canvas3D({ onProgress, onLoaded, onError }: Canvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onProgress, onLoaded, onError });
  callbacksRef.current = { onProgress, onLoaded, onError };

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const container = containerRef.current;

    if (!isWebGLAvailable()) {
      callbacksRef.current.onError?.(new Error('WebGL no disponible'));
      return undefined;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      callbacksRef.current.onError?.(err);
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 0);

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.touchAction = 'pan-y';
    container.appendChild(renderer.domElement);

    // Estrellas
    const STAR_COUNT = 2200;
    const positions = generateStarPositions(STAR_COUNT);
    const scales = new Float32Array(STAR_COUNT);
    const phases = new Float32Array(STAR_COUNT);
    const twinkleSpeeds = new Float32Array(STAR_COUNT);
    const colorMixes = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      // Mayoría pequeñas, algunas grandes (distribución exponencial)
      scales[i] = 0.2 + Math.pow(Math.random(), 3) * 1.2;
      phases[i] = Math.random() * Math.PI * 2;
      twinkleSpeeds[i] = 0.3 + Math.random() * 1.5;
      // 70% blancas, 30% azuladas
      colorMixes[i] = Math.random() < 0.7 ? Math.random() * 0.15 : 0.3 + Math.random() * 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(twinkleSpeeds, 1));
    geometry.setAttribute('aColorMix', new THREE.BufferAttribute(colorMixes, 1));

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: pixelRatio },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);

    // Mouse tracking para parallax sutil
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);
    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Scroll tracking
    let scrollY = window.scrollY;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Escena lista instantáneamente
    callbacksRef.current.onProgress?.(100);
    requestAnimationFrame(() => {
      callbacksRef.current.onLoaded?.();
    });

    // Animation loop
    let animationId: number | null = null;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      uniforms.uTime.value = elapsed;

      // Parallax suave del campo de estrellas con el mouse
      mouse.lerp(targetMouse, 0.03);

      if (!prefersReducedMotion) {
        // Rotación muy lenta del campo estelar
        stars.rotation.y = elapsed * 0.015 + mouse.x * 0.08;
        stars.rotation.x = mouse.y * 0.05;

        // Fade tras el hero
        const vh = window.innerHeight;
        const fadeStart = vh * 0.4;
        const fadeEnd = vh * 1.1;
        const f = Math.min(Math.max((scrollY - fadeStart) / (fadeEnd - fadeStart), 0), 1);
        renderer.domElement.style.opacity = String(1 - f * 0.65);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Visibility pause
    const handleVisibility = () => {
      if (document.hidden) {
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      } else if (animationId === null) {
        clock.start();
        animate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationId !== null) cancelAnimationFrame(animationId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="canvas3d-mount" aria-hidden="true" />;
}
