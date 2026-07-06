// Servicios ofrecidos — misma convención que projects.js:
// array de objetos con export default. `startingPrice` es opcional
// (si es null no se renderiza).

const services = [
  {
    id: 1,
    icon: "code",
    title: "Desarrollo Web Full Stack",
    tagline: "De la idea al deploy",
    description:
      "Aplicaciones web completas: frontend moderno, API robusta y base de datos bien diseñada.",
    deliverables: [
      "UI responsive y accesible",
      "API REST documentada",
      "Base de datos y modelos",
      "Deploy en producción",
    ],
    stack: ["React", "Node.js", "Express", "MySQL", "Firebase"],
    startingPrice: null,
    ctaLabel: "Cotizar proyecto",
  },
  {
    id: 2,
    icon: "server",
    title: "APIs y Backends",
    tagline: "El motor de tu producto",
    description:
      "Servicios backend escalables con autenticación, validación y documentación Swagger.",
    deliverables: [
      "Endpoints REST seguros",
      "Autenticación JWT",
      "Documentación Swagger",
      "Pruebas y monitoreo",
    ],
    stack: ["Express", "FastAPI", "Vapor", "MongoDB", "MySQL"],
    startingPrice: null,
    ctaLabel: "Cotizar proyecto",
  },
  {
    id: 3,
    icon: "cloud",
    title: "DevOps y Despliegue",
    tagline: "Tu app siempre en línea",
    description:
      "Pipelines de CI/CD, contenedores y despliegues confiables en la nube.",
    deliverables: [
      "Dockerización del proyecto",
      "Pipeline CI/CD con GitHub Actions",
      "Deploy en DigitalOcean / Vercel / Firebase",
      "Dominio, SSL y monitoreo",
    ],
    stack: ["Docker", "GitHub Actions", "DigitalOcean", "Nginx", "PM2"],
    startingPrice: null,
    ctaLabel: "Cotizar proyecto",
  },
  {
    id: 4,
    icon: "wifi",
    title: "Infraestructura y Redes",
    tagline: "Cimientos sólidos",
    description:
      "Servidores virtualizados, servicios de red y entornos híbridos bien administrados.",
    deliverables: [
      "Virtualización con Proxmox VE",
      "Windows Server (AD, DNS, DHCP)",
      "Diseño de red y subnetting",
      "Documentación del entorno",
    ],
    stack: ["Proxmox", "Windows Server", "Networking"],
    startingPrice: null,
    ctaLabel: "Cotizar proyecto",
  },
  {
    id: 5,
    icon: "monitor",
    title: "Apps de Escritorio y Móvil",
    tagline: "Nativo donde importa",
    description:
      "Aplicaciones de escritorio con Electron y experiencias nativas con SwiftUI o Android.",
    deliverables: [
      "App multiplataforma o nativa",
      "Integración con tu API",
      "Distribución e instaladores",
      "Actualizaciones y soporte",
    ],
    stack: ["Electron", "SwiftUI", "Kotlin", "React"],
    startingPrice: null,
    ctaLabel: "Cotizar proyecto",
  },
  {
    id: 6,
    icon: "cpu",
    title: "IoT e Integración de Hardware",
    tagline: "Del sensor a la nube",
    description:
      "Sensores y microcontroladores conectados a dashboards y servicios web en tiempo real.",
    deliverables: [
      "Firmware para ESP32 / Arduino",
      "API de ingesta de datos",
      "Dashboard en tiempo real",
      "Alertas y automatización",
    ],
    stack: ["ESP32", "Arduino", "Node.js", "MongoDB"],
    startingPrice: null,
    ctaLabel: "Cotizar proyecto",
  },
];

export default services;
