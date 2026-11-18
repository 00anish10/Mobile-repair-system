-- ============================================================================
-- Moon Mobile Repair - PostgreSQL schema
-- Run this in pgAdmin (Query Tool) against the `moon_mobile_repair` database.
-- Safe to run multiple times (idempotent).
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(40),
    role          VARCHAR(20) NOT NULL DEFAULT 'customer'
                  CHECK (role IN ('customer', 'admin', 'technician')),
    avatar        TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS technicians (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(120) NOT NULL,
    phone            VARCHAR(40),
    email            VARCHAR(255),
    specialty        VARCHAR(160),
    experience_years INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
    avatar           TEXT,
    rating           NUMERIC(3, 2) NOT NULL DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
    reviews_count    INTEGER NOT NULL DEFAULT 0,
    vehicle          VARCHAR(120),
    license_plate    VARCHAR(40),
    status           VARCHAR(20) NOT NULL DEFAULT 'available'
                     CHECK (status IN ('available', 'on_job', 'offline')),
    completed_jobs   INTEGER NOT NULL DEFAULT 0,
    specialties      JSONB NOT NULL DEFAULT '[]'::jsonb,
    active_areas     JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_areas (
    id                   SERIAL PRIMARY KEY,
    city                 VARCHAR(120) NOT NULL UNIQUE,
    state                VARCHAR(120) NOT NULL DEFAULT 'Australia',
    is_available         BOOLEAN NOT NULL DEFAULT TRUE,
    hubs                 JSONB NOT NULL DEFAULT '[]'::jsonb,
    response_time_minutes INTEGER NOT NULL DEFAULT 60,
    technicians_count    INTEGER NOT NULL DEFAULT 0,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS devices (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    category    VARCHAR(60) NOT NULL,
    description TEXT,
    image_url   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_categories (
    id               SERIAL PRIMARY KEY,
    slug             VARCHAR(120) NOT NULL UNIQUE,
    title            VARCHAR(160) NOT NULL,
    icon             VARCHAR(60) NOT NULL DEFAULT 'Smartphone',
    description      TEXT NOT NULL,
    starting_price_rs INTEGER NOT NULL DEFAULT 0 CHECK (starting_price_rs >= 0),
    warranty_text    VARCHAR(200) NOT NULL,
    popular_models   JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
    id                    SERIAL PRIMARY KEY,
    reference             VARCHAR(40) NOT NULL UNIQUE,
    user_id               INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer_name         VARCHAR(120) NOT NULL,
    customer_phone        VARCHAR(40) NOT NULL,
    customer_email        VARCHAR(255) NOT NULL,
    address               TEXT NOT NULL,
    city                  VARCHAR(120) NOT NULL,
    area                  VARCHAR(120) NOT NULL,
    landmark              VARCHAR(255),
    device_type           VARCHAR(50) NOT NULL DEFAULT 'other',
    brand                 VARCHAR(120) NOT NULL,
    model                 VARCHAR(160) NOT NULL,
    problem_id            VARCHAR(80) NOT NULL,
    problem_title         VARCHAR(160) NOT NULL,
    problem_description   TEXT,
    service_type          VARCHAR(20) NOT NULL DEFAULT 'home'
                          CHECK (service_type IN ('home', 'office', 'pickup', 'workshop')),
    scheduled_date        DATE NOT NULL,
    scheduled_time_slot   VARCHAR(80) NOT NULL,
    estimated_cost_rs     NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (estimated_cost_rs >= 0),
    status                VARCHAR(30) NOT NULL DEFAULT 'confirmed'
                          CHECK (status IN ('confirmed', 'technician_assigned',
                                            'technician_en_route', 'technician_arrived',
                                            'in_progress', 'completed', 'cancelled')),
    technician_id         INTEGER REFERENCES technicians(id) ON DELETE SET NULL,
    payment_method        VARCHAR(30) NOT NULL DEFAULT 'cash_on_delivery'
                          CHECK (payment_method IN ('cash_on_delivery', 'card',
                                                    'apple_pay', 'google_pay', 'paypal')),
    payment_status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                          CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    warranty_duration     VARCHAR(120),
    warranty_valid_until  DATE,
    technician_notes      TEXT,
    photo_urls            JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(120) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    subject    VARCHAR(160) NOT NULL,
    message    TEXT NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (    id            SERIAL PRIMARY KEY,
    booking_id    INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(120) NOT NULL,
    rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    device        VARCHAR(160),
    repair_type   VARCHAR(160),
    comment       TEXT,
    verified      BOOLEAN NOT NULL DEFAULT FALSE,
    location      VARCHAR(160),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Legacy upgrade (safe no-ops on a fresh database)
-- ============================================================================

-- Users: old schema used a plain `password` column.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(40);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'password'
    ) THEN
        CREATE EXTENSION IF NOT EXISTS pgcrypto;
        EXECUTE $sql$
            UPDATE users
            SET password_hash = crypt(password, gen_salt('bf', 12))
            WHERE password_hash IS NULL AND password IS NOT NULL
        $sql$;
        EXECUTE 'ALTER TABLE users DROP COLUMN password';
    END IF;
END $$;

-- Technicians: rename/expand legacy columns.
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS phone VARCHAR(40);
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS experience_years INTEGER NOT NULL DEFAULT 0;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS reviews_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS vehicle VARCHAR(120);
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS license_plate VARCHAR(40);
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'available';
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS completed_jobs INTEGER NOT NULL DEFAULT 0;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS specialties JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS active_areas JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE technicians ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'technicians' AND column_name = 'experience'
    ) THEN
        EXECUTE 'UPDATE technicians SET experience_years = COALESCE(experience, 0) WHERE experience_years = 0';
    END IF;
END $$;

-- Service areas: legacy `name`/`cities`/`is_active` => `city`/`hubs`/`is_available`.
ALTER TABLE service_areas ADD COLUMN IF NOT EXISTS city VARCHAR(120);
ALTER TABLE service_areas ADD COLUMN IF NOT EXISTS state VARCHAR(120) NOT NULL DEFAULT 'Australia';
ALTER TABLE service_areas ALTER COLUMN state SET DEFAULT 'Australia';
ALTER TABLE service_areas ADD COLUMN IF NOT EXISTS hubs JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE service_areas ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE service_areas ADD COLUMN IF NOT EXISTS response_time_minutes INTEGER NOT NULL DEFAULT 60;
ALTER TABLE service_areas ADD COLUMN IF NOT EXISTS technicians_count INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'service_areas' AND column_name = 'name'
    ) THEN
        EXECUTE 'UPDATE service_areas SET city = COALESCE(city, name) WHERE city IS NULL';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'service_areas' AND column_name = 'cities'
    ) THEN
        EXECUTE 'UPDATE service_areas SET hubs = cities WHERE hubs = ''[]''::jsonb';
        EXECUTE 'ALTER TABLE service_areas DROP COLUMN cities';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'service_areas' AND column_name = 'is_active'
    ) THEN
        EXECUTE 'UPDATE service_areas SET is_available = is_active';
        EXECUTE 'ALTER TABLE service_areas DROP COLUMN is_active';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'service_areas' AND column_name = 'name'
    ) THEN
        EXECUTE 'ALTER TABLE service_areas DROP COLUMN name';
    END IF;
