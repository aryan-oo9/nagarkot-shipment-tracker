import { Request, Response } from 'express';
import { checkDbHealth } from '../db/pool';

export async function getHealth(req: Request, res: Response): Promise<void> {
  // If ?checkDb=true is requested or by default check db
  const checkDb = req.query.checkDb !== 'false';

  let dbStatus: { connected: boolean; latencyMs?: number; error?: string } | null = null;
  if (checkDb) {
    dbStatus = await checkDbHealth();
  }

  const isHealthy = !checkDb || (dbStatus && dbStatus.connected);

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus
      ? {
          status: dbStatus.connected ? 'connected' : 'disconnected',
          latencyMs: dbStatus.latencyMs,
          ...(dbStatus.error ? { error: dbStatus.error } : {}),
        }
      : {
          status: 'unverified',
          note: 'Pass ?checkDb=true to probe database',
        },
  });
}
