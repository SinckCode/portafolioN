require('dotenv').config();
const express = require('express');
const { exec } = require('child_process');
const app = express();
app.use(express.json());

const TOKEN = process.env.DEPLOY_TOKEN;
const PORTFOLIO_REPO = 'https://github.com/SinckCode/portafolioN.git';
const PORTFOLIO_DIR = '/home/onesto/portfolio';

// NVM source command for VMs that use NVM (VM 103)
const NVM_SOURCE = 'source ~/.nvm/nvm.sh 2>/dev/null;';

// Clona el monorepo si no existe; si existe, hace pull
const ensureRepo = `test -d ${PORTFOLIO_DIR}/.git && (cd ${PORTFOLIO_DIR} && git pull origin main) || git clone ${PORTFOLIO_REPO} ${PORTFOLIO_DIR}`;

function auth(req, res, next) {
  const h = req.headers['authorization'] || '';
  const t = h.replace(/^Bearer\s*/i, '').trim();
  if (!TOKEN || t !== TOKEN) return res.status(403).json({ error: 'Unauthorized' });
  next();
}

function run(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    // 10 min: next build en la VM puede pasar de 5 min
    // shell: bash necesario para `source ~/.nvm/nvm.sh`
    exec(cmd, { timeout: 600000, maxBuffer: 10 * 1024 * 1024, shell: '/bin/bash', ...opts }, (err, stdout, stderr) => {
      if (err) return reject({ error: err.message, stdout, stderr });
      resolve({ stdout, stderr });
    });
  });
}

// Project definitions
const projects = {
  // === VM 100 LOCAL — stack nuevo (monorepo portafolioN en ~/portfolio) ===
  'portfolio-api': {
    description: 'NestJS API (api.angelonesto.com)',
    local: true,
    commands: [
      ensureRepo,
      `cd ${PORTFOLIO_DIR}/portfolio-api`,
      'npm ci',
      'npm run build',
      `pm2 startOrReload ${PORTFOLIO_DIR}/infra/ecosystem.config.js --only portfolio-api`,
    ],
  },
  'portfolio-frontend': {
    description: 'Next.js (angelonesto.com)',
    local: true,
    commands: [
      ensureRepo,
      `cd ${PORTFOLIO_DIR}/portfolio-frontend`,
      'npm ci',
      'npm run build',
      `pm2 startOrReload ${PORTFOLIO_DIR}/infra/ecosystem.config.js --only portfolio-frontend`,
    ],
  },

  // === VM 104 (system node v18, no NVM) ===
  astrocloud: {
    description: 'AstroCloud (astrocloud.dev)',
    host: '10.10.20.104',
    commands: [
      'cd /home/onesto/AstroCloudWeb',
      'git pull origin main',
      'npm install',
      'npm run build',
      'sudo rm -rf /var/www/astrocloud/*',
      'sudo cp -a dist/. /var/www/astrocloud/',
      'sudo systemctl reload apache2'
    ]
  },

  // === VM 103 (NVM node 22) ===
  'erp-frontend': {
    description: 'ERP Frontend (erp.angelonesto.com)',
    host: '10.10.20.103',
    useNvm: true,
    commands: [
      'cd /home/onesto/Proyectos/erp-frontend',
      'git fetch origin main',
      'git reset --hard origin/main',
      'npm ci || npm install',
      'npm run build',
      'sudo mkdir -p /var/www/erp-frontend',
      'sudo rsync -a --delete dist/ /var/www/erp-frontend/',
      'sudo systemctl reload nginx'
    ]
  },
  'erp-backend': {
    description: 'ERP Backend (apierp.angelonesto.com)',
    host: '10.10.20.103',
    useNvm: true,
    commands: [
      'cd /home/onesto/back/erp-backend',
      'git pull origin main',
      'npm install',
      'pm2 restart erp-backend'
    ]
  },
  clima: {
    description: 'App Clima (clima.angelonesto.com)',
    host: '10.10.20.103',
    useNvm: true,
    commands: [
      'cd /home/onesto/Proyectos/clima-web',
      'git pull origin main',
      'npm install',
      'npm run build',
      'sudo rm -rf /var/www/clima-web/*',
      'sudo cp -a dist/. /var/www/clima-web/',
      'sudo systemctl reload apache2'
    ]
  },
  whatsupearth: {
    description: 'WhatsUp Earth (whatsupearth.angelonesto.com)',
    host: '10.10.20.103',
    useNvm: true,
    commands: [
      'cd /home/onesto/Proyectos/whatsup-earth',
      'git pull origin main',
      'npm install',
      'VITE_API_URL=https://api-whatsupearth.angelonesto.com/api npx vite build --config vite.config.web.js',
      'sudo cp /var/www/whatsup-earth/.htaccess /tmp/htaccess_backup 2>/dev/null || true',
      'sudo rm -rf /var/www/whatsup-earth/*',
      'sudo cp -a dist/. /var/www/whatsup-earth/',
      'sudo cp /tmp/htaccess_backup /var/www/whatsup-earth/.htaccess 2>/dev/null || true',
      'sudo systemctl reload apache2',
      'cd /home/onesto/Proyectos/whatsup-earth-Backend',
      'git pull origin main',
      'cd /home/onesto/Proyectos',
      'docker compose build --no-cache backend',
      'docker compose up -d backend',
      'sleep 5',
      'docker compose exec -e PG_USER=whatsup -e PG_PASSWORD=postgres123 -e PG_DB=whatsup_earth -e PG_HOST=postgres -e PG_PORT=5432 -T backend npx sequelize-cli db:migrate'
    ]
  },
  sensores: {
    description: 'Sensores API (sensores.angelonesto.com)',
    host: '10.10.20.103',
    useNvm: true,
    commands: [
      'cd /home/onesto/SensoresApi',
      'git pull origin main',
      'npm install',
      'pm2 restart SensoresApi'
    ]
  }
};

