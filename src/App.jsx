import React, { useCallback, useEffect, useState } from "react";
import Canvas3D from "./components/Canvas3D";
import CanvasFallback from "./components/CanvasFallback";
import Preloader from "./components/Preloader";
import Header from "./components/Header";
import FloatingMenu from "./components/FloatingMenu";
import DotNavigation from "./components/DotNavigation";
import ScrollProgress from "./components/ScrollProgress";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import ServicesSection from "./components/ServicesSection";
import ProjectsSection from "./components/ProjectsSection";
import BlogSection from "./components/BlogSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";

const App = () => {
  // Estado de carga del modelo 3D: loading | ready | error
  const [modelState, setModelState] = useState("loading");
  const [progress, setProgress] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  // El preloader nunca bloquea más de 8s aunque el modelo siga cargando
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const handleProgress = useCallback((pct) => setProgress(pct), []);
  const handleLoaded = useCallback(() => {
    setProgress(100);
    setModelState("ready");
  }, []);
  const handleError = useCallback(() => setModelState("error"), []);

  const showPreloader = modelState === "loading" && !timedOut;

  return (
    <>
      {modelState === "error" ? (
        <CanvasFallback />
      ) : (
        <Canvas3D
          onProgress={handleProgress}
          onLoaded={handleLoaded}
          onError={handleError}
        />
      )}
      <Preloader visible={showPreloader} progress={progress} />
      <ScrollProgress />
      <Header />
      <FloatingMenu />
      <DotNavigation />
      <HeroSection modelState={modelState} />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <BlogSection />
      <ContactSection />
      <Footer />
    </>
  );
};

export default App;
