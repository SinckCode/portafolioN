#!/usr/bin/env node
/**
 * Sincroniza los articulos de content/posts/*.md con la base de datos.
 *
 * Hace upsert por slug: si el post existe lo actualiza, si no lo crea.
 * Nunca borra nada, y preserva views, likes y likesBy del post existente.
 *
 *   node scripts/sync-posts.js            # aplica los cambios
 *   node scripts/sync-posts.js --dry-run  # solo muestra que haria
 *
 * Lee MONGODB_URI del entorno o del .env que esta junto a este proyecto.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'content', 'posts');
const DRY_RUN = process.argv.includes('--dry-run');

// ---------------------------------------------------------------- env

function loadEnv() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return null;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*MONGODB_URI\s*=\s*(.*)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, '');
  }
  return null;
}

// -------------------------------------------------------- frontmatter

/**
 * Parser del subconjunto de YAML que usamos: escalares entre comillas o
 * desnudos, y arrays en linea ["a", "b"]. Suficiente para el frontmatter
 * de los articulos y evita agregar una dependencia.
 */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error('sin frontmatter');

  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let value = kv[2].trim();

    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim();
      data[key] = inner
        ? inner.split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''))
        : [];
    } else {
      data[key] = value.replace(/^["']|["']$/g, '');
    }
  }
  return { data, content: m[2].trim() };
}

/** ~200 palabras por minuto, minimo 1. */
function readingTime(content) {
  const words = content.replace(/```[\s\S]*?```/g, ' ').trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// ---------------------------------------------------------------- main

async function main() {
  const uri = loadEnv();
  if (!uri) {
    console.error('Falta MONGODB_URI (ni en el entorno ni en .env)');
    process.exit(1);
  }
  if (!fs.existsSync(POSTS_DIR)) {
    console.error(`No existe ${POSTS_DIR}`);
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const posts = db.collection('posts');
  const categories = db.collection('categories');
  const users = db.collection('users');

  const author = await users.findOne({ role: 'admin' }, { sort: { createdAt: 1 } });
  if (!author) throw new Error('No hay usuario admin para asignar como autor');

  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));
  console.log(`${files.length} articulo(s) en content/posts${DRY_RUN ? '  [DRY RUN]' : ''}\n`);

  let created = 0;
  let updated = 0;

  for (const file of files) {
    const { data, content } = parseFrontmatter(
      fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'),
    );

    if (!data.slug || !data.title) {
      console.error(`  SKIP ${file}: falta slug o title`);
      continue;
    }

    const category = data.category
      ? await categories.findOne({ slug: data.category })
      : null;
    if (data.category && !category) {
      console.error(`  SKIP ${file}: categoria "${data.category}" no existe`);
      continue;
    }

    const existing = await posts.findOne({ slug: data.slug });

    const doc = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || '',
      content,
      contentFormat: data.contentFormat || 'markdown',
      coverImage: data.coverImage || existing?.coverImage || '',
      author: author._id,
      category: category ? category._id : null,
      tags: data.tags || [],
      status: data.status || 'draft',
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
      readingTime: readingTime(content),
      seo: {
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        metaKeywords: data.metaKeywords || [],
        ogImage: data.ogImage || '',
      },
      updatedAt: new Date(),
    };

    const words = content.trim().split(/\s+/).length;
    const label = existing ? 'UPDATE' : 'CREATE';
    console.log(`  ${label}  ${data.slug}`);
    console.log(`          ${words} palabras · ${doc.readingTime} min · ${doc.status}`);
    if (existing) {
      console.log(`          antes: ${existing.content.trim().split(/\s+/).length} palabras`);
    }

    if (!DRY_RUN) {
      if (existing) {
        // Preserva metricas acumuladas: no se tocan views, likes ni likesBy.
        await posts.updateOne({ _id: existing._id }, { $set: doc });
        updated++;
      } else {
        await posts.insertOne({
          ...doc,
          views: 0,
          likes: 0,
          likesBy: [],
          createdAt: new Date(),
          __v: 0,
        });
        created++;
      }
    }
  }

  console.log(
    DRY_RUN
      ? '\nDry run: no se escribio nada.'
      : `\nListo: ${created} creado(s), ${updated} actualizado(s).`,
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
