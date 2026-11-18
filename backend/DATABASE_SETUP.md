# PostgreSQL / pgAdmin Setup

This guide creates the `moon_mobile_repair` database and loads the schema and demo data using **pgAdmin 4**.

Files used:

- `backend/database/schema.sql` - tables, indexes, triggers, legacy-upgrade logic
- `backend/database/seed.sql` - demo users, technicians, service categories, service areas, devices, reviews

Both scripts are idempotent and wrapped in `BEGIN; ... COMMIT;`.

---

## 1. Create the database (pgAdmin Query Tool)

In pgAdmin, right-click **Databases** and open **Query Tool** on the default `postgres` database.
Run:

```sql
CREATE DATABASE moon_mobile_repair
    WITH OWNER = postgres
         ENCODING = 'UTF8'
         TEMPLATE = template0;
```

If the database already exists, skip this step.

---

## 2. Load the schema

1. In pgAdmin's left tree, select the new `moon_mobile_repair` database.
2. Open **Tools -> Query Tool** (connected to `moon_mobile_repair`).
3. Open `backend/database/schema.sql` in your editor, copy all of it, paste it into the Query Tool, and press **Execute** (F5).
4. Wait for the success message, then run `backend/database/seed.sql` the same way.

The seed script must run **after** the schema.

> pgAdmin does not support the `psql` `\i` meta-command. Either paste each file into the Query Tool, or run the terminal alternative below.

### Terminal alternative (same result)

Use the same host/port/password that your `backend/.env` points to. For example, if PostgreSQL runs on port `5433`:

```bash
PGPASSWORD=password psql -h localhost -p 5433 -U postgres -d moon_mobile_repair -f backend/database/schema.sql
PGPASSWORD=password psql -h localhost -p 5433 -U postgres -d moon_mobile_repair -f backend/database/seed.sql
```

Or let the backend do it automatically:

```bash
cd backend
npm install
npm run migrate
```

Migration is also applied at API startup when `RUN_MIGRATIONS=true` (the default in `.env`).

---

## 3. Verify the install

Run this in pgAdmin's Query Tool:

```sql
SELECT 'users' AS table_name, COUNT(*) FROM users
UNION ALL SELECT 'technicians', COUNT(*) FROM technicians
UNION ALL SELECT 'service_areas', COUNT(*) FROM service_areas
UNION ALL SELECT 'devices', COUNT(*) FROM devices
UNION ALL SELECT 'service_categories', COUNT(*) FROM service_categories
UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL SELECT 'contact_messages', COUNT(*) FROM contact_messages
ORDER BY table_name;
```

Expected seed minimums: 3 users, 5 technicians, 10 service categories, 32 service areas, 7 devices, reviews > 0.

Check the demo accounts:

```sql
SELECT id, name, email, role FROM users ORDER BY id;
```

---

## 4. Connect the API

`backend/.env` supports either one connection string or discrete settings.

Option A - connection string:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5433/moon_mobile_repair
PORT=3001
RUN_MIGRATIONS=true
```

Option B - discrete settings (this is what your current `.env` uses):

```env
DB_NAME=moon_mobile_repair
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5433
PORT=3001
RUN_MIGRATIONS=true
```

The API, `npm run migrate`, and pgAdmin must all point to the **same host, port, and database**. If pgAdmin shows a table but `COUNT(*)` is `0`, you are either on a different port/database or the seed script has not run yet.

Then start the API:

```bash
cd backend
npm run dev
```

`npm run migrate` prints the exact target, for example:

```text
Connected to PostgreSQL at localhost:5433/moon_mobile_repair (user: postgres)
Schema and seed data applied successfully
```

Health check: <http://localhost:3001/api/health> should return:

```json
{ "status": "ok", "database": "connected" }
```

Start the frontend in a separate terminal:

```bash
cd frontend
npm run dev
```

Vite proxies `/api` to `http://localhost:3001`.

---

## 5. Demo logins

| Role     | Email                          | Password |
| -------- | ------------------------------ | -------- |
| Admin    | `admin@moonmobilerepair.com`   | `admin123` |
| Customer | `anishshrestha2007@gmail.com`  | `demo123`  |

---

## 6. Useful pgAdmin queries

Recent bookings:

```sql
SELECT reference, customer_name, brand, model, problem_title,
       scheduled_date, status, estimated_cost_rs, created_at
FROM bookings
ORDER BY created_at DESC
LIMIT 20;
```

Revenue summary (completed / paid only):

```sql
SELECT COUNT(*) AS paid_bookings,
       COALESCE(SUM(estimated_cost_rs), 0) AS revenue_aud
FROM bookings
WHERE status = 'completed' OR payment_status = 'paid';
```

Technicians by city coverage:

```sql
SELECT id, name, status, rating, completed_jobs, active_areas
FROM technicians
ORDER BY rating DESC;
```

Bookings grouped by status:

```sql
SELECT status, COUNT(*) AS total
FROM bookings
GROUP BY status
ORDER BY total DESC;
```

---

## 7. Reset demo data (destructive)

Only if you want a clean database. This removes all bookings/users/data:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then re-run `schema.sql` and `seed.sql`.
