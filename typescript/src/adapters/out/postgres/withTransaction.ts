import type { Pool, PoolClient } from 'pg'

/** Runs `work` inside BEGIN/COMMIT on one connection, rolling back if it throws. */
export async function withTransaction<T>(
  pool: Pool,
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  // A connection that dies while checked out also emits 'error'; without a listener that crashes the
  // process. The failing query already rejects with the cause, so the event itself can be ignored.
  const ignoreConnectionError = () => undefined
  client.on('error', ignoreConnectionError)
  try {
    await client.query('BEGIN')
    const result = await work(client)
    await client.query('COMMIT')
    client.release()
    return result
  } catch (error) {
    // ROLLBACK fails too if the connection is gone; keep the original error rather than that one.
    await client.query('ROLLBACK').catch(() => undefined)
    // Passing the error discards the connection instead of returning a possibly broken one to the pool.
    client.release(error instanceof Error ? error : true)
    throw error
  } finally {
    client.off('error', ignoreConnectionError)
  }
}
