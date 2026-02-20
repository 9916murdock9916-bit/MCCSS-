import request from 'supertest';
import app from '../bin/admin-server.js';
import { LeaseManager } from '../core/leases.js';

describe('admin-server endpoints', () => {
  beforeAll(() => {
    process.env.ADMIN_API_TOKEN = 'test-token';
    LeaseManager.initSync();
    LeaseManager.leases = [];
  });

  test('GET /leases requires auth', async () => {
    await request(app).get('/leases').expect(403);
  });

  test('GET /leases with token returns 200', async () => {
    await request(app).get('/leases').set('x-admin-token', 'test-token').expect(200);
  });
});
