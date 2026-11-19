import test from 'node:test';
import assert from 'node:assert/strict';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { authenticate, requireRole, signToken } from './auth.js';
import { bookingCreateSchema, resetPasswordSchema } from './schemas.js';

test('signed tokens round-trip through authenticate', async () => {
  const token = signToken({ id: 42, email: 'admin@example.com', role: 'admin', name: 'Admin' });
  const request = {
    headers: { authorization: `Bearer ${token}` },
  } as FastifyRequest;

  await authenticate(request);

  assert.equal(request.user?.id, 42);
  assert.equal(request.user?.email, 'admin@example.com');
  assert.equal(request.user?.role, 'admin');
});

test('authenticate rejects missing and invalid tokens', async () => {
  await assert.rejects(
    () => authenticate({ headers: {} } as FastifyRequest),
    (error: { statusCode?: number }) => error.statusCode === 401
  );

  await assert.rejects(
    () => authenticate({ headers: { authorization: 'Bearer not-a-token' } } as FastifyRequest),
    (error: { statusCode?: number }) => error.statusCode === 401
  );
});

test('requireRole blocks customers from admin actions', async () => {
  let statusCode = 0;
  const reply = {
    code(value: number) {
      statusCode = value;
      return this;
    },
    send() {
      return this;
    },
  } as unknown as FastifyReply;

  const request = {
    user: { id: 1, email: 'customer@example.com', role: 'customer', name: 'Customer' },
  } as FastifyRequest;

  await requireRole('admin')(request, reply);
  assert.equal(statusCode, 403);
});

test('booking payload cannot set ownership', () => {
  const booking = bookingCreateSchema.parse({
    reference: 'REP-2026-99999',
    user_id: 999,
    customer_name: 'Test Customer',
    customer_phone: '+61412345678',
    customer_email: 'customer@example.com',
    address: '1 Test Street',
    city: 'Sydney',
    area: 'Surry Hills',
    device_type: 'phone',
    brand: 'Apple',
    model: 'iPhone 15',
    problem_id: 'screen',
    problem_title: 'Screen replacement',
    scheduled_date: '2026-12-01',
    scheduled_time_slot: '9:00 AM - 11:00 AM',
    estimated_cost_rs: 199,
  });

  assert.equal('user_id' in booking, false);
});

test('reset password schema enforces password strength', () => {
  const weak = resetPasswordSchema.safeParse({
    token: 'a'.repeat(32),
    password: 'weakpassword',
  });
  const strong = resetPasswordSchema.safeParse({
    token: 'a'.repeat(32),
    password: 'StrongPass1',
  });

  assert.equal(weak.success, false);
  assert.equal(strong.success, true);
});
