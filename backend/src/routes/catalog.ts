import type { FastifyPluginAsync } from 'fastify';
import { query } from '../db.js';
import { authenticate, requireRole } from '../auth.js';
import { contactMessageSchema, formatZodError } from '../schemas.js';

interface ServiceAreaRow {
  id: number;
  city: string;
  state: string;
  is_available: boolean;
  hubs: string[];
  response_time_minutes: number;
  technicians_count: number;
}

interface DeviceRow {
  id: number;
  name: string;
  category: string;
  description: string | null;
  image_url: string | null;
}

export const catalogRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/service-areas', async () => {
    const rows = await query<ServiceAreaRow>(
      `SELECT * FROM service_areas WHERE is_available = TRUE ORDER BY city`
    );
    return rows.map((row) => ({
      city: row.city,
      state: row.state,
      isAvailable: row.is_available,
      hubs: row.hubs,
      responseTimeMinutes: row.response_time_minutes,
      techniciansCount: row.technicians_count,
    }));
  });

  fastify.get('/devices', async () => {
    const rows = await query<DeviceRow>('SELECT * FROM devices ORDER BY name');
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description || '',
      imageUrl: row.image_url || '',
    }));
  });

  fastify.get('/reviews', async () => {
    const rows = await query<{
      id: number;
      customer_name: string;
      rating: number;
      device: string | null;
      repair_type: string | null;
      comment: string | null;
      verified: boolean;
      location: string | null;
      created_at: string;
    }>('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 50');

    return rows.map((row) => ({
      id: String(row.id),
      customerName: row.customer_name,
      rating: row.rating,
      device: row.device || '',
      repairType: row.repair_type || '',
      comment: row.comment || '',
      verified: row.verified,
      location: row.location || '',
      date: new Date(row.created_at).toISOString().slice(0, 10),
    }));
  });

  fastify.post(
    '/contact',
    { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } },
    async (request, reply) => {
    const parsed = contactMessageSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Validation failed',
        fields: formatZodError(parsed.error),
      });
    }

    const [row] = await query<{ id: number }>(
      `INSERT INTO contact_messages (name, email, subject, message)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [parsed.data.name, parsed.data.email, parsed.data.subject, parsed.data.message]
    );

    return reply.code(201).send({
      id: row.id,
      message: 'Thanks! Our support team will get back to you within 24 hours.',
    });
  });

  fastify.get(
    '/contact',
    { preHandler: [authenticate, requireRole('admin')] },
    async () => {
      const rows = await query(
        `SELECT id, name, email, subject, message, is_read, created_at
         FROM contact_messages ORDER BY created_at DESC LIMIT 200`
      );
      return rows;
    }
  );

  fastify.patch(
    '/contact/:id/read',
    { preHandler: [authenticate, requireRole('admin')] },
    async (request, reply) => {
      const id = Number((request.params as { id: string }).id);
      if (!Number.isInteger(id) || id < 1) {
        return reply.code(400).send({ error: 'Invalid message id' });
      }
      const rows = await query(
        `UPDATE contact_messages SET is_read = true WHERE id = $1
         RETURNING id, name, email, subject, message, is_read, created_at`,
        [id]
      );
      if (rows.length === 0) {
        return reply.code(404).send({ error: 'Message not found' });
      }
      return rows[0];
    }
  );

  fastify.delete(
    '/contact/:id',
    { preHandler: [authenticate, requireRole('admin')] },
    async (request, reply) => {
      const id = Number((request.params as { id: string }).id);
      if (!Number.isInteger(id) || id < 1) {
        return reply.code(400).send({ error: 'Invalid message id' });
      }
      const rows = await query('DELETE FROM contact_messages WHERE id = $1 RETURNING id', [id]);
      if (rows.length === 0) {
        return reply.code(404).send({ error: 'Message not found' });
      }
      return reply.code(204).send();
    }
  );
};
