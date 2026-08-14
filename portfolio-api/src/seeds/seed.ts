import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

async function seed() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('SEED_ADMIN_PASSWORD env var is required to run the seed');
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  // Seed admin user
  const userModel = app.get<Model<any>>(getModelToken('User'));
  const existingAdmin = await userModel.findOne({ email: 'admin@angelonesto.com' });
  if (!existingAdmin) {
    await userModel.create({
      email: 'admin@angelonesto.com',
      passwordHash: await bcrypt.hash(adminPassword, 12),
      name: 'Angel Onesto',
      role: 'admin',
      isVerified: true,
      avatar: '/images/avatar.webp',
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  // Seed categories
  const categoryModel = app.get<Model<any>>(getModelToken('Category'));
  const categories = [
    { name: 'Desarrollo Web', slug: 'desarrollo-web', description: 'Proyectos de desarrollo web full stack', type: 'project' },
    { name: 'Aplicaciones Moviles', slug: 'aplicaciones-moviles', description: 'Apps para iOS y Android', type: 'project' },
    { name: 'IoT', slug: 'iot', description: 'Internet de las cosas con ESP32 y sensores', type: 'project' },
    { name: 'Desktop', slug: 'desktop', description: 'Aplicaciones de escritorio', type: 'project' },
    { name: 'Infraestructura', slug: 'infraestructura', description: 'DevOps, servidores, cloud', type: 'project' },
    { name: 'Tutorial', slug: 'tutorial', description: 'Tutoriales paso a paso', type: 'post' },
    { name: 'Reflexion', slug: 'reflexion', description: 'Reflexiones sobre tecnologia', type: 'post' },
    { name: 'DevOps', slug: 'devops', description: 'CI/CD, Docker, Kubernetes', type: 'post' },
    { name: 'Desarrollo Web', slug: 'desarrollo-web-curso', description: 'Cursos de desarrollo web', type: 'course' },
    { name: 'DevOps', slug: 'devops-curso', description: 'Cursos de DevOps y CI/CD', type: 'course' },
    { name: 'IoT', slug: 'iot-curso', description: 'Cursos de IoT y hardware', type: 'course' },
  ];

  for (const cat of categories) {
    await categoryModel.updateOne({ slug: cat.slug }, { $set: cat }, { upsert: true });
  }
  console.log(`${categories.length} categories seeded`);

  // Seed projects (real data)
  const projectModel = app.get<Model<any>>(getModelToken('Project'));
  const projects = [
    { title: 'Optistock', slug: 'optistock', description: 'Sistema de inventario completo con interfaz web y aplicacion Java.', technologies: ['Java', 'React', 'Firebase'], type: 'Fullstack', date: '2023-04-12', featured: false, status: 'completed', sortOrder: 1, images: Array.from({ length: 6 }, (_, i) => `/projects/optistock/optistock${i + 1}.png`), repos: { frontend: 'https://github.com/SinckCode/optistock-Webpage', backend: 'https://github.com/SinckCode/optistock-Proyecto' }, demo: 'https://optistock-3e8c4.web.app/' },
    { title: 'Cata Outlet', slug: 'cata-outlet', description: 'Sistema de gestion de pagos para una tienda de ropa y joyeria.', technologies: ['React', 'Firebase'], type: 'Frontend', date: '2024-07-08', featured: false, status: 'completed', sortOrder: 2, images: Array.from({ length: 5 }, (_, i) => `/projects/cataOutlet/cataoutlet${i + 1}.png`), repos: { frontend: 'https://github.com/SinckCode/Cata-Outlet' }, demo: 'https://cata-outlet.web.app/' },
    { title: 'Mi App Electron', slug: 'mi-app-electron', description: 'Aplicacion de escritorio creada con Electron y React.', technologies: ['Electron', 'React', 'JavaScript'], type: 'Desktop', date: '2024-04-12', featured: false, status: 'completed', sortOrder: 3, images: Array.from({ length: 5 }, (_, i) => `/projects/miappElectron/miappElectron${i + 1}.png`), repos: { frontend: 'https://github.com/SinckCode/my-app', backend: 'https://github.com/SinckCode/mi-app-electron-react1' } },
    { title: 'Sistema de Gestion de Videojuegos', slug: 'gestion-videojuegos', description: 'Plataforma web integral para gestionar consolas, juegos, perifericos, clientes y ventas.', technologies: ['Node.js', 'Express', 'SQL Server', 'React', 'JavaScript'], type: 'Web', date: '2024-12-10', featured: false, status: 'completed', sortOrder: 4, images: Array.from({ length: 5 }, (_, i) => `/projects/proyectoft/proyectoft${i + 1}.png`), repos: { frontend: 'https://github.com/SinckCode/proyectoft' } },
    { title: 'Super Gym', slug: 'super-gym', description: 'Sistema web completo para gimnasios con API backend.', technologies: ['Node.js', 'Express', 'MongoDB', 'JavaScript', 'HTML', 'CSS'], type: 'Web', date: '2024-07-12', featured: false, status: 'completed', sortOrder: 5, images: Array.from({ length: 6 }, (_, i) => `/projects/superGym/superGym${i + 1}.png`), repos: { frontend: 'https://github.com/SinckCode/superGym' } },
    { title: 'AI Text Summarizer App', slug: 'ai-text-summarizer', description: 'Aplicacion web que resume textos largos utilizando inteligencia artificial.', technologies: ['Node.js', 'Express', 'Hugging Face API', 'JavaScript'], type: 'Web', date: '2024-12-12', featured: false, status: 'completed', sortOrder: 6, images: ['/projects/ai-text-summarizer-app/ai-text-summarizer-app1.png'], repos: { frontend: 'https://github.com/SinckCode/AI-Text-Summarizer-App' }, demo: 'https://ai-text-summarizer-app-90781.web.app/' },
    { title: 'Sistema de Control de Acceso IoT', slug: 'control-acceso-iot', description: 'Solucion completa de control de acceso con ESP32, API REST y app multiplataforma.', technologies: ['Node.js', 'Express', 'MySQL', 'ESP32', '.NET MAUI', 'C#'], type: 'IoT / Fullstack', date: '2025-06-25', featured: true, status: 'completed', sortOrder: 7, images: [...Array.from({ length: 8 }, (_, i) => `/projects/api-control-acceso/appControlAcceso${i + 1}.jpg`), '/projects/api-control-acceso/api-control-acceso.png'], repos: { frontend: 'https://github.com/SinckCode/appControlAccess', backend: 'https://github.com/SinckCode/api-control-acceso', hardware: 'https://github.com/SinckCode/sketchControlAccesoEsp32' } },
    { title: 'LibreriaApi', slug: 'libreria-api', description: 'API RESTful y frontend React para gestion de catalogos de libros con autenticacion JWT.', technologies: ['FastAPI', 'Python', 'SQLite', 'React', 'JavaScript', 'DigitalOcean', 'Nginx', 'PM2'], type: 'Fullstack', date: '2025-06-15', featured: true, status: 'completed', sortOrder: 8, images: Array.from({ length: 7 }, (_, i) => `/projects/LibreriaApi/LibreriaApi${i + 1}.png`), repos: { frontend: 'https://github.com/SinckCode/LibreriaFront', backend: 'https://github.com/SinckCode/LibreriaApi' }, demo: 'https://libreriaapp-ca5dd.web.app/' },
    { title: 'OrgSync', slug: 'orgsync', description: 'Sistema integral de gestion organizacional con autenticacion JWT.', technologies: ['Node.js', 'Express', 'MongoDB', 'Mongoose', 'React', 'JWT', 'Swagger', 'Axios'], type: 'Fullstack', date: '2024-07-12', featured: false, status: 'completed', sortOrder: 9, images: Array.from({ length: 7 }, (_, i) => `/projects/OrgSync/OrgSync${i + 1}.png`), repos: { frontend: 'https://github.com/SinckCode/OrgSyncFront', backend: 'https://github.com/SinckCode/OrgSyncBack' } },
    { title: 'GameVault', slug: 'gamevault', description: 'Aplicacion estilo wiki para consultar videojuegos y empresas desarrolladoras.', technologies: ['SwiftUI', 'Vapor', 'MySQL', 'Docker', 'DigitalOcean'], type: 'macOS App', date: '2025-06-10', featured: true, status: 'completed', sortOrder: 10, images: Array.from({ length: 8 }, (_, i) => `/projects/gameVault/GameVault${i + 1}.png`), repos: { frontend: 'https://github.com/SinckCode/gameVault', backend: 'https://github.com/SinckCode/gameVault-Api' } },
    { title: 'CRECIBV', slug: 'crecibv', description: 'Sitio web institucional para asociacion civil que apoya a personas con discapacidad visual.', technologies: ['React', 'SCSS', 'Firebase Auth', 'Firebase Firestore', 'Firebase Hosting', 'Firebase Storage'], type: 'Web', date: '2025-02-12', featured: false, status: 'completed', sortOrder: 11, images: Array.from({ length: 14 }, (_, i) => `/projects/Crecibv/CRECIBV${i + 1}.png`), repos: { frontend: 'https://github.com/SinckCode/Crecibv' }, demo: 'https://crecibv.web.app' },
    { title: 'Succeding Media', slug: 'succeding-media', description: 'Agencia creativa digital especializada en desarrollo web y branding.', technologies: ['React', 'Tailwind', 'Node.js', 'Express', 'MongoDB', 'Firebase', 'Vercel', 'Render'], type: 'Web', date: '2024-08-12', featured: false, status: 'completed', sortOrder: 12, images: Array.from({ length: 14 }, (_, i) => `/projects/succedingMedia/succedingMedia${i + 1}.png`), repos: { frontend: 'https://github.com/SinckCode/frontendSM01', backend: 'https://github.com/SinckCode/backendSM01' } },
    { title: 'Amazon Clone', slug: 'amazon-clone', description: 'Clon funcional del sitio Amazon con carrito, login, pagos y ordenes.', technologies: ['React', 'Firebase', 'Stripe', 'Context API', 'Axios'], type: 'Web', date: '2022-03-12', featured: false, status: 'completed', sortOrder: 13, images: Array.from({ length: 7 }, (_, i) => `/projects/AmazonClone/AmazonClone${i + 1}.png`), repos: { frontend: 'https://github.com/SinckCode/AmazonClone' }, demo: 'https://clone-eca80.web.app/' },
    { title: 'Clima Aula', slug: 'clima-aula', description: 'Sistema IoT + Web que monitorea en tiempo real las condiciones ambientales de un aula.', technologies: ['ESP32', 'Arduino', 'Node.js', 'Express', 'MongoDB', 'React', 'GitHub Actions', 'CI/CD', 'IoT'], type: 'IoT / Web', date: '2025-12-04', featured: true, status: 'completed', sortOrder: 14, images: Array.from({ length: 6 }, (_, i) => `/projects/SensoresClima/SensoresClima${i + 1}.png`), repos: { frontend: 'https://github.com/SinckCode/clima-web', backend: 'https://github.com/SinckCode/SensoresApi' }, demo: 'https://clima.angelonesto.com/' },
    { title: 'WhatsUpEarth', slug: 'whatsupearth', description: 'Dashboard interactivo que consume la API EONET de la NASA para visualizar eventos naturales.', technologies: ['React', 'Node.js', 'Express', 'REST API', 'NASA EONET API', 'GitHub Actions', 'CI/CD'], type: 'Web', date: '2025-11-15', featured: true, status: 'completed', sortOrder: 15, images: Array.from({ length: 13 }, (_, i) => `/projects/whatsUpEarth/whatsUpEarth${i + 1}.png`), repos: { frontend: 'https://github.com/SinckCode/whatsup-earth', backend: 'https://github.com/SinckCode/Whasup-earthBack' }, demo: 'https://whatsupearth.angelonesto.com/' },
    { title: 'Proyecto Final de Redes', slug: 'proyecto-redes', description: 'Diseno y simulacion de red empresarial completa en Cisco Packet Tracer.', technologies: ['Cisco Packet Tracer', 'Networking', 'VLSM', 'Subnetting', 'DMZ', 'TCP/IP', 'Routing'], type: 'Networking', date: '2025-11-11', featured: false, status: 'completed', sortOrder: 16, images: Array.from({ length: 8 }, (_, i) => `/projects/proyecFinRedes/proyecFinRedes${i + 1}.png`), repos: {} },
    { title: 'MyGameShelf', slug: 'mygameshelf', description: 'App Android con Jetpack Compose que consume API propia para gestionar videojuegos.', technologies: ['Android', 'Jetpack Compose', 'Kotlin', 'MVVM', 'Vapor (Swift)', 'Proxmox'], type: 'Mobile / Fullstack', date: '2025-11-25', featured: true, status: 'completed', sortOrder: 17, images: Array.from({ length: 12 }, (_, i) => `/projects/MyGameShelf/MyGameShelf${i + 1}.png`), repos: { frontend: 'https://github.com/SinckCode/MyGameShelf', backend: 'https://github.com/SinckCode/MyGameShelfApi' } },
  ];

  for (const proj of projects) {
    await projectModel.updateOne({ slug: proj.slug }, { $set: proj }, { upsert: true });
  }
  console.log(`${projects.length} projects seeded`);

  // Seed services (mismo contenido que la SPA src/services.js)
  const serviceModel = app.get<Model<any>>(getModelToken('Service'));
  const services = [
    { title: 'Desarrollo Web Full Stack', slug: 'desarrollo-web-full-stack', icon: 'code', tagline: 'De la idea al deploy', description: 'Aplicaciones web completas: frontend moderno, API robusta y base de datos bien diseñada.', deliverables: ['UI responsive y accesible', 'API REST documentada', 'Base de datos y modelos', 'Deploy en producción'], stack: ['React', 'Node.js', 'Express', 'MySQL', 'Firebase'], startingPrice: null, ctaLabel: 'Cotizar proyecto', order: 1, status: 'active' },
    { title: 'APIs y Backends', slug: 'apis-y-backends', icon: 'server', tagline: 'El motor de tu producto', description: 'Servicios backend escalables con autenticación, validación y documentación Swagger.', deliverables: ['Endpoints REST seguros', 'Autenticación JWT', 'Documentación Swagger', 'Pruebas y monitoreo'], stack: ['Express', 'FastAPI', 'Vapor', 'MongoDB', 'MySQL'], startingPrice: null, ctaLabel: 'Cotizar proyecto', order: 2, status: 'active' },
    { title: 'DevOps y Despliegue', slug: 'devops-y-despliegue', icon: 'cloud', tagline: 'Tu app siempre en línea', description: 'Pipelines de CI/CD, contenedores y despliegues confiables en la nube.', deliverables: ['Dockerización del proyecto', 'Pipeline CI/CD con GitHub Actions', 'Deploy en DigitalOcean / Vercel / Firebase', 'Dominio, SSL y monitoreo'], stack: ['Docker', 'GitHub Actions', 'DigitalOcean', 'Nginx', 'PM2'], startingPrice: null, ctaLabel: 'Cotizar proyecto', order: 3, status: 'active' },
    { title: 'Infraestructura y Redes', slug: 'infraestructura-y-redes', icon: 'wifi', tagline: 'Cimientos sólidos', description: 'Servidores virtualizados, servicios de red y entornos híbridos bien administrados.', deliverables: ['Virtualización con Proxmox VE', 'Windows Server (AD, DNS, DHCP)', 'Diseño de red y subnetting', 'Documentación del entorno'], stack: ['Proxmox', 'Windows Server', 'Networking'], startingPrice: null, ctaLabel: 'Cotizar proyecto', order: 4, status: 'active' },
    { title: 'Apps de Escritorio y Móvil', slug: 'apps-escritorio-y-movil', icon: 'monitor', tagline: 'Nativo donde importa', description: 'Aplicaciones de escritorio con Electron y experiencias nativas con SwiftUI o Android.', deliverables: ['App multiplataforma o nativa', 'Integración con tu API', 'Distribución e instaladores', 'Actualizaciones y soporte'], stack: ['Electron', 'SwiftUI', 'Kotlin', 'React'], startingPrice: null, ctaLabel: 'Cotizar proyecto', order: 5, status: 'active' },
    { title: 'IoT e Integración de Hardware', slug: 'iot-e-integracion-de-hardware', icon: 'cpu', tagline: 'Del sensor a la nube', description: 'Sensores y microcontroladores conectados a dashboards y servicios web en tiempo real.', deliverables: ['Firmware para ESP32 / Arduino', 'API de ingesta de datos', 'Dashboard en tiempo real', 'Alertas y automatización'], stack: ['ESP32', 'Arduino', 'Node.js', 'MongoDB'], startingPrice: null, ctaLabel: 'Cotizar proyecto', order: 6, status: 'active' },
  ];

  for (const svc of services) {
    await serviceModel.updateOne({ slug: svc.slug }, { $set: svc }, { upsert: true });
  }
  console.log(`${services.length} services seeded`);

  // Seed example courses
  const courseModel = app.get<Model<any>>(getModelToken('Course'));
  const adminUser = await userModel.findOne({ email: 'admin@angelonesto.com' });
  const devopsCategory = await categoryModel.findOne({ slug: 'devops-curso' });
  const webCategory = await categoryModel.findOne({ slug: 'desarrollo-web-curso' });

  const courses = [
    {
      title: 'Docker y CI/CD desde cero',
      slug: 'docker-y-cicd-desde-cero',
      description:
        'Aprende a contenerizar tus aplicaciones y a construir pipelines de despliegue automático con GitHub Actions. Curso práctico basado en proyectos reales: al final tendrás tu propia app desplegándose sola con cada push.',
      instructor: adminUser?._id,
      category: devopsCategory?._id,
      level: 'beginner',
      duration: '4h 30m',
      price: 0,
      status: 'published',
      tags: ['Docker', 'CI/CD', 'GitHub Actions', 'DevOps'],
      requirements: ['Conocimientos básicos de terminal', 'Una cuenta de GitHub', 'Node.js instalado'],
      whatYouLearn: [
        'Crear Dockerfiles multi-stage optimizados',
        'Orquestar servicios con docker compose',
        'Construir pipelines de CI/CD con GitHub Actions',
        'Desplegar a un servidor propio con SSH y contenedores',
      ],
      modules: [
        {
          title: 'Fundamentos de Docker',
          order: 1,
          lessons: [
            { title: 'Bienvenida y qué vamos a construir', slug: 'bienvenida', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 8, isFree: true, order: 1 },
            { title: 'Instalación de Docker en Windows, Mac y Linux', slug: 'instalacion-docker', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 12, isFree: true, order: 2 },
            { title: 'Imágenes vs contenedores: los conceptos clave', slug: 'imagenes-vs-contenedores', type: 'text', content: 'Una **imagen** es la plantilla inmutable: el sistema de archivos y la configuración de tu app congelados en capas. Un **contenedor** es una instancia viva de esa imagen.\n\nComandos esenciales:\n\n- `docker pull node:20-alpine` — descarga una imagen\n- `docker run -it node:20-alpine sh` — crea un contenedor interactivo\n- `docker ps -a` — lista contenedores\n- `docker images` — lista imágenes locales\n\nEjercicio: corre un contenedor de nginx y visita http://localhost:8080 mapeando el puerto con `-p 8080:80`.', duration: 10, isFree: false, order: 3 },
            { title: 'Tu primer Dockerfile', slug: 'primer-dockerfile', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 18, isFree: false, order: 4 },
          ],
        },
        {
          title: 'Docker en proyectos reales',
          order: 2,
          lessons: [
            { title: 'Multi-stage builds para apps de Node', slug: 'multi-stage-builds', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 16, isFree: false, order: 1 },
            { title: 'docker compose: API + base de datos juntas', slug: 'docker-compose', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 20, isFree: false, order: 2 },
            { title: 'Variables de entorno y secretos', slug: 'variables-y-secretos', type: 'text', content: 'Nunca metas credenciales en la imagen. Usa `env_file` en compose para desarrollo y secretos del proveedor (GitHub Secrets, variables del servidor) en producción.\n\nRegla de oro: si haces `docker history` de tu imagen y ves una contraseña, la imagen está comprometida — las capas son públicas para quien tenga la imagen.', duration: 8, isFree: false, order: 3 },
          ],
        },
        {
          title: 'CI/CD con GitHub Actions',
          order: 3,
          lessons: [
            { title: 'Anatomía de un workflow', slug: 'anatomia-workflow', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 14, isFree: false, order: 1 },
            { title: 'Build, test y push de la imagen', slug: 'build-test-push', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 22, isFree: false, order: 2 },
            { title: 'Deploy automático por SSH', slug: 'deploy-ssh', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 25, isFree: false, order: 3 },
            { title: 'Proyecto final: tu pipeline completo', slug: 'proyecto-final', type: 'text', content: 'Junta todo: contenertiza una API tuya, súbela a un registry y despliégala automáticamente a un droplet con cada push a main.\n\nEntregables:\n1. Dockerfile multi-stage\n2. docker-compose.yml con healthcheck\n3. Workflow de GitHub Actions con build + test + deploy\n4. URL pública funcionando', duration: 30, isFree: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: 'React práctico: de cero a deploy',
      slug: 'react-practico-de-cero-a-deploy',
      description:
        'Construye una aplicación React completa y real: componentes, hooks, estado, consumo de APIs, animaciones y despliegue. Basado en el mismo stack con el que está hecho este portafolio.',
      instructor: adminUser?._id,
      category: webCategory?._id,
      level: 'intermediate',
      duration: '6h 15m',
      price: 0,
      status: 'published',
      tags: ['React', 'JavaScript', 'Hooks', 'Frontend'],
      requirements: ['JavaScript intermedio (funciones, arrays, promesas)', 'HTML y CSS básicos', 'Node.js instalado'],
      whatYouLearn: [
        'Pensar en componentes y props',
        'Dominar useState, useEffect y hooks personalizados',
        'Consumir APIs REST con estados de carga y error',
        'Animar interfaces con framer-motion',
        'Desplegar a producción con CI/CD',
      ],
      modules: [
        {
          title: 'Fundamentos y mentalidad React',
          order: 1,
          lessons: [
            { title: 'Por qué React y qué construiremos', slug: 'por-que-react', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 10, isFree: true, order: 1 },
            { title: 'Componentes, JSX y props', slug: 'componentes-jsx-props', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 22, isFree: true, order: 2 },
            { title: 'Estado con useState', slug: 'estado-usestate', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 18, isFree: false, order: 3 },
          ],
        },
        {
          title: 'Datos reales y efectos',
          order: 2,
          lessons: [
            { title: 'useEffect sin miedo', slug: 'useeffect-sin-miedo', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 24, isFree: false, order: 1 },
            { title: 'Consumir una API REST con fetch', slug: 'consumir-api-rest', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 26, isFree: false, order: 2 },
            { title: 'Hooks personalizados: extrae y reutiliza', slug: 'hooks-personalizados', type: 'text', content: 'Cuando dos componentes repiten la misma lógica de estado, es momento de un hook propio.\n\n```js\nconst useFetch = (url) => {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    let cancelled = false;\n    fetch(url)\n      .then((r) => r.json())\n      .then((d) => { if (!cancelled) setData(d); })\n      .catch((e) => { if (!cancelled) setError(e); })\n      .finally(() => { if (!cancelled) setLoading(false); });\n    return () => { cancelled = true; };\n  }, [url]);\n\n  return { data, loading, error };\n};\n```\n\nEjercicio: convierte el fetch de la lección anterior en un hook `useFetch` y úsalo en dos componentes.', duration: 15, isFree: false, order: 3 },
          ],
        },
        {
          title: 'Pulido y deploy',
          order: 3,
          lessons: [
            { title: 'Animaciones con framer-motion', slug: 'animaciones-framer-motion', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 20, isFree: false, order: 1 },
            { title: 'Accesibilidad: lo mínimo que siempre debes hacer', slug: 'accesibilidad-minima', type: 'text', content: 'Checklist mínimo para cada proyecto:\n\n1. Todo input con `<label>`\n2. Imágenes con `alt` descriptivo\n3. `:focus-visible` visible en botones y links\n4. Modales con Escape y focus trap\n5. Contraste AA (4.5:1) en texto normal\n\nHerramientas: Lighthouse, axe DevTools y navegar tu app solo con teclado.', duration: 12, isFree: false, order: 2 },
            { title: 'Build de producción y deploy con CI/CD', slug: 'build-y-deploy', type: 'video', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', duration: 28, isFree: false, order: 3 },
          ],
        },
      ],
    },
  ];

  for (const course of courses) {
    await courseModel.updateOne({ slug: course.slug }, { $set: course }, { upsert: true });
  }
  console.log(`${courses.length} courses seeded`);

  // Seed blog posts (contenido portado de la SPA src/blog.js, en markdown)
  const postModel = app.get<Model<any>>(getModelToken('Post'));
  const devopsPostCategory = await categoryModel.findOne({ slug: 'devops' });
  const reflexionCategory = await categoryModel.findOne({ slug: 'reflexion' });
  const tutorialCategory = await categoryModel.findOne({ slug: 'tutorial' });

  const posts = [
    {
      title: 'Cómo despliego mis proyectos con Docker y GitHub Actions',
      slug: 'deploy-docker-github-actions',
      excerpt: 'Mi pipeline real de CI/CD para proyectos personales: del push al servidor sin tocar nada a mano.',
      author: adminUser?._id,
      category: devopsPostCategory?._id,
      tags: ['DevOps', 'Docker', 'CI/CD'],
      status: 'published',
      publishedAt: new Date('2026-05-18'),
      readingTime: 6,
      content: [
        'Cuando empecé a subir proyectos a producción lo hacía a mano: compilaba en mi máquina, subía archivos por SFTP y cruzaba los dedos. Funcionaba… hasta que dejaba de funcionar. Hoy cada push a main despliega solo, y este es el flujo que uso en casi todos mis proyectos.',
        '## 1. Todo empieza con un Dockerfile',
        'Contenerizar la app es lo que hace el resto posible. Para una API de Node.js uso una imagen multi-stage: una etapa para instalar dependencias y compilar, y una final mínima que solo lleva lo necesario para correr.',
        '```dockerfile\nFROM node:20-alpine AS deps\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\n\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY . .\nEXPOSE 3000\nCMD ["node", "src/index.js"]\n```',
        '## 2. GitHub Actions construye y publica',
        'El workflow se dispara en cada push a main: corre las pruebas, construye la imagen y la publica. Después se conecta por SSH al droplet de DigitalOcean y reinicia el contenedor con la imagen nueva. Todo el proceso tarda menos de tres minutos.',
        '## 3. Lo que aprendí en el camino',
        'Tres lecciones que me habrían ahorrado horas: guarda TODOS los secretos en GitHub Secrets desde el día uno; usa healthchecks en docker compose para que un deploy roto no tumbe el servicio; y deja Nginx como reverse proxy con SSL de Let\'s Encrypt — configurarlo una vez y olvidarte.',
        'Este flujo lo uso en producción en proyectos como LibrerIApp (FastAPI + React en DigitalOcean) y gameVault (Vapor + MySQL en Docker). Si estás desplegando a mano, dedicarle una tarde a automatizarlo se paga solo.',
      ].join('\n\n'),
    },
    {
      title: 'Lo que aprendí construyendo 17 proyectos como estudiante',
      slug: '17-proyectos-como-estudiante',
      excerpt: 'Ninguna clase me enseñó tanto como terminar proyectos reales. Estas son las lecciones que me dejaron.',
      author: adminUser?._id,
      category: reflexionCategory?._id,
      tags: ['Carrera', 'Aprendizaje', 'Full Stack'],
      status: 'published',
      publishedAt: new Date('2026-06-02'),
      readingTime: 5,
      content: [
        'Entre el CBTIS y la universidad he construido 17 proyectos completos: webs, APIs, apps de escritorio, sistemas IoT con ESP32 y hasta un clon de Amazon. Algunos nacieron por tarea, otros por pura curiosidad. Esto es lo que ese recorrido me enseñó y que ningún curso me dio.',
        '## Terminar > empezar',
        'El 80% del aprendizaje está en el último 20% del proyecto: el deploy, los bugs raros, los datos reales, el usuario que hace lo que no esperabas. Un proyecto terminado y en línea vale más que cinco repos abandonados al 60%.',
        '## La tecnología se elige por el problema',
        "He usado React, SwiftUI, Electron, FastAPI, Vapor, Express… y la lección es que ninguna es 'la buena'. El control de acceso con ESP32 necesitaba MySQL y C#; la librería digital pedía FastAPI y SQLite. Aprender a elegir es una habilidad en sí misma.",
        '## Documenta para tu yo del futuro',
        'Volver a un proyecto seis meses después sin README es arqueología. Ahora cada repo lleva instrucciones de instalación, variables de entorno de ejemplo y capturas. Ese hábito es el que después se agradece en equipo.',
        '## El hardware te hace mejor developer de software',
        'Conectar sensores físicos a una API te obliga a pensar en fallos que en la web ignoras: ¿qué pasa si el sensor manda basura?, ¿si se corta el WiFi?, ¿si llegan 100 lecturas por segundo? Programar con esas restricciones te cambia la forma de diseñar todo lo demás.',
        "Si estás estudiando y dudas entre 'aprender más teoría' o construir algo: construye. La teoría se te queda cuando la usas para resolver un problema tuyo.",
      ].join('\n\n'),
    },
    {
      title: 'Mi homelab con Proxmox: aprender infraestructura rompiendo cosas en casa',
      slug: 'homelab-proxmox',
      excerpt: 'Virtualización, Active Directory y redes híbridas en un servidor casero. El mejor laboratorio es el propio.',
      author: adminUser?._id,
      category: tutorialCategory?._id,
      tags: ['Infraestructura', 'Proxmox', 'Homelab'],
      status: 'published',
      publishedAt: new Date('2026-06-20'),
      readingTime: 4,
      content: [
        'La mejor decisión que tomé para aprender infraestructura fue montar un homelab: una máquina con Proxmox VE donde puedo crear, romper y restaurar servidores sin miedo. Todo lo que sé de Windows Server, redes y virtualización pasó primero por ahí.',
        '## Qué corre en el lab',
        'Sobre Proxmox tengo un Windows Server con Active Directory, DNS y DHCP para practicar administración de dominios; varias VMs Linux para Docker y pruebas de deploy; y snapshots antes de cada experimento — la función que más uso, porque la mitad de los experimentos terminan mal, y esa es exactamente la idea.',
        '## Por qué vale la pena',
        'Leer sobre VLSM o Active Directory es una cosa; diseñar tu propia red segmentada y ver por qué un cliente no resuelve DNS a las 2 AM es otra. El homelab convierte los temas de clase en problemas reales con consecuencias reales (aunque solo afecten a tu Netflix local).',
        'No necesitas hardware caro: cualquier PC vieja con 16 GB de RAM alcanza para empezar. Instala Proxmox, crea tu primera VM y rompe algo — ahí empieza el aprendizaje.',
      ].join('\n\n'),
    },
  ];

  for (const post of posts) {
    await postModel.updateOne({ slug: post.slug }, { $set: post }, { upsert: true });
  }
  console.log(`${posts.length} posts seeded`);

  // Seed site config
  const siteConfigModel = app.get<Model<any>>(getModelToken('SiteConfig'));
  await siteConfigModel.updateOne(
    { key: 'main' },
    {
      $set: {
        key: 'main',
        siteName: 'Angel Onesto Portfolio',
        siteDescription: 'Portfolio de Angel David Onesto Frias - Full Stack Developer',
        ownerName: 'Angel David Onesto Frias',
        ownerEmail: 'contacto@angelonesto.com',
        ownerBio: 'Full Stack Developer apasionado por la tecnologia, infraestructura y crear experiencias web unicas.',
        socialLinks: {
          github: 'https://github.com/SinckCode',
          linkedin: 'https://linkedin.com/in/angelonesto',
        },
        hero: {
          title: 'Angel Onesto',
          subtitle: 'Full Stack Developer',
          ctaText: 'Ver Proyectos',
          ctaLink: '#projects',
        },
      },
    },
    { upsert: true },
  );
  console.log('Site config seeded');

  await app.close();
  console.log('Seed completed successfully');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
