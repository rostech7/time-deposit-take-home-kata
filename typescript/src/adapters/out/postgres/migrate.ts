import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Pool } from 'pg'

const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

export async function migrate(pool: Pool): Promise<void> {
  await pool.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())',
  )
  const { rows } = await pool.query<{ name: string }>('SELECT name FROM schema_migrations')
  const applied = new Set(rows.map((row) => row.name))
  const files = (await readdir(MIGRATIONS_DIR)).filter((file) => file.endsWith('.sql')).sort()

  for (const file of files.filter((name) => !applied.has(name))) {
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}

export async function seed(pool: Pool): Promise<void> {
  await pool.query(await readFile(path.join(__dirname, 'seed.sql'), 'utf8'))
}
