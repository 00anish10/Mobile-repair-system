import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import {
  assertDatabaseConnection,
  closePool,
  query,
  runMigrations,
} from './db.js';
import { userRoutes } from './routes/users.js';
import { technicianRoutes } from './routes/technicians.js';
import { bookingRoutes } from './routes/bookings.js';
import { catalogRoutes } from './routes/catalog.js';
import { serviceRoutes } from './routes/services.js';

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = Fastify({
  logger: {
    level: NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
        : undefined,
  },
  bodyLimit: 2 * 1024 * 1024,
});

function parseOrigins(): string[] | true | false {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw || raw === '*') {
    return NODE_ENV === 'production' ? false : true;
  }
  return raw.split(',').map((origin) => origin.trim()).filter(Boolean);
}

async function buildServer() {
  const origins = parseOrigins();
  await app.register(cors, {
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.get('/api/health', async (_request, reply) => {
    try {
      await query('SELECT 1');
      return {
        status: 'ok',
        database: 'connected',
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      app.log.error(error);
      return reply.code(503).send({
        status: 'degraded',
        database: 'unreachable',
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.get('/api', async () => ({
    name: 'Moon Mobile Repair API',
    version: '1.0.0',
    documentation: {
      auth: ['POST /api/users/register', 'POST /api/users/login', 'GET /api/users/me'],
      bookings: [
        'POST /api/bookings',
        'GET /api/bookings',
        'GET /api/bookings/:reference',
        'PATCH /api/bookings/:reference/status',
        'PATCH /api/bookings/:reference/assign',
        'PATCH /api/bookings/:reference/payment',
        'GET /api/bookings/stats/summary',
        'GET /api/bookings/export.csv',
      ],
      catalog: [
        'GET /api/technicians',
        'GET /api/service-areas',
        'GET /api/devices',
        'GET /api/reviews',
        'POST /api/contact',
      ],
    },
  }));

  await app.register(userRoutes, { prefix: '/api/users' });
  await app.register(technicianRoutes, { prefix: '/api/technicians' });
  await app.register(bookingRoutes, { prefix: '/api/bookings' });
  await app.register(serviceRoutes, { prefix: '/api/services' });
  await app.register(catalogRoutes, { prefix: '/api' });

  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      error: 'Not found',
      message: `No route matched ${request.method} ${request.url}`,
    });
  });

  app.setErrorHandler((error: import('fastify').FastifyError, request, reply) => {
    const statusCode = error.statusCode || (error.validation ? 400 : 500);

    if (statusCode >= 500) {
      request.log.error({ err: error }, 'Unhandled error');
    }

    reply.code(statusCode).send({
      error: statusCode >= 500 ? 'Internal server error' : error.message,
      ...(NODE_ENV === 'development' && statusCode >= 500
        ? { details: error.message }
        : {}),
    });
  });

  return app;
}

async function start() {
  try {
    await assertDatabaseConnection();
    app.log.info('Connected to PostgreSQL');

    if (process.env.RUN_MIGRATIONS !== 'false') {
      await runMigrations();
      app.log.info('Database schema and seed data are up to date');
    }

    await buildServer();
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`Moon Mobile Repair API listening on http://localhost:${PORT}/api`);
  } catch (error) {
    app.log.error(error, 'Failed to start server');
    process.exit(1);
  }
}

const shutdown = async (signal: string) => {
  app.log.info(`${signal} received, shutting down gracefully`);
  try {
    await app.close();
    await closePool();
    process.exit(0);
  } catch (error) {
    app.log.error(error, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

void start();
