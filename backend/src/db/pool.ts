import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { getEnv } from '../config/env';

let poolInstance: Pool | null = null;

export function getPool(): Pool {
  if (poolInstance) {
    return poolInstance;
  }

  const env = getEnv();
  const isSupabase =
    env.DATABASE_URL.includes('supabase.co') ||
    env.DATABASE_URL.includes('pooler.supabase.com');
  const isProduction = env.NODE_ENV === 'production';

  poolInstance = new Pool({
    connectionString: env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl:
      isSupabase || isProduction
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
  });

  poolInstance.on('error', (err: Error) => {
    console.error('[Database Pool Error] Unexpected idle client error:', err.message);
  });

  return poolInstance;
}

export function setPool(customPool: Pool): void {
  poolInstance = customPool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(text, params);
}

export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return pool.connect();
}

export async function checkDbHealth(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const res = await query('SELECT 1 AS alive');
    if (res.rows[0]?.alive === 1) {
      return {
        connected: true,
        latencyMs: Date.now() - start,
      };
    }
    return {
      connected: false,
      error: 'Unexpected query response',
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err?.message || 'Database connection failed',
    };
  }
}

export async function closePool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
}
