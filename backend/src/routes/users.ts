import type { FastifyPluginAsync } from 'fastify';
import { createHash, randomBytes } from 'node:crypto';
import { query, withTransaction } from '../db.js';
import {
  authenticate,
  hashPassword,
  optionalAuth,
  requireRole,
  signToken,
  verifyPassword,
  type AuthUser,
} from '../auth.js';
import { sendPasswordResetEmail } from '../notifications.js';
import {
  forgotPasswordSchema,
  formatZodError,
  loginSchema,
  profileUpdateSchema,
  registerSchema,
  resetPasswordSchema,
} from '../schemas.js';

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  phone: string | null;
  role: AuthUser['role'];
  avatar: string | null;
  created_at: string;
}

function toPublicUser(row: UserRow) {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    role: row.role,
    avatar: row.avatar || undefined,
    createdAt: row.created_at,
  };
}

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post(
    '/register',
    {
      preHandler: optionalAuth,
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    },
    async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Validation failed',
        fields: formatZodError(parsed.error),
      });
    }

    const data = parsed.data;
    // Only an authenticated admin may create privileged accounts.
    const role = request.user?.role === 'admin' ? data.role ?? 'customer' : 'customer';

    const existing = await query<{ id: number }>(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [data.email]
    );
    if (existing.length > 0) {
      return reply.code(409).send({ error: 'An account with this email already exists' });
    }

    const passwordHash = await hashPassword(data.password);
    const [user] = await query<UserRow>(
      `INSERT INTO users (name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.name, data.email, passwordHash, data.phone ?? null, role]
    );

    const publicUser = toPublicUser(user);
    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

      return reply.code(201).send({ user: publicUser, token });
    }
  );

  fastify.post(
    '/login',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Validation failed',
        fields: formatZodError(parsed.error),
      });
    }

    const { email, password } = parsed.data;
    const rows = await query<UserRow>('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [
      email,
    ]);
    const user = rows[0];

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return reply.code(401).send({ error: 'Invalid email or password' });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

      return { user: toPublicUser(user), token };
    }
  );

  fastify.post(
    '/forgot-password',
    { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const parsed = forgotPasswordSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          fields: formatZodError(parsed.error),
        });
      }

      const rows = await query<{ id: number; name: string; email: string }>(
        'SELECT id, name, email FROM users WHERE LOWER(email) = LOWER($1)',
        [parsed.data.email]
      );

      const user = rows[0];
      if (user) {
        const token = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        await query(
          `DELETE FROM password_reset_tokens
           WHERE user_id = $1 AND (used_at IS NOT NULL OR expires_at < NOW())`,
          [user.id]
        );
        await query(
          `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
           VALUES ($1, $2, $3)`,
          [user.id, tokenHash, expiresAt]
        );

        void sendPasswordResetEmail(user.email, user.name, token).catch((error) => {
          console.error('[password-reset] email delivery failed:', error);
        });
      }

      return {
        message: 'If an account exists for that email, a password reset link has been sent.',
      };
    }
  );

  fastify.post(
    '/reset-password',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request, reply) => {
      const parsed = resetPasswordSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          fields: formatZodError(parsed.error),
        });
      }

      const tokenHash = createHash('sha256').update(parsed.data.token).digest('hex');
      const rows = await query<{ id: number; user_id: number }>(
        `SELECT id, user_id FROM password_reset_tokens
         WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()`,
        [tokenHash]
      );

      const tokenRow = rows[0];
      if (!tokenRow) {
        return reply.code(400).send({ error: 'This reset link is invalid or has expired.' });
      }

      const passwordHash = await hashPassword(parsed.data.password);
      await withTransaction(async (client) => {
        await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [
          passwordHash,
          tokenRow.user_id,
        ]);
        await client.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1', [
          tokenRow.id,
        ]);
        await client.query(
          'DELETE FROM password_reset_tokens WHERE user_id = $1 AND id <> $2',
          [tokenRow.user_id, tokenRow.id]
        );
      });

      return { message: 'Your password has been reset. You can now sign in.' };
    }
  );

  fastify.get('/me', { preHandler: authenticate }, async (request, reply) => {
    const rows = await query<UserRow>('SELECT * FROM users WHERE id = $1', [request.user!.id]);
    if (rows.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }
    return { user: toPublicUser(rows[0]) };
  });

  fastify.put('/me', { preHandler: authenticate }, async (request, reply) => {
    const parsed = profileUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Validation failed',
        fields: formatZodError(parsed.error),
      });
    }

    const data = parsed.data;
    const rows = await query<UserRow>(
      `UPDATE users
       SET name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           avatar = COALESCE($3, avatar)
       WHERE id = $4
       RETURNING *`,
      [data.name ?? null, data.phone ?? null, data.avatar || null, request.user!.id]
    );

    if (rows.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }
    return { user: toPublicUser(rows[0]) };
  });

  fastify.get('/', { preHandler: [authenticate, requireRole('admin')] }, async () => {
    const rows = await query<UserRow & { bookings_count: string; total_spent: string }>(
      `SELECT u.*,
              COUNT(b.id)::text AS bookings_count,
              COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.estimated_cost_rs ELSE 0 END), 0)::text AS total_spent
       FROM users u
       LEFT JOIN bookings b ON b.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );

    return rows.map((row) => ({
      ...toPublicUser(row),
      bookingsCount: Number(row.bookings_count),
      totalSpentRs: Number(row.total_spent),
    }));
  });
};
