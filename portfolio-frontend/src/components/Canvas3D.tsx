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

// Genera posiciones de particulas en forma toroidal
function generateTorusPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const majorRadius = 2.8;
  const minorRadius = 1.2;

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 2;
    // Dispersión para que no sea un toroide perfecto
    const spread = 0.6;
    const r = minorRadius + (Math.random() - 0.5) * spread;

    positions[i * 3] = (majorRadius + r * Math.cos(phi)) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * 0.6; // aplanar un poco en Y
    positions[i * 3 + 2] = (majorRadius + r * Math.cos(phi)) * Math.sin(theta);
  }
  return positions;
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uPixelRatio;

  attribute float aScale;
  attribute float aPhase;

  varying float vAlpha;
  varying float vDistFromCenter;

  void main() {
    vec3 pos = position;

    // Pulso suave individual por partícula
    float pulse = sin(uTime * 0.8 + aPhase) * 0.08;
    pos *= 1.0 + pulse;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Repulsión del mouse en screen space
    vec2 screenPos = (projectionMatrix * mvPosition).xy / (projectionMatrix * mvPosition).w;
    float distToMouse = distance(screenPos, uMouse);
    float repulsion = smoothstep(0.35, 0.0, distToMouse) * 0.4;
    mvPosition.xy += normalize(screenPos - uMouse + 0.001) * repulsion;

    // Tamaño basado en distancia y escala individual
    float size = aScale * (3.0 + pulse * 2.0) * uPixelRatio;
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // Alpha: más brillante cuando cerca del mouse
    float brightness = smoothstep(0.4, 0.0, distToMouse) * 0.5;
    vAlpha = 0.5 + brightness + pulse * 0.2;
    vDistFromCenter = length(pos.xz) / 4.0;
  }
`;

const fragmentShader = /* glsl */ `
  varying float vAlpha;
  varying float vDistFromCenter;

  void main() {
    // Punto circular suave con glow
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;
    // Color primario #00b4d8 = rgb(0, 180, 216) / 255
    vec3 coreColor = vec3(0.0, 0.706, 0.847);
    // Variación tonal sutil según distancia del centro
    vec3 edgeColor = vec3(0.0, 0.55, 0.75);
    vec3 color = mix(coreColor, edgeColor, vDistFromCenter);

    // Glow extra en el centro del punto
    float glow = smoothstep(0.5, 0.0, dist) * 0.3;
    color += glow;

    gl_FragColor = vec4(color, alpha * 0.85);
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
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 1, 7);
    camera.lookAt(0, 0, 0);

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.touchAction = 'pan-y';
    container.appendChild(renderer.domElement);

    // Partículas procedurales
    const PARTICLE_COUNT = 1800;
    const positions = generateTorusPositions(PARTICLE_COUNT);
    const scales = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      scales[i] = 0.4 + Math.random() * 0.8;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

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

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse tracking (normalizado a clip space -1..1)
    const mouse = new THREE.Vector2(0, 0);
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Scroll tracking
    let scrollY = window.scrollY;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Escena lista instantáneamente (sin descarga)
    callbacksRef.current.onProgress?.(100);
    requestAnimationFrame(() => {
      callbacksRef.current.onLoaded?.();
    });

    // Animation loop
    let autoRotation = 0;
    let animationId: number | null = null;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      uniforms.uTime.value = elapsed;
      uniforms.uMouse.value.lerp(mouse, 0.05); // suavizado

      if (prefersReducedMotion) {
        particles.rotation.y = 0;
      } else {
        autoRotation += 0.0012;
        particles.rotation.y = autoRotation + scrollY * 0.0004;

        // Camera sube ligeramente con scroll
        const vh = window.innerHeight;
        const t = Math.min(scrollY / (vh * 2), 1);
        camera.position.y = 1 + t * 0.5;

        // Fade tras el hero
        const fadeStart = vh * 0.4;
        const fadeEnd = vh * 1.1;
        const f = Math.min(Math.max((scrollY - fadeStart) / (fadeEnd - fadeStart), 0), 1);
        renderer.domElement.style.opacity = String(1 - f * 0.65);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Visibility
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
