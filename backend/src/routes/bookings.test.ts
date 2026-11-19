import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { bookingRoutes } from './bookings.js';

test('booking creation rejects unauthenticated requests before touching the database', async () => {
  const app = Fastify();
  await app.register(bookingRoutes, { prefix: '/api/bookings' });

  const response = await app.inject({
    method: 'POST',
    url: '/api/bookings',
    payload: { customer_name: 'Anonymous' },
  });

  assert.equal(response.statusCode, 401);
  await app.close();
});

test('admin booking statistics reject unauthenticated requests', async () => {
  const app = Fastify();
  await app.register(bookingRoutes, { prefix: '/api/bookings' });

  const response = await app.inject({ method: 'GET', url: '/api/bookings/stats/summary' });

  assert.equal(response.statusCode, 401);
  await app.close();
});
