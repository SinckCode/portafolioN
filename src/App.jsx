import React from "react";
import Canvas3D from "./components/Canvas3D";
import Header from "./components/Header";
import FloatingMenu from "./components/FloatingMenu";
import DotNavigation from "./components/DotNavigation";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import ProjectsSection from "./components/ProjectsSection";
import ContactSection from "./components/ContactSection";

const App = () => (
  <>
    <Canvas3D />
    <Header />
    <FloatingMenu />
    <DotNavigation />
    <HeroSection />
    <AboutSection />
    <ProjectsSection />
    <ContactSection />
  </>
);

export default App;
