// Mapea cada tecnología a una categoría visual.
// Los colores viven como custom properties --tag-<categoria> (globals.scss).
// Port del rediseño de la SPA (src/utils/techColors.js del CRA).

const CATEGORY_BY_TECH: Record<string, string> = {
  // Frontend
  react: 'frontend',
  javascript: 'frontend',
  typescript: 'frontend',
  html: 'frontend',
  css: 'frontend',
  scss: 'frontend',
  tailwind: 'frontend',
  electron: 'frontend',
  'context api': 'frontend',
  axios: 'frontend',
  web: 'frontend',
  'next.js': 'frontend',

  // Backend
  'node.js': 'backend',
  express: 'backend',
  fastapi: 'backend',
  python: 'backend',
  java: 'backend',
  'c#': 'backend',
  vapor: 'backend',
  'vapor (swift)': 'backend',
  jwt: 'backend',
  swagger: 'backend',
  mongoose: 'backend',
  nestjs: 'backend',
  'rest api': 'backend',
  'hugging face api': 'backend',
  'nasa eonet api': 'backend',
  stripe: 'backend',

  // Bases de datos / BaaS
  mongodb: 'db',
  mysql: 'db',
  sqlite: 'db',
  'sql server': 'db',
  firebase: 'db',
  'firebase auth': 'db',
  'firebase firestore': 'db',
  'firebase storage': 'db',
  't-sql': 'db',

  // DevOps / infraestructura
  docker: 'devops',
  digitalocean: 'devops',
  nginx: 'devops',
  pm2: 'devops',
  vercel: 'devops',
  render: 'devops',
  'github actions': 'devops',
  'ci/cd': 'devops',
  'firebase hosting': 'devops',
  proxmox: 'devops',
  'windows server': 'devops',
  networking: 'devops',

  // Móvil / escritorio nativo
  swiftui: 'mobile',
  '.net maui': 'mobile',
  android: 'mobile',
  kotlin: 'mobile',
  'jetpack compose': 'mobile',
  'compose navigation': 'mobile',
  mvvm: 'mobile',
  'dependency injection': 'mobile',

  // Hardware / IoT
  esp32: 'hardware',
  arduino: 'hardware',
  bme680: 'hardware',
  dht22: 'hardware',
  bh1750: 'hardware',
  mqtt: 'hardware',
  iot: 'hardware',
};

export const getTechCategory = (tech: string): string => {
  if (!tech) return 'other';
  const key = String(tech).trim().toLowerCase();
  if (CATEGORY_BY_TECH[key]) return CATEGORY_BY_TECH[key];
  if (key.startsWith('firebase')) return 'db';
  if (key.includes('api')) return 'backend';
  if (key.includes('sql')) return 'db';
  return 'other';
};

export const getTechColor = (tech: string): string =>
  `var(--tag-${getTechCategory(tech)})`;

// Tipos de proyecto ("Fullstack", "IoT / Web", "Networking"...) → categoría del badge
export const getTypeCategory = (type: string): string => {
  if (!type) return 'other';
  const key = String(type).toLowerCase();
  if (key.includes('iot')) return 'hardware';
  if (key.includes('networking')) return 'other';
  if (key.includes('mobile') || key.includes('macos') || key.includes('desktop')) return 'mobile';
  if (key.includes('fullstack')) return 'backend';
  if (key.includes('frontend') || key.includes('web')) return 'frontend';
  return 'other';
};

export const getTypeColor = (type: string): string =>
  `var(--tag-${getTypeCategory(type)})`;

// Niveles de curso → color de chip
export const getLevelColor = (level: string): string => {
  switch (level) {
    case 'beginner':
      return 'var(--tag-devops)'; // verde
    case 'intermediate':
      return 'var(--tag-db)'; // ámbar
    case 'advanced':
      return 'var(--tag-mobile)'; // rosa
    default:
      return 'var(--tag-other)';
  }
};