END $$;

-- Bookings: legacy columns => richer booking model.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reference VARCHAR(40);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name VARCHAR(120) NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(40) NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS city VARCHAR(120) NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS area VARCHAR(120) NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS landmark VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS brand VARCHAR(120) NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS model VARCHAR(160) NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS problem_id VARCHAR(80) NOT NULL DEFAULT 'other';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS problem_title VARCHAR(160) NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS problem_description TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_type VARCHAR(20) NOT NULL DEFAULT 'home';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS scheduled_time_slot VARCHAR(80) NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_cost_rs NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS technician_id INTEGER;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) NOT NULL DEFAULT 'cash_on_delivery';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS warranty_duration VARCHAR(120);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS warranty_valid_until DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS technician_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS photo_urls JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'device_model'
    ) THEN
        EXECUTE 'UPDATE bookings SET model = device_model WHERE model = '''' AND device_model IS NOT NULL';
        EXECUTE 'ALTER TABLE bookings DROP COLUMN device_model';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'estimated_cost'
    ) THEN
        EXECUTE 'UPDATE bookings SET estimated_cost_rs = estimated_cost WHERE estimated_cost_rs = 0 AND estimated_cost IS NOT NULL';
        EXECUTE 'ALTER TABLE bookings DROP COLUMN estimated_cost';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'notes'
    ) THEN
        EXECUTE 'UPDATE bookings SET problem_description = notes WHERE problem_description IS NULL';
        EXECUTE 'ALTER TABLE bookings DROP COLUMN notes';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'assigned_technician_id'
    ) THEN
        EXECUTE 'UPDATE bookings SET technician_id = assigned_technician_id WHERE technician_id IS NULL';
        EXECUTE 'ALTER TABLE bookings DROP COLUMN assigned_technician_id';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'service_area'
    ) THEN
        EXECUTE 'UPDATE bookings SET city = service_area WHERE city = '''' AND service_area IS NOT NULL';
        EXECUTE 'ALTER TABLE bookings DROP COLUMN service_area';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'device_issue'
    ) THEN
        EXECUTE 'UPDATE bookings SET problem_title = device_issue WHERE problem_title = '''' AND device_issue IS NOT NULL';
        EXECUTE 'ALTER TABLE bookings DROP COLUMN device_issue';
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'priority'
    ) THEN
        EXECUTE 'ALTER TABLE bookings DROP COLUMN priority';
    END IF;
END $$;

-- Remove duplicate rows created by older seed-on-every-boot behaviour.
DELETE FROM service_areas a
USING service_areas b
WHERE a.city = b.city AND a.id > b.id;

DELETE FROM technicians a
USING technicians b
WHERE a.name = b.name
  AND a.id > b.id
  AND NOT EXISTS (SELECT 1 FROM bookings bk WHERE bk.technician_id = a.id);

UPDATE bookings
SET reference = 'REP-' || EXTRACT(YEAR FROM created_at)::int || '-' || LPAD(id::text, 5, '0')
WHERE reference IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_reference_unique ON bookings (reference);
CREATE UNIQUE INDEX IF NOT EXISTS idx_service_areas_city_unique ON service_areas (city);

CREATE SEQUENCE IF NOT EXISTS booking_reference_seq START WITH 125;

CREATE INDEX IF NOT EXISTS idx_users_email            ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_bookings_reference     ON bookings (reference);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id       ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status        ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled     ON bookings (scheduled_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings (LOWER(customer_email));
CREATE INDEX IF NOT EXISTS idx_service_categories_active ON service_categories (is_active) WHERE is_active = TRUE;

-- Keep updated_at fresh on updates
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_technicians_updated_at ON technicians;
CREATE TRIGGER trg_technicians_updated_at
    BEFORE UPDATE ON technicians
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON bookings;
CREATE TRIGGER trg_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_service_categories_updated_at ON service_categories;
CREATE TRIGGER trg_service_categories_updated_at
    BEFORE UPDATE ON service_categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
