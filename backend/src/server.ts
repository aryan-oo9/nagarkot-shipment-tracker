import { createApp } from './app';
import { getEnv } from './config/env';
import { closePool } from './db/pool';

const env = getEnv();
const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`[Nagarkot Backend] Server running on port ${env.PORT} (${env.NODE_ENV})`);
  console.log(`[Nagarkot Backend] Health endpoint: http://localhost:${env.PORT}/api/health`);
  console.log(`[Nagarkot Backend] Shipments endpoint: http://localhost:${env.PORT}/api/shipments`);
});

// Graceful shutdown handling
async function shutdown(signal: string) {
  console.log(`\n[Nagarkot Backend] Received ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    console.log('[Nagarkot Backend] HTTP server closed.');
    try {
      await closePool();
      console.log('[Nagarkot Backend] Database pool closed.');
      process.exit(0);
    } catch (err) {
      console.error('[Nagarkot Backend] Error closing database pool:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds timeout
  setTimeout(() => {
    console.error('[Nagarkot Backend] Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
