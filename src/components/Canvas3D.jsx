import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const Canvas3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Cámara
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    camera.position.set(0, 1, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const mountNode = mountRef.current;
    mountNode.appendChild(renderer.domElement);


    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Modelo
    const loader = new GLTFLoader();
    let model = null;

    loader.load(
      process.env.PUBLIC_URL + "/portafolio.glb",
      (gltf) => {
        // Centrar y escalar
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3()).length();

        gltf.scene.position.sub(center);
        const scaleFactor = 10 / size;
        gltf.scene.scale.setScalar(scaleFactor);

        gltf.scene.position.y += 0.3;

        model = gltf.scene;
        scene.add(model);

        // Asegurar que la cámara apunte al centro
        controls.target.set(0, 0.3, 0);
        controls.update();
      },
      undefined,
      (error) => {
        console.error("Error al cargar modelo:", error);
      }
    );

    // Animación
    const animate = () => {
      requestAnimationFrame(animate);
      if (model) {
        model.rotation.y += 0.0015;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (mountNode && renderer.domElement.parentNode === mountNode) {
        mountNode.removeChild(renderer.domElement);
        }
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default Canvas3D;
