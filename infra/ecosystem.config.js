// PM2 — producción VM 100. Levanta NestJS (:4000) y Next.js (:3001).
// Uso: pm2 start infra/ecosystem.config.js && pm2 save
module.exports = {
  apps: [
    {
      name: 'portfolio-api',
      cwd: '/home/onesto/portfolio/portfolio-api',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '450M',
      env: { NODE_ENV: 'production' },
      // dotenv/config en main.ts lee portfolio-api/.env
    },
    {
      name: 'portfolio-frontend',
      cwd: '/home/onesto/portfolio/portfolio-frontend',
      // next start del build standalone/normal
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      env: { NODE_ENV: 'production', PORT: '3001' },
    },
  ],
};
