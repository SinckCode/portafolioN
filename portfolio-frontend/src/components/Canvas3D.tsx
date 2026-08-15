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

// Distribuye puntos uniformemente en una esfera grande
function generateStarPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const radius = 10 + Math.random() * 30;
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
  uniform float uPixelRatio;

  attribute float aScale;
  attribute float aPhase;
  attribute float aTwinkleSpeed;

  varying float vAlpha;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // Puntos diminutos — como pixeles de estrellas
    float size = aScale * 1.0 * uPixelRatio;
    gl_PointSize = size * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // Twinkle muy sutil
    float twinkle = sin(uTime * aTwinkleSpeed + aPhase) * 0.5 + 0.5;
    vAlpha = 0.15 + twinkle * 0.45;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vAlpha;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Punto nítido, sin glow exagerado
    float alpha = smoothstep(0.5, 0.15, dist) * vAlpha;

    // Color: gris-azulado muy tenue, como el color de la página
    // El fondo del sitio es ~#0f1115, las estrellas son un gris claro sutil
    vec3 color = vec3(0.55, 0.58, 0.65);

    gl_FragColor = vec4(color, alpha * 0.7);
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
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
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

    // Muchas estrellas tiny
    const STAR_COUNT = 3000;
    const positions = generateStarPositions(STAR_COUNT);
    const scales = new Float32Array(STAR_COUNT);
    const phases = new Float32Array(STAR_COUNT);
    const twinkleSpeeds = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
      // Todas muy pequeñas, alguna ligeramente más grande
      scales[i] = 0.3 + Math.pow(Math.random(), 5) * 0.7;
      phases[i] = Math.random() * Math.PI * 2;
      twinkleSpeeds[i] = 0.2 + Math.random() * 0.8;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(twinkleSpeeds, 1));

    const uniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);

    // Mouse parallax
    const mouse = new THREE.Vector2(0, 0);
    const targetMouse = new THREE.Vector2(0, 0);
    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let scrollY = window.scrollY;
    const handleScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', handleScroll, { passive: true });

    callbacksRef.current.onProgress?.(100);
    requestAnimationFrame(() => {
      callbacksRef.current.onLoaded?.();
    });

    let animationId: number | null = null;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      uniforms.uTime.value = clock.getElapsedTime();
      mouse.lerp(targetMouse, 0.02);

      if (!prefersReducedMotion) {
        // Movimiento muy lento, casi imperceptible
        stars.rotation.y = clock.getElapsedTime() * 0.005 + mouse.x * 0.03;
        stars.rotation.x = mouse.y * 0.02;

        // Fade al hacer scroll
        const vh = window.innerHeight;
        const fadeStart = vh * 0.5;
        const fadeEnd = vh * 1.2;
        const f = Math.min(Math.max((scrollY - fadeStart) / (fadeEnd - fadeStart), 0), 1);
        renderer.domElement.style.opacity = String(1 - f * 0.7);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleVisibility = () => {
      if (document.hidden) {
        if (animationId !== null) { cancelAnimationFrame(animationId); animationId = null; }
      } else if (animationId === null) { clock.start(); animate(); }
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
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationId !== null) cancelAnimationFrame(animationId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="canvas3d-mount" aria-hidden="true" />;
}
