import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { pool, query } from '../db.js';
import { authenticate, requireRole } from '../auth.js';
import { notifyBookingCreated, notifyBookingStatusChanged } from '../notifications.js';
import {
  assignTechnicianSchema,
  bookingCreateSchema,
  bookingStatusSchema,
  formatZodError,
} from '../schemas.js';

interface BookingRow {
  id: number;
  reference: string;
  user_id: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  address: string;
  city: string;
  area: string;
  landmark: string | null;
  device_type: string;
  brand: string;
  model: string;
  problem_id: string;
  problem_title: string;
  problem_description: string | null;
  service_type: string;
  scheduled_date: string | Date;
  scheduled_time_slot: string;
  estimated_cost_rs: string;
  status: string;
  technician_id: number | null;
  technician_name?: string | null;
  payment_method: string;
  payment_status: string;
  warranty_duration: string | null;
  warranty_valid_until: string | Date | null;
  technician_notes: string | null;
  photo_urls: string[];
  created_at: string | Date;
}

function dateOnly(value: string | Date | null): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value.slice(0, 10);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function toBookingJson(row: BookingRow) {
  return {
    id: `#${row.reference}`,
    numericId: row.id,
    reference: row.reference,
    createdAt: new Date(row.created_at).toISOString(),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    address: row.address,
    city: row.city,
    area: row.area,
    landmark: row.landmark || undefined,
    deviceType: row.device_type,
    brand: row.brand,
    model: row.model,
    problemId: row.problem_id,
    problemTitle: row.problem_title,
    problemDescription: row.problem_description || '',
    serviceType: row.service_type,
    scheduledDate: dateOnly(row.scheduled_date),
    scheduledTimeSlot: row.scheduled_time_slot,
    estimatedCostRs: Number(row.estimated_cost_rs),
    status: row.status,
    technicianId: row.technician_id
      ? `TECH-${String(row.technician_id).padStart(3, '0')}`
      : undefined,
    technicianName: row.technician_name || undefined,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    warrantyDuration: row.warranty_duration || undefined,
    warrantyValidUntil: dateOnly(row.warranty_valid_until),
    technicianNotes: row.technician_notes || undefined,
    photoUrls: row.photo_urls || [],
  };
}

function normalizeReference(input: string): string {
  return input.trim().replace(/^#/, '').toUpperCase();
}

function canAccessBooking(
  request: FastifyRequest,
  row: Pick<BookingRow, 'user_id' | 'customer_email'>
): boolean {
  const user = request.user;
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'technician') return true;
  return (
    row.user_id === user.id ||
    row.customer_email.toLowerCase() === user.email.toLowerCase()
  );
}

const bookingSelect = `
  SELECT b.*, t.name AS technician_name
  FROM bookings b
  LEFT JOIN technicians t ON t.id = b.technician_id
`;

