import type { FastifyPluginAsync } from 'fastify';
import { query } from '../db.js';
import { authenticate, requireRole } from '../auth.js';
import { formatZodError, serviceCreateSchema, serviceUpdateSchema } from '../schemas.js';

interface ServiceRow {
  id: number;
  slug: string;
  title: string;
  icon: string;
  description: string;
  starting_price_rs: number;
  warranty_text: string;
  popular_models: string[];
  is_active: boolean;
}

function toServiceJson(row: ServiceRow) {
  return {
    id: row.slug,
    numericId: row.id,
    title: row.title,
    icon: row.icon,
    description: row.description,
    startingPriceRs: Number(row.starting_price_rs),
    warrantyText: row.warranty_text,
    popularModels: row.popular_models || [],
    isActive: row.is_active,
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const serviceRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const { active } = request.query as { active?: string };
    const where = active === 'true' ? 'WHERE is_active = TRUE' : '';
    const rows = await query<ServiceRow>(
      `SELECT * FROM service_categories ${where} ORDER BY id ASC`
    );
    return rows.map(toServiceJson);
  });

  fastify.post(
    '/',
    { preHandler: [authenticate, requireRole('admin')] },
    async (request, reply) => {
      const parsed = serviceCreateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          fields: formatZodError(parsed.error),
        });
      }

      const data = parsed.data;
      const slug = data.slug || slugify(data.title);
      const existing = await query<{ id: number }>(
        'SELECT id FROM service_categories WHERE slug = $1',
        [slug]
      );
      if (existing.length > 0) {
        return reply.code(409).send({ error: 'A service with that name already exists' });
      }

      const [row] = await query<ServiceRow>(
        `INSERT INTO service_categories
           (slug, title, icon, description, starting_price_rs, warranty_text,
            popular_models, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          slug,
          data.title,
          data.icon,
          data.description,
          data.starting_price_rs,
          data.warranty_text,
          JSON.stringify(data.popular_models),
          data.is_active,
        ]
      );

      return reply.code(201).send(toServiceJson(row));
    }
  );

  fastify.patch(
    '/:slug',
    { preHandler: [authenticate, requireRole('admin')] },
    async (request, reply) => {
      const { slug } = request.params as { slug: string };
      const parsed = serviceUpdateSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          fields: formatZodError(parsed.error),
        });
      }

      const data = parsed.data;
      const rows = await query<ServiceRow>(
        `UPDATE service_categories SET
           title = COALESCE($1, title),
           icon = COALESCE($2, icon),
           description = COALESCE($3, description),
           starting_price_rs = COALESCE($4, starting_price_rs),
           warranty_text = COALESCE($5, warranty_text),
           popular_models = COALESCE($6, popular_models),
           is_active = COALESCE($7, is_active)
         WHERE slug = $8
         RETURNING *`,
        [
          data.title ?? null,
          data.icon ?? null,
          data.description ?? null,
          data.starting_price_rs ?? null,
          data.warranty_text ?? null,
          data.popular_models ? JSON.stringify(data.popular_models) : null,
          data.is_active ?? null,
          slug,
        ]
      );

      if (rows.length === 0) {
        return reply.code(404).send({ error: 'Service not found' });
      }
      return toServiceJson(rows[0]);
    }
  );

  fastify.delete(
    '/:slug',
    { preHandler: [authenticate, requireRole('admin')] },
    async (request, reply) => {
      const { slug } = request.params as { slug: string };
      const rows = await query<{ id: number }>(
        'DELETE FROM service_categories WHERE slug = $1 RETURNING id',
        [slug]
      );
      if (rows.length === 0) {
        return reply.code(404).send({ error: 'Service not found' });
      }
      return reply.code(204).send();
    }
  );
};
