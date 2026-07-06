// Posts del blog — misma convención que projects.js.
// `status`: "published" | "draft". Si ningún post está publicado,
// BlogSection muestra el estado "Próximamente".
// `cover`: import de imagen o null (null => placeholder con gradiente).
// `content`: bloques { type: "p" | "h3" | "code", ... }.

const posts = [
  {
    id: 1,
    slug: "deploy-docker-github-actions",
    title: "Cómo despliego mis proyectos con Docker y GitHub Actions",
    excerpt:
      "Mi pipeline real de CI/CD para proyectos personales: del push al servidor sin tocar nada a mano.",
    date: "2026-05-18",
    readingTime: 6,
    tags: ["DevOps", "Docker", "CI/CD"],
    cover: null,
    status: "published",
    content: [
      {
        type: "p",
        value:
          "Cuando empecé a subir proyectos a producción lo hacía a mano: compilaba en mi máquina, subía archivos por SFTP y cruzaba los dedos. Funcionaba… hasta que dejaba de funcionar. Hoy cada push a main despliega solo, y este es el flujo que uso en casi todos mis proyectos.",
      },
      { type: "h3", value: "1. Todo empieza con un Dockerfile" },
      {
        type: "p",
        value:
          "Contenerizar la app es lo que hace el resto posible. Para una API de Node.js uso una imagen multi-stage: una etapa para instalar dependencias y compilar, y una final mínima que solo lleva lo necesario para correr.",
      },
      {
        type: "code",
        lang: "dockerfile",
        value:
          "FROM node:20-alpine AS deps\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\n\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=deps /app/node_modules ./node_modules\nCOPY . .\nEXPOSE 3000\nCMD [\"node\", \"src/index.js\"]",
      },
      { type: "h3", value: "2. GitHub Actions construye y publica" },
      {
        type: "p",
        value:
          "El workflow se dispara en cada push a main: corre las pruebas, construye la imagen y la publica. Después se conecta por SSH al droplet de DigitalOcean y reinicia el contenedor con la imagen nueva. Todo el proceso tarda menos de tres minutos.",
      },
      {
        type: "code",
        lang: "yaml",
        // eslint-disable-next-line no-template-curly-in-string
        value: "name: Deploy\non:\n  push:\n    branches: [main]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci && npm test\n      - name: Build & push image\n        run: |\n          docker build -t registry/mi-api:latest .\n          docker push registry/mi-api:latest\n      - name: Restart on server\n        uses: appleboy/ssh-action@v1\n        with:\n          host: ${{ secrets.HOST }}\n          username: ${{ secrets.USER }}\n          key: ${{ secrets.SSH_KEY }}\n          script: |\n            docker pull registry/mi-api:latest\n            docker compose up -d",
      },
      { type: "h3", value: "3. Lo que aprendí en el camino" },
      {
        type: "p",
        value:
          "Tres lecciones que me habrían ahorrado horas: guarda TODOS los secretos en GitHub Secrets desde el día uno; usa healthchecks en docker compose para que un deploy roto no tumbe el servicio; y deja Nginx como reverse proxy con SSL de Let's Encrypt — configurarlo una vez y olvidarte.",
      },
      {
        type: "p",
        value:
          "Este flujo lo uso en producción en proyectos como LibrerIApp (FastAPI + React en DigitalOcean) y gameVault (Vapor + MySQL en Docker). Si estás desplegando a mano, dedicarle una tarde a automatizarlo se paga solo.",
      },
    ],
  },
  {
    id: 2,
    slug: "17-proyectos-como-estudiante",
    title: "Lo que aprendí construyendo 17 proyectos como estudiante",
    excerpt:
      "Ninguna clase me enseñó tanto como terminar proyectos reales. Estas son las lecciones que me dejaron.",
    date: "2026-06-02",
    readingTime: 5,
    tags: ["Carrera", "Aprendizaje", "Full Stack"],
    cover: null,
    status: "published",
    content: [
      {
        type: "p",
        value:
          "Entre el CBTIS y la universidad he construido 17 proyectos completos: webs, APIs, apps de escritorio, sistemas IoT con ESP32 y hasta un clon de Amazon. Algunos nacieron por tarea, otros por pura curiosidad. Esto es lo que ese recorrido me enseñó y que ningún curso me dio.",
      },
      { type: "h3", value: "Terminar > empezar" },
      {
        type: "p",
        value:
          "El 80% del aprendizaje está en el último 20% del proyecto: el deploy, los bugs raros, los datos reales, el usuario que hace lo que no esperabas. Un proyecto terminado y en línea vale más que cinco repos abandonados al 60%.",
      },
      { type: "h3", value: "La tecnología se elige por el problema" },
      {
        type: "p",
        value:
          "He usado React, SwiftUI, Electron, FastAPI, Vapor, Express… y la lección es que ninguna es 'la buena'. El control de acceso con ESP32 necesitaba MySQL y C#; la librería digital pedía FastAPI y SQLite. Aprender a elegir es una habilidad en sí misma.",
      },
      { type: "h3", value: "Documenta para tu yo del futuro" },
      {
        type: "p",
        value:
          "Volver a un proyecto seis meses después sin README es arqueología. Ahora cada repo lleva instrucciones de instalación, variables de entorno de ejemplo y capturas. Ese hábito es el que después se agradece en equipo.",
      },
      { type: "h3", value: "El hardware te hace mejor developer de software" },
      {
        type: "p",
        value:
          "Conectar sensores físicos a una API te obliga a pensar en fallos que en la web ignoras: ¿qué pasa si el sensor manda basura?, ¿si se corta el WiFi?, ¿si llegan 100 lecturas por segundo? Programar con esas restricciones te cambia la forma de diseñar todo lo demás.",
      },
      {
        type: "p",
        value:
          "Si estás estudiando y dudas entre 'aprender más teoría' o construir algo: construye. La teoría se te queda cuando la usas para resolver un problema tuyo.",
      },
    ],
  },
  {
    id: 3,
    slug: "homelab-proxmox",
    title: "Mi homelab con Proxmox: aprender infraestructura rompiendo cosas en casa",
    excerpt:
      "Virtualización, Active Directory y redes híbridas en un servidor casero. El mejor laboratorio es el propio.",
    date: "2026-06-20",
    readingTime: 4,
    tags: ["Infraestructura", "Proxmox", "Homelab"],
    cover: null,
    status: "published",
    content: [
      {
        type: "p",
        value:
          "La mejor decisión que tomé para aprender infraestructura fue montar un homelab: una máquina con Proxmox VE donde puedo crear, romper y restaurar servidores sin miedo. Todo lo que sé de Windows Server, redes y virtualización pasó primero por ahí.",
      },
      { type: "h3", value: "Qué corre en el lab" },
      {
        type: "p",
        value:
          "Sobre Proxmox tengo un Windows Server con Active Directory, DNS y DHCP para practicar administración de dominios; varias VMs Linux para Docker y pruebas de deploy; y snapshots antes de cada experimento — la función que más uso, porque la mitad de los experimentos terminan mal, y esa es exactamente la idea.",
      },
      { type: "h3", value: "Por qué vale la pena" },
      {
        type: "p",
        value:
          "Leer sobre VLSM o Active Directory es una cosa; diseñar tu propia red segmentada y ver por qué un cliente no resuelve DNS a las 2 AM es otra. El homelab convierte los temas de clase en problemas reales con consecuencias reales (aunque solo afecten a tu Netflix local).",
      },
      {
        type: "p",
        value:
          "No necesitas hardware caro: cualquier PC vieja con 16 GB de RAM alcanza para empezar. Instala Proxmox, crea tu primera VM y rompe algo — ahí empieza el aprendizaje.",
      },
    ],
  },
];

export default posts;
