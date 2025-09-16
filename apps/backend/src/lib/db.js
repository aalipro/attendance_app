import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../../../data');
const dbFile = path.join(dataDir, 'app.sqlite');
const migrationsDir = path.resolve(__dirname, '../../migrations');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(dbFile);
db.pragma('foreign_keys = ON');

function getAppliedMigrations() {
  db.exec(
    `CREATE TABLE IF NOT EXISTS _migrations (id TEXT PRIMARY KEY, appliedAt TEXT NOT NULL DEFAULT (datetime('now')));`,
  );
  return new Set(db.prepare(`SELECT id FROM _migrations`).all().map((r) => r.id));
}

export function ensureDatabase() {
  const applied = getAppliedMigrations();
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  const trx = db.transaction((fns) => {
    for (const file of fns) {
      const id = path.basename(file, '.sql');
      if (applied.has(id)) continue;
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      db.exec(sql);
      db.prepare(`INSERT INTO _migrations(id) VALUES (?)`).run(id);
      console.log(`Migration appliquée: ${id}`);
    }
  });
  trx(files);
}

export function withTransaction(fn) {
  const trx = db.transaction(fn);
  return trx();
}
