#!/usr/bin/env node
/**
 * Copia las descripciones largas de content/projects.json al fallback estatico
 * del frontend (portfolio-frontend/src/data/projects.ts).
 *
 * Ese archivo es lo que se renderiza cuando el API no responde, asi que si su
 * texto se queda atras, un visitante puede ver una version pobre del portafolio
 * sin que nada falle de forma visible. Con este script hay una sola fuente.
 *
 * Uso:  npm run projects:sync-fallback  [-- --dry-run]
 */
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..', '..');
const FUENTE = path.join(__dirname, '..', 'content', 'projects.json');
const DESTINO = path.join(RAIZ, 'portfolio-frontend', 'src', 'data', 'projects.ts');

const dryRun = process.argv.includes('--dry-run');

const detalles = JSON.parse(fs.readFileSync(FUENTE, 'utf8'));
let destino = fs.readFileSync(DESTINO, 'utf8');

/** Escapa el texto para insertarlo en un literal de comillas simples de TS. */
const escapar = (txt) =>
  txt.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');

// Cada proyecto del fallback trae `slug: 'x'` y mas abajo su `details: '...'`.
const RE_DETAILS = /details:\s*'(?:[^'\\]|\\.)*'/;

const cambios = [];
const sinTocar = [];

for (const [slug, valor] of Object.entries(detalles)) {
  if (slug.startsWith('_')) continue;

  const marca = `slug: '${slug}'`;
  const inicio = destino.indexOf(marca);
  if (inicio === -1) {
    sinTocar.push(`${slug} (no esta en el fallback)`);
    continue;
  }

  // Busca el `details:` que sigue a este slug, sin salirse del objeto.
  const resto = destino.slice(inicio);
  const m = resto.match(RE_DETAILS);
  if (!m) {
    sinTocar.push(`${slug} (sin campo details)`);
    continue;
  }

  const nuevo = `details: '${escapar(valor.details)}'`;
  if (m[0] === nuevo) continue;

  destino = destino.slice(0, inicio) + resto.replace(RE_DETAILS, nuevo);
  cambios.push(`${slug}: ${m[0].length} -> ${nuevo.length} chars`);
}

if (sinTocar.length > 0) {
  console.log('Avisos:');
  sinTocar.forEach((s) => console.log('  - ' + s));
}

if (cambios.length === 0) {
  console.log('El fallback ya estaba al dia.');
  process.exit(0);
}

console.log(`${cambios.length} descripciones actualizadas:`);
cambios.forEach((c) => console.log('  - ' + c));

if (dryRun) {
  console.log('\n--dry-run: no se escribio nada.');
  process.exit(0);
}

fs.writeFileSync(DESTINO, destino, 'utf8');
console.log('\nEscrito en portfolio-frontend/src/data/projects.ts');
