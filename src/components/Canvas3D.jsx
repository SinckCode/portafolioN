import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "../estilos/Canvas3D.css";

const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch (e) {
    return false;
  }
};

const Canvas3D = ({ onProgress, onLoaded, onError }) => {
  const mountRef = useRef(null);
  // Los callbacks viven en un ref para que el efecto no dependa de su identidad.
  const callbacksRef = useRef({ onProgress, onLoaded, onError });
  callbacksRef.current = { onProgress, onLoaded, onError };

  useEffect(() => {
    const emit = (name, ...args) => {
      const cb = callbacksRef.current[name];
      if (cb) cb(...args);
    };

    if (!isWebGLAvailable()) {
      emit("onError", new Error("WebGL no disponible"));
      return undefined;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      emit("onError", err);
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    camera.position.set(0, 1, 5);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.touchAction = "pan-y";

    const mountNode = mountRef.current;
    mountNode.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.5;
    // Limita la órbita vertical a ±0.4 rad alrededor del ecuador
    controls.minPolarAngle = Math.PI / 2 - 0.4;
    controls.maxPolarAngle = Math.PI / 2 + 0.4;
    // Un dedo rota, el gesto de dos dedos queda libre: el scroll táctil no se secuestra
    controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.NONE };

    const loader = new GLTFLoader();
    let model = null;
    let autoRotation = 0;

    loader.load(
      process.env.PUBLIC_URL + "/portafolio.glb",
      (gltf) => {
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3()).length();

        gltf.scene.position.sub(center);
        const scaleFactor = 10 / size;
        gltf.scene.scale.setScalar(scaleFactor);
        gltf.scene.position.y += 0.3;

        model = gltf.scene;
        scene.add(model);

        controls.target.set(0, 0.3, 0);
        controls.update();

        emit("onLoaded");
      },
      (xhr) => {
        if (xhr.total > 0) {
          emit("onProgress", Math.min((xhr.loaded / xhr.total) * 100, 100));
        }
      },
      (error) => {
        console.error("Error al cargar modelo:", error);
        emit("onError", error);
      }
    );

    let scrollY = window.scrollY;
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    let frameId = null;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      if (model) {
        if (prefersReducedMotion) {
          model.rotation.y = autoRotation;
        } else {
          autoRotation += 0.0015;
          // El scroll aporta rotación extra: el modelo "acompaña" el recorrido
          model.rotation.y = autoRotation + scrollY * 0.0006;
        }
      }

      if (!prefersReducedMotion) {
        const vh = window.innerHeight;
        const t = Math.min(scrollY / (vh * 2), 1);
        camera.position.y = 1 + t * 0.6;

        // Después del hero el canvas baja a 35% de opacidad para dar contraste al texto
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
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
      } else if (frameId === null) {
        animate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibility);
      controls.dispose();
      if (mountNode && renderer.domElement.parentNode === mountNode) {
        mountNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="canvas3d-mount" aria-hidden="true" />;
};

export default Canvas3D;