// Evita deploys solapados del mismo proyecto
const inFlight = new Set();

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'unified-deploy-api', projects: Object.keys(projects) });
});

app.get('/projects', auth, (req, res) => {
  const list = {};
  for (const [k, v] of Object.entries(projects)) {
    list[k] = { description: v.description, target: v.local ? 'local' : v.host };
  }
  res.json(list);
});

app.post('/deploy/:project', auth, async (req, res) => {
  const project = req.params.project;
  const config = projects[project];
  if (!config) {
    return res.status(404).json({ error: `Unknown project: ${project}`, available: Object.keys(projects) });
  }
  if (inFlight.has(project)) {
    return res.status(409).json({ ok: false, project, error: 'Deploy ya en progreso' });
  }
  inFlight.add(project);

  console.log(`[${new Date().toISOString()}] Deploy started: ${project}`);
  const start = Date.now();

  try {
    let fullCmd;
    const cmds = config.commands.join(' && ');

    if (config.local) {
      fullCmd = `${NVM_SOURCE} ${cmds}`;
    } else {
      const remoteCmd = config.useNvm ? `${NVM_SOURCE} ${cmds}` : cmds;
      const escaped = remoteCmd.replace(/"/g, '\\"');
      fullCmd = `ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -i /home/onesto/.ssh/deploy_key onesto@${config.host} "bash -c \\"${escaped}\\""`;
    }

    const { stdout, stderr } = await run(fullCmd);
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[${new Date().toISOString()}] Deploy OK: ${project} (${duration}s)`);
    res.json({ ok: true, project, duration: `${duration}s`, stdout: stdout?.slice(-500) });
  } catch (e) {
    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.error(`[${new Date().toISOString()}] Deploy FAIL: ${project} (${duration}s)`, e.error || e);
    res.status(500).json({
      ok: false, project, duration: `${duration}s`,
      error: e.error || String(e),
      stderr: e.stderr?.slice(-500)
    });
  } finally {
    inFlight.delete(project);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Unified Deploy API on port ${PORT}`);
  console.log(`Projects: ${Object.keys(projects).join(', ')}`);
});