export const bookingRoutes: FastifyPluginAsync = async (fastify) => {
  // Create a booking for the authenticated user
  fastify.post('/', { preHandler: authenticate }, async (request, reply) => {
    const parsed = bookingCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Validation failed',
        fields: formatZodError(parsed.error),
      });
    }

    const data = parsed.data;
    const userId = request.user!.id;

    let technicianId = data.technician_id ?? null;
    if (!technicianId) {
      const matched = await query<{ id: number }>(
        `SELECT id FROM technicians
         WHERE status = 'available' AND active_areas ? $1
         ORDER BY rating DESC, completed_jobs DESC
         LIMIT 1`,
        [data.city]
      );
      technicianId =
        matched[0]?.id ??
        (
          await query<{ id: number }>(
            `SELECT id FROM technicians WHERE status = 'available'
             ORDER BY rating DESC LIMIT 1`
          )
        )[0]?.id ??
        null;
    }

    const { rows: seqRows } = await pool.query<{ seq: string }>(
      `SELECT nextval('booking_reference_seq')::text AS seq`
    );
    const reference =
      data.reference?.replace(/^#/, '').toUpperCase() ||
      `REP-${new Date().getFullYear()}-${String(seqRows[0].seq).padStart(5, '0')}`;

    const warrantyMonths = data.problem_id === 'screen_replacement' ? 12 : 6;
    const warrantyValidUntil = new Date();
    warrantyValidUntil.setMonth(warrantyValidUntil.getMonth() + warrantyMonths);
    const warrantyDuration =
      data.problem_id === 'screen_replacement'
        ? '12 Months Doorstep Screen Guarantee'
        : `${warrantyMonths} Months Comprehensive Warranty`;

    const [row] = await query<BookingRow>(
      `INSERT INTO bookings (
         reference, user_id, customer_name, customer_phone, customer_email,
         address, city, area, landmark, device_type, brand, model,
         problem_id, problem_title, problem_description, service_type,
         scheduled_date, scheduled_time_slot, estimated_cost_rs, status,
         technician_id, payment_method, payment_status, warranty_duration,
         warranty_valid_until, photo_urls
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
         $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
       )
       RETURNING *`,
      [
        reference,
        userId,
        data.customer_name,
        data.customer_phone,
        data.customer_email,
        data.address,
        data.city,
        data.area,
        data.landmark || null,
        data.device_type,
        data.brand,
        data.model,
        data.problem_id,
        data.problem_title,
        data.problem_description || null,
        data.service_type,
        data.scheduled_date,
        data.scheduled_time_slot,
        data.estimated_cost_rs,
        technicianId ? 'technician_assigned' : 'confirmed',
        technicianId,
        data.payment_method,
        'pending',
        warrantyDuration,
        warrantyValidUntil.toISOString().slice(0, 10),
        JSON.stringify(data.photo_urls ?? []),
      ]
    );

    const booking = toBookingJson(row);
    void notifyBookingCreated(booking);
    return reply.code(201).send(booking);
  });

  // List bookings (customers see only their own, admins see everything)
  fastify.get('/', { preHandler: authenticate }, async (request) => {
    const user = request.user!;
    const { status, search, city, limit } = request.query as {
      status?: string;
      search?: string;
      city?: string;
      limit?: string;
    };

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (user.role === 'customer') {
      params.push(user.id, user.email);
      conditions.push(`(b.user_id = $${params.length - 1} OR LOWER(b.customer_email) = LOWER($${params.length}))`);
    }
    if (status && status !== 'all') {
      params.push(status);
      conditions.push(`b.status = $${params.length}`);
    }
    if (city) {
      params.push(city);
      conditions.push(`LOWER(b.city) = LOWER($${params.length})`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(
        `(b.reference ILIKE $${params.length} OR b.customer_name ILIKE $${params.length} OR b.model ILIKE $${params.length} OR b.customer_email ILIKE $${params.length})`
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
    const rows = await query<BookingRow>(
      `${bookingSelect} ${where} ORDER BY b.created_at DESC LIMIT ${safeLimit}`,
      params
    );
    return rows.map(toBookingJson);
  });

  // Dashboard summary for admins
  fastify.get(
    '/stats/summary',
    { preHandler: [authenticate, requireRole('admin')] },
    async () => {
      const [totals] = await query<{
        total: string;
        active: string;
        completed: string;
        cancelled: string;
        revenue: string;
        avg_cost: string;
      }>(
        `SELECT
           COUNT(*)::text AS total,
           COUNT(*) FILTER (WHERE status NOT IN ('completed', 'cancelled'))::text AS active,
           COUNT(*) FILTER (WHERE status = 'completed')::text AS completed,
           COUNT(*) FILTER (WHERE status = 'cancelled')::text AS cancelled,
           COALESCE(SUM(CASE WHEN status = 'completed' OR payment_status = 'paid'
                             THEN estimated_cost_rs ELSE 0 END), 0)::text AS revenue,
           COALESCE(AVG(estimated_cost_rs), 0)::text AS avg_cost
         FROM bookings`
      );

      const statusDistribution = await query<{ status: string; count: string }>(
        `SELECT status, COUNT(*)::text AS count FROM bookings GROUP BY status ORDER BY count DESC`
      );

      const last7Days = await query<{ day: string; count: string; revenue: string }>(
        `SELECT TO_CHAR(d.day, 'YYYY-MM-DD') AS day,
                COUNT(b.id)::text AS count,
                COALESCE(SUM(b.estimated_cost_rs) FILTER (WHERE b.status = 'completed'), 0)::text AS revenue
         FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, INTERVAL '1 day') AS d(day)
         LEFT JOIN bookings b ON DATE(b.created_at) = d.day
         GROUP BY d.day
         ORDER BY d.day`
      );

      const topDevices = await query<{ device: string; count: string }>(
        `SELECT brand || ' ' || model AS device, COUNT(*)::text AS count
         FROM bookings GROUP BY brand, model ORDER BY COUNT(*) DESC LIMIT 5`
      );

      const topIssues = await query<{ issue: string; count: string }>(
        `SELECT problem_title AS issue, COUNT(*)::text AS count
         FROM bookings GROUP BY problem_title ORDER BY COUNT(*) DESC LIMIT 5`
      );

      const technicianLoad = await query<{
        id: number;
        name: string;
        status: string;
        active_jobs: string;
        completed_jobs: string;
      }>(
        `SELECT t.id, t.name, t.status,
                COUNT(b.id) FILTER (WHERE b.status NOT IN ('completed', 'cancelled'))::text AS active_jobs,
                COUNT(b.id) FILTER (WHERE b.status = 'completed')::text AS completed_jobs
         FROM technicians t
         LEFT JOIN bookings b ON b.technician_id = t.id
         GROUP BY t.id
         ORDER BY active_jobs DESC, t.rating DESC`
      );

      return {
        totals: {
          total: Number(totals.total),
          active: Number(totals.active),
          completed: Number(totals.completed),
          cancelled: Number(totals.cancelled),
          revenueRs: Number(totals.revenue),
          avgCostRs: Math.round(Number(totals.avg_cost)),
        },
        statusDistribution: statusDistribution.map((s) => ({
          status: s.status,
          count: Number(s.count),
        })),
        last7Days: last7Days.map((d) => ({
          day: d.day,
          count: Number(d.count),
          revenueRs: Number(d.revenue),
        })),
        topDevices: topDevices.map((d) => ({ device: d.device, count: Number(d.count) })),
        topIssues: topIssues.map((i) => ({ issue: i.issue, count: Number(i.count) })),
        technicianLoad: technicianLoad.map((t) => ({
          id: `TECH-${String(t.id).padStart(3, '0')}`,
          name: t.name,
          status: t.status,
          activeJobs: Number(t.active_jobs),
          completedJobs: Number(t.completed_jobs),
        })),
      };
    }
  );

  // CSV export for admins
  fastify.get(
    '/export.csv',
    { preHandler: [authenticate, requireRole('admin')] },
    async (_request, reply) => {
      const rows = await query<BookingRow>(`${bookingSelect} ORDER BY b.created_at DESC`);
      const header = [
        'Reference',
        'Created',
        'Customer',
        'Phone',
        'Email',
        'City',
        'Area',
        'Device',
        'Problem',
        'Service',
        'Scheduled Date',
        'Time Slot',
        'Status',
        'Technician',
        'Cost ($)',
        'Payment Status',
      ];

      const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
      const lines = rows.map((row) =>
        [
          row.reference,
          new Date(row.created_at).toISOString(),
          row.customer_name,
          row.customer_phone,
          row.customer_email,
          row.city,
          row.area,
          `${row.brand} ${row.model}`,
          row.problem_title,
          row.service_type,
          dateOnly(row.scheduled_date),
          row.scheduled_time_slot,
          row.status,
          row.technician_name || 'Unassigned',
          Number(row.estimated_cost_rs).toFixed(2),
          row.payment_status,
        ]
          .map(escape)
          .join(',')
      );

      reply
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header(
          'Content-Disposition',
          `attachment; filename="moon-mobile-bookings-${new Date().toISOString().slice(0, 10)}.csv"`
        );
      return [header.map(escape).join(','), ...lines].join('\n');
    }
  );

  fastify.get('/:reference', { preHandler: authenticate }, async (request, reply) => {
    const { reference } = request.params as { reference: string };
    const rows = await query<BookingRow>(`${bookingSelect} WHERE b.reference = $1`, [
      normalizeReference(reference),
    ]);
    if (rows.length === 0) {
      return reply.code(404).send({ error: 'Booking not found' });
    }
    if (!canAccessBooking(request, rows[0])) {
      return reply.code(403).send({ error: 'You do not have access to this booking' });
    }
    return toBookingJson(rows[0]);
  });

  fastify.patch('/:reference/status', { preHandler: authenticate }, async (request, reply) => {
    const { reference } = request.params as { reference: string };
    const parsed = bookingStatusSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: 'Validation failed',
        fields: formatZodError(parsed.error),
      });
    }

    const existing = await query<BookingRow>(`${bookingSelect} WHERE b.reference = $1`, [
      normalizeReference(reference),
    ]);
    if (existing.length === 0) {
      return reply.code(404).send({ error: 'Booking not found' });
    }

    const isAdmin = request.user!.role === 'admin';
    const isOwner = canAccessBooking(request, existing[0]);
    if (!isAdmin && !isOwner) {
      return reply.code(403).send({ error: 'You cannot update this booking' });
    }
    // Customers may only cancel their own booking.
    if (!isAdmin && parsed.data.status !== 'cancelled') {
      return reply
        .code(403)
        .send({ error: 'Only an admin can advance the repair status' });
    }

    const rows = await query<BookingRow>(
      `UPDATE bookings
       SET status = $1,
           technician_notes = COALESCE($2, technician_notes),
           payment_status = CASE WHEN $1 = 'completed' THEN 'paid' ELSE payment_status END
       WHERE reference = $3
       RETURNING *`,
      [parsed.data.status, parsed.data.notes ?? null, normalizeReference(reference)]
    );

    const booking = toBookingJson(rows[0]);
    void notifyBookingStatusChanged(booking);
    return booking;
  });

  fastify.patch(
    '/:reference/assign',
    { preHandler: [authenticate, requireRole('admin')] },
    async (request, reply) => {
      const { reference } = request.params as { reference: string };
      const parsed = assignTechnicianSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          error: 'Validation failed',
          fields: formatZodError(parsed.error),
        });
      }

      const rows = await query<BookingRow>(
        `UPDATE bookings
         SET technician_id = $1,
             status = CASE WHEN status = 'confirmed' THEN 'technician_assigned' ELSE status END
         WHERE reference = $2
         RETURNING *`,
        [parsed.data.technician_id, normalizeReference(reference)]
      );
      if (rows.length === 0) {
        return reply.code(404).send({ error: 'Booking not found' });
      }
      return toBookingJson(rows[0]);
    }
  );

  fastify.patch(
    '/:reference/payment',
    { preHandler: [authenticate, requireRole('admin')] },
    async (request, reply) => {
      const { reference } = request.params as { reference: string };
      const rows = await query<BookingRow>(
        `UPDATE bookings SET payment_status = 'paid' WHERE reference = $1 RETURNING *`,
        [normalizeReference(reference)]
      );
      if (rows.length === 0) {
        return reply.code(404).send({ error: 'Booking not found' });
      }
      return toBookingJson(rows[0]);
    }
  );
};
