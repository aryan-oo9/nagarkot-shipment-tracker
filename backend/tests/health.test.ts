import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import * as poolModule from '../src/db/pool';

describe('Health API - GET /api/health', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock_db';
  });

  it('should return 200 and healthy when database is connected', async () => {
    vi.spyOn(poolModule, 'checkDbHealth').mockResolvedValue({
      connected: true,
      latencyMs: 5,
    });

    const app = createApp();
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database.status).toBe('connected');
    expect(res.body.database.latencyMs).toBe(5);
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptimeSeconds');
  });

  it('should return 503 and degraded when database connection fails', async () => {
    vi.spyOn(poolModule, 'checkDbHealth').mockResolvedValue({
      connected: false,
      error: 'Connection timeout',
    });

    const app = createApp();
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.database.status).toBe('disconnected');
    expect(res.body.database.error).toBe('Connection timeout');
  });

  it('should return 200 and unverified when checkDb=false', async () => {
    const app = createApp();
    const res = await request(app).get('/api/health?checkDb=false');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database.status).toBe('unverified');
  });
});
