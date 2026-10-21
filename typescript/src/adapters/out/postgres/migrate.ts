import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Pool } from 'pg'
import { withTransaction } from './withTransaction'

const MIGRATIONS_DIR = path.join(__dirname, 'migrations')
// Arbitrary but fixed key for the Postgres advisory lock that serializes migrations.
const MIGRATIONS_LOCK_KEY = 4_202_610

export async function migrate(pool: Pool): Promise<void> {
  // Instances starting at the same time (e.g. two replicas) wait for each other here, so each
  // migration runs once; the later instance then finds nothing left to apply.
  const lock = await pool.connect()
  try {
    await lock.query('SELECT pg_advisory_lock($1)', [MIGRATIONS_LOCK_KEY])
    await applyPendingMigrations(pool)
  } finally {
    await lock.query('SELECT pg_advisory_unlock($1)', [MIGRATIONS_LOCK_KEY])
    lock.release()
  }
}

async function applyPendingMigrations(pool: Pool): Promise<void> {
  await pool.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())',
  )
  const { rows } = await pool.query<{ name: string }>('SELECT name FROM schema_migrations')
  const applied = new Set(rows.map((row) => row.name))
  const files = (await readdir(MIGRATIONS_DIR)).filter((file) => file.endsWith('.sql')).sort()

  for (const file of files.filter((name) => !applied.has(name))) {
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8')
    await withTransaction(pool, async (client) => {
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
    })
  }
}

export async function seed(pool: Pool): Promise<void> {
  await pool.query(await readFile(path.join(__dirname, 'seed.sql'), 'utf8'))
}
