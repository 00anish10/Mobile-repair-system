import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const databaseDir = path.resolve(__dirname, '../database');

interface DatabaseTarget {
  host: string;
  port: number;
  database: string;
  user: string;
}

function parseDatabaseUrl(connectionString: string): DatabaseTarget {
  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname || 'localhost',
      port: Number(url.port) || 5432,
      database: url.pathname.replace(/^\//, '') || 'moon_mobile_repair',
      user: url.username || 'postgres',
    };
  } catch {
    return { host: 'unknown', port: 5432, database: 'unknown', user: 'unknown' };
  }
}

function discreteDatabaseConfig() {
  const host = process.env.DB_HOST || process.env.PGHOST || 'localhost';
  const port = Number(process.env.DB_PORT || process.env.PGPORT || 5432);
  const database = process.env.DB_NAME || process.env.PGDATABASE || 'moon_mobile_repair';
  const user = process.env.DB_USER || process.env.PGUSER || 'postgres';
  const password = process.env.DB_PASSWORD ?? process.env.PGPASSWORD;

  return {
    host,
    port,
    database,
    user,
    ...(password ? { password } : {}),
    ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
  };
}

const databaseUrl = process.env.DATABASE_URL?.trim();
const discreteConfig = discreteDatabaseConfig();
const databaseConfig = databaseUrl ? { connectionString: databaseUrl } : discreteConfig;

export const databaseTarget: DatabaseTarget = databaseUrl
  ? parseDatabaseUrl(databaseUrl)
  : {
      host: discreteConfig.host,
      port: discreteConfig.port,
      database: discreteConfig.database,
      user: discreteConfig.user,
    };

export const pool = new Pool({
  ...databaseConfig,
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('[db] Unexpected idle client error', err);
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function runMigrations(): Promise<void> {
  const [schema, seed] = await Promise.all([
    readFile(path.join(databaseDir, 'schema.sql'), 'utf8'),
    readFile(path.join(databaseDir, 'seed.sql'), 'utf8'),
  ]);

  await pool.query(schema);
  await pool.query(seed);
}

export async function assertDatabaseConnection(): Promise<void> {
  await pool.query('SELECT 1');
}

export async function closePool(): Promise<void> {
  await pool.end();
}
