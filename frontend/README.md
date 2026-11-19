# Moon Mobile Repair

Moon Mobile Repair is a demo booking app for an on-demand phone and laptop repair
service across Australia. Customers can pick a device, describe the problem, choose a
service type and time slot, and create a booking. The project also includes a
customer dashboard, an admin console, technician tracking, and a Fastify +
PostgreSQL API. Prices and payments are in Australian dollars (AUD), with
service coverage across every Australian state and territory.

The frontend is React 19, Vite, TypeScript, and Tailwind CSS v4. The backend is
Fastify, `pg`, and PostgreSQL.

## Requirements

- Node.js 20 or newer
- PostgreSQL running locally (or somewhere reachable)
- npm

## Getting started

Install dependencies from the repository root:

```bash
cd frontend && npm install
cd ../backend && npm install
```

### 1. Create the database

Create a database called `moon_mobile_repair`. You can do this in pgAdmin or
from `psql`:

```sql
CREATE DATABASE moon_mobile_repair;
```

The full pgAdmin walkthrough, including schema/seed instructions and verification
queries, is in [`backend/DATABASE_SETUP.md`](../backend/DATABASE_SETUP.md).

### 2. Configure the backend

Create `backend/.env`. You can use either a connection string:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5433/moon_mobile_repair
```

or separate values:

```env
DB_NAME=moon_mobile_repair
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5433
```

Then add the server settings:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=replace-this-with-a-long-random-string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
RUN_MIGRATIONS=true
APP_URL=http://localhost:3000
```

`JWT_SECRET` is mandatory in production and must be at least 32 random
characters. Add these optional integrations when you want real delivery:

```env
RESEND_API_KEY=
NOTIFICATION_EMAIL_FROM="Moon Mobile Repair <bookings@yourdomain.com>"
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

If both `DATABASE_URL` and the `DB_*` values are present, `DATABASE_URL` wins.
Make sure the port, database name, and credentials match the database you use in
pgAdmin.

### 3. Load the schema and seed data

```bash
cd backend
npm run migrate
```

The command prints the database it connected to. You should see something like:

```text
Connected to PostgreSQL at localhost:5433/moon_mobile_repair (user: postgres)
Schema and seed data applied successfully
```

The API also runs migrations at startup when `RUN_MIGRATIONS=true`.

### 4. Run both apps

In one terminal:

```bash
cd backend
npm run dev
```

In another:

```bash
cd frontend
npm run dev
```

The frontend runs at http://localhost:3000. Vite proxies `/api` requests to the
backend at http://localhost:3001.

## Demo accounts

| Role     | Email                         | Password |
| -------- | ----------------------------- | -------- |
| Admin    | `admin@moonmobilerepair.com`  | `admin123` |
| Customer | `anishshrestha2007@gmail.com` | `demo123` |

Registration creates customer accounts. Admin accounts are managed through the
database or by an existing admin.

## Scripts

Frontend, run from `frontend/`:

- `npm run dev` starts Vite on port 3000
- `npm run build` creates a production build
- `npm run preview` previews the build
- `npm test` runs the Vitest suite once
- `npm run test:watch` runs Vitest in watch mode
- `npm run typecheck` runs `tsc --noEmit`
- `npm run lint` runs TypeScript and ESLint
- `npm run format` runs Prettier

Backend, run from `backend/`:

- `npm run dev` starts the API with `tsx watch`
- `npm run start` starts the API once
- `npm run build` compiles TypeScript
- `npm run typecheck` checks TypeScript without emitting
- `npm run migrate` applies `schema.sql` and `seed.sql`
- `npm test` runs the security/schema tests and TypeScript check

## API overview

All routes are under `/api`.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/users/register` | Create a customer account |
| POST | `/users/login` | Sign in and receive a JWT |
| POST | `/users/forgot-password` | Request a password reset link |
| POST | `/users/reset-password` | Complete a password reset |
| GET | `/users/me` | Current user profile |
| PUT | `/users/me` | Update name, phone, or avatar |
| GET | `/technicians` | List technicians |
| GET | `/technicians/:id` | Technician details |
| POST | `/technicians` | Create a technician (admin) |
| PATCH | `/technicians/:id` | Update a technician (admin) |
| GET | `/services` | List service categories |
| POST | `/services` | Create a service (admin) |
| PATCH | `/services/:slug` | Update a service (admin) |
| DELETE | `/services/:slug` | Delete a service (admin) |
| POST | `/bookings` | Create a booking (JWT required) |
| GET | `/bookings` | List bookings for the current user or all bookings for admins |
| GET | `/bookings/:reference` | Booking details |
| PATCH | `/bookings/:reference/status` | Update booking status |
| PATCH | `/bookings/:reference/assign` | Assign a technician (admin) |
| PATCH | `/bookings/:reference/payment` | Mark a booking paid (admin) |
| GET | `/bookings/stats/summary` | Admin dashboard totals |
| GET | `/bookings/export.csv` | Export bookings as CSV (admin) |
| GET | `/service-areas` | Service area catalog |
| GET | `/devices` | Device catalog |
| GET | `/reviews` | Customer reviews |
| POST | `/contact` | Submit a support message |
| GET | `/contact` | List support messages (admin) |
| PATCH | `/contact/:id/read` | Mark a support message read (admin) |
| DELETE | `/contact/:id` | Delete a support message (admin) |

## Project layout

```text
frontend/
  src/
    App.tsx                 Routes, auth guards, providers
    pages/                  Login, register, support, legal, 404
    components/             Booking flow, dashboards, tracking, navbar, footer
    context/                Auth, repair state, theme
    hooks/                  Toast helpers
    data/                   Australia-localized demo data
    lib/api.ts              API client and token handling
    validations/            Booking form schema

backend/
  src/
    index.ts                Fastify setup, CORS, health check
    routes/                 Users, technicians, services, bookings, catalog
    db.ts                   Connection pool, migrations, transaction helper
    auth.ts                 JWT and password helpers
    schemas.ts              Zod request validation
  database/
    schema.sql              Tables, indexes, triggers, legacy upgrades
    seed.sql                Demo users, technicians, services, areas, devices, reviews
  DATABASE_SETUP.md         pgAdmin setup guide
```

## Production deployment

A Docker Compose setup is included:

```bash
cp .env.docker.example .env
# Edit .env and set JWT_SECRET + APP_ORIGIN
docker compose up --build
```

The app is served at http://localhost:8080 with nginx proxying `/api` to the
backend. PostgreSQL data is stored in the `db_data` volume.

## Notes and limitations

- Bookings are stored in localStorage first and synced to the API when it is
  reachable. If the API is down, the demo still works locally.
- Technician tracking uses real booking statuses, but the map pins and ETA are
  still simulated. A live GPS feed needs a technician app or location provider.
- Email and SMS notifications use Resend and Twilio when configured. Without
  credentials, delivery is skipped and the API continues normally.
- Payment selection is recorded on the booking, but no card gateway is connected.
- The repair catalog and technician list are seeded demo data. Prices and
  availability are not connected to a third-party inventory or payment provider.
- The theme context is still in the codebase, but the app is currently designed
  around the light theme.
- `npm run build` may warn about a JavaScript chunk larger than 500 kB. The build
  still succeeds; route-level code splitting would be the next step if bundle
  size becomes important.
