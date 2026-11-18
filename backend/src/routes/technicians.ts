import type { FastifyPluginAsync } from 'fastify';
import { query } from '../db.js';
import { authenticate, requireRole } from '../auth.js';
import { formatZodError, technicianCreateSchema } from '../schemas.js';

interface TechnicianRow {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  specialty: string | null;
  experience_years: number;
  avatar: string | null;
  rating: string;
  reviews_count: number;
  vehicle: string | null;
  license_plate: string | null;
  status: 'available' | 'on_job' | 'offline';
  completed_jobs: number;
  specialties: string[];
  active_areas: string[];
}

export function toTechnicianJson(row: TechnicianRow) {
  return {
    id: `TECH-${String(row.id).padStart(3, '0')}`,
    numericId: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    photoUrl:
      row.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=2563eb&color=fff`,
    rating: Number(row.rating),
    reviewsCount: row.reviews_count,
    experienceYears: row.experience_years,
    specialty: row.specialty || '',
    vehicle: row.vehicle || 'Mobile Repair Lab',
    licensePlate: row.license_plate || '—',
    activeAreas: row.active_areas,
    status: row.status,
    completedJobs: row.completed_jobs,
    specialties: row.specialties,
  };
}

export const technicianRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const { city, status } = request.query as { city?: string; status?: string };
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (city) {
      params.push(city);
      conditions.push(`active_areas ? $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await query<TechnicianRow>(
      `SELECT * FROM technicians ${where} ORDER BY rating DESC, completed_jobs DESC`,
      params
    );
    return rows.map(toTechnicianJson);
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const numericId = Number(id.replace(/\D/g, ''));
    const rows = await query<TechnicianRow>('SELECT * FROM technicians WHERE id = $1', [
      numericId,
    ]);
    if (rows.length === 0) {
      return reply.code(404).send({ error: 'Technician not found' });
    }
    return toTechnicianJson(rows[0]);
  });

  fastify.post('/', { preHandler: [authenticate, requireRole('admin')] }, async (request, reply) => {
    const parsed = technicianCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Validation failed',
        fields: formatZodError(parsed.error),
      });
    }

    const data = parsed.data;
    const [row] = await query<TechnicianRow>(
      `INSERT INTO technicians
         (name, phone, email, specialty, experience_years, avatar, rating,
          vehicle, license_plate, status, specialties, active_areas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        data.name,
        data.phone ?? null,
        data.email ?? null,
        data.specialty ?? null,
        data.experience_years,
        data.avatar ?? null,
        data.rating,
        data.vehicle ?? null,
        data.license_plate ?? null,
        data.status,
        JSON.stringify(data.specialties),
        JSON.stringify(data.active_areas),
      ]
    );

    return reply.code(201).send(toTechnicianJson(row));
  });

  fastify.patch(
    '/:id',
    { preHandler: [authenticate, requireRole('admin')] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const numericId = Number(id.replace(/\D/g, ''));
      const parsed = technicianCreateSchema.partial().safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          fields: formatZodError(parsed.error),
        });
      }

      const data = parsed.data;
      const rows = await query<TechnicianRow>(
        `UPDATE technicians SET
           name = COALESCE($1, name),
           phone = COALESCE($2, phone),
           email = COALESCE($3, email),
           specialty = COALESCE($4, specialty),
           experience_years = COALESCE($5, experience_years),
           avatar = COALESCE($6, avatar),
           rating = COALESCE($7, rating),
           vehicle = COALESCE($8, vehicle),
           license_plate = COALESCE($9, license_plate),
           status = COALESCE($10, status),
           specialties = COALESCE($11, specialties),
           active_areas = COALESCE($12, active_areas)
         WHERE id = $13
         RETURNING *`,
        [
          data.name ?? null,
          data.phone ?? null,
          data.email ?? null,
          data.specialty ?? null,
          data.experience_years ?? null,
          data.avatar ?? null,
          data.rating ?? null,
          data.vehicle ?? null,
          data.license_plate ?? null,
          data.status ?? null,
          data.specialties ? JSON.stringify(data.specialties) : null,
          data.active_areas ? JSON.stringify(data.active_areas) : null,
          numericId,
        ]
      );

      if (rows.length === 0) {
        return reply.code(404).send({ error: 'Technician not found' });
      }
      return toTechnicianJson(rows[0]);
    }
  );

  fastify.delete(
    '/:id',
    { preHandler: [authenticate, requireRole('admin')] },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const numericId = Number(id.replace(/\D/g, ''));
      const rows = await query<{ id: number }>(
        'DELETE FROM technicians WHERE id = $1 RETURNING id',
        [numericId]
      );
      if (rows.length === 0) {
        return reply.code(404).send({ error: 'Technician not found' });
      }
      return reply.code(204).send();
    }
  );
};
