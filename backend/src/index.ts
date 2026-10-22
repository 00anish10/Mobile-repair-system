const fastify = require('fastify')({ logger: true });
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/moon_mobile_repair',
});

pool.query('SELECT 1', (err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to database');
});

async function setupDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS technicians (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      specialty VARCHAR(255),
      experience INTEGER DEFAULT 0,
      avatar VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      device_type VARCHAR(50) NOT NULL,
      service_area VARCHAR(100) NOT NULL,
      device_issue TEXT NOT NULL,
      priority VARCHAR(20),
      estimated_cost DECIMAL(10, 2),
      device_model VARCHAR(100),
      notes TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      assigned_technician_id INTEGER REFERENCES technicians(id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS service_areas (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      cities JSONB DEFAULT '[]'::jsonb,
      is_active BOOLEAN DEFAULT true
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS devices (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      description TEXT,
      image_url VARCHAR(255)
    )
  `);

  // Seed technicians
  await pool.query(`
    INSERT INTO technicians (name, specialty, experience, avatar) VALUES
      ('Ramesh Sharma', 'Screen Repair', 5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'),
      ('Priya Singh', 'Battery Replacement', 4, 'https://images.unsplash.com/photo-1522071820081-002f17c491d5?w=150&h=150&fit=crop'),
      ('Amit Patel', 'Water Damage', 6, 'https://images.unsplash.com/photo-1566703130475-5889f6d497e6?w=150&h=150&fit=crop'),
      ('Sneha Roy', 'Software Troubleshooting', 3, 'https://images.unsplash.com/photo-1593642638127-d31411b880d1?w=150&h=150&fit=crop'),
      ('Kabir Hassan', 'Hardware Diagnostics', 7, 'https://images.unsplash.com/photo-1582733894851-c413bcb86a2a?w=150&h=150&fit=crop')
  `).then(() => console.log('Technicians seeded'));

  // Seed service areas
  await pool.query(`
    INSERT INTO service_areas (name, cities, is_active) VALUES
      ('Kathmandu Valley', '["Kathmandu", "Lalitpur", "Bhaktapur"]'::jsonb, true),
      ('Pokhara', '["Pokhara"]'::jsonb, true),
      ('Chitwan', '["Bharatpur"]'::jsonb, true),
      ('Biratnagar', '["Biratnagar"]'::jsonb, true),
      ('Butwal', '["Butwal"]'::jsonb, true)
  `).then(() => console.log('Service areas seeded'));

  // Seed devices
  await pool.query(`
    INSERT INTO devices (name, category, description, image_url) VALUES
      ('iPhone 15 Pro', 'Smartphone', 'Latest Apple flagship with titanium frame', '/placeholder-ipphone.jpg'),
      ('Samsung Galaxy S24', 'Smartphone', 'Latest Samsung with premium display', '/placeholder-samsung.jpg'),
      ('iPad Pro', 'Tablet', 'Apple pro tablet with M2 chip', '/placeholder-ipad.jpg'),
      ('Samsung Galaxy Tab', 'Tablet', 'Samsung flagship tablet', '/placeholder-tab.jpg'),
      ('Google Pixel', 'Smartphone', 'Pure Android experience', '/placeholder-pixel.jpg')
  `).then(() => console.log('Devices seeded'));
}

async function technicianRoutes(fastify) {
  fastify.get('/', async (request, reply) => {
    const { rows } = await pool.query('SELECT id, name, specialty, experience, avatar FROM technicians');
    return rows;
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const { rows } = await pool.query('SELECT * FROM technicians WHERE id = $1', [id]);
    if (rows.length === 0) {
      return reply.code(404).send({ error: 'Technician not found' });
    }
    return rows[0];
  });
}

async function bookingRoutes(fastify) {
  fastify.get('/', async (request, reply) => {
    const { rows } = await pool.query(`
      SELECT b.id, b.device_type, b.service_area, b.device_issue, b.status,
             b.created_at, u.email, t.name as technician_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN technicians t ON b.assigned_technician_id = t.id
    `);
    return rows;
  });

  fastify.post('/', async (request, reply) => {
    const {
      user_id, device_type, service_area, device_issue,
      priority, estimated_cost, device_model, notes
    } = request.body;

    const result = await pool.query(
      `INSERT INTO bookings (user_id, device_type, service_area, device_issue, priority, estimated_cost, device_model, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [user_id, device_type, service_area, device_issue, priority, estimated_cost, device_model, notes]
    );
    return result.rows[0];
  });

  fastify.put('/:id/status', async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;
    await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', [status, id]);
    return { id, status };
  });
}

async function userRoutes(fastify) {
  fastify.post('/register', async (request, reply) => {
    const { name, email, password } = request.body;

    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return reply.code(400).send({ error: 'User already exists' });
    }

    const hashedPassword = password; // In production, hash with bcrypt
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'customer') RETURNING id, name, email, role`,
      [name, email, hashedPassword]
    );
    return result.rows[0];
  });

  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }
    const valid = password === rows[0].password; // In production, use bcrypt compare
    if (!valid) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }
    return { id: rows[0].id, name: rows[0].name, email: rows[0].email, role: rows[0].role };
  });
}

async function startServer() {
  await setupDatabase();

  fastify.register(technicianRoutes, { prefix: '/api/technicians' });
  fastify.register(bookingRoutes, { prefix: '/api/bookings' });
  fastify.register(userRoutes, { prefix: '/api/users' });

  fastify.listen({ port: process.env.PORT || 3001, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
}

startServer();