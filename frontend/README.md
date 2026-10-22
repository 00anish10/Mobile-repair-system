# Moon Mobile Repair - Express Mobile & Tech Repair

A modern mobile repair service application built with React 19, Vite 6, and TailwindCSS v4. Book fast, on-demand device repairs with certified technicians serving Nepal.

## 📱 Live Demo

Visit your deployed application at the project URL.

## 🏗️ Project Structure

```
moon-mobile-repair/
├── frontend/          # React + Vite Client
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── App.tsx          # Main app with React Router & protected routes
│   │   ├── pages/           # Login, Register, Home, NotFound, Terms, Privacy
│   │   ├── components/      # BookingModal (split into 7 components), Navbar, Hero, etc.
│   │   ├── context/         # AuthContext, RepairContext, ThemeContext
│   │   ├── hooks/           # useToast
│   │   └── data/           # Nepal-localized mock data
│   └── dist/               # Production build output
│
├── backend/            # Node.js Fastify + PostgreSQL API
│   ├── package.json
│   ├── src/index.ts        # API routes (users, technicians, bookings)
│   └── .env               # DATABASE_URL configuration
```

## ✨ Features

### Customer Features
- **Dedicated Login & Register Pages** `/login` and `/register` with role selection
- **Fast 2-minute booking flow** - 7 step guided process
- **Device Brand & Model Selection** - Apple, Samsung, Google Pixel, etc.
- **Repair Issue Selection** - Screen replacement, battery water damage, software issues
- **Service Type** - Home, Office, Pickup & Delivery, or Workshop
- **Location Selection** - Kathmandu, Lalitpur, Bhaktapur, Pokhara, Chitwan & more
- **Scheduling** - Choose date & time slots with express options
- **Customer Details** - Name, phone, email & payment preference
- **Booking Confirmation** - Unique booking ID with technician assignment
- **Live Technician Tracking** - Track your repair status in real-time
- **Dark Mode** - Persists in localStorage across sessions
- **Responsive Design** - Works mobile and desktop

### Technical Features
- **React Router 7** with PublicRoute and ProtectedRoute guards
- **Error Boundary** - Graceful error handling (not blank white screens)
- **Toast Notifications** - sonner replaces all alert() calls
- **Skeleton Loaders** - While content async loads
- **TypeScript** - Strict typing across all components
- **ESLint + Prettier** - Code quality and formatting
- **Nepal Localization** - All cities, +977 phone format, Rs. currency
- **Theme Context** - Light/dark mode with persistence

### Backend API (Fastify + PostgreSQL)
- **User Authentication** - Register & login endpoints
- **Technician Management** - Get all technicians with specialties
- **Booking CRUD** - Create, read, update booking status
- **Service Areas** - Kathmandu Valley, Pokhara, Chitwan, Biratnagar, Butwal
- **Device Catalog** - iPhone, Samsung, iPad, Google Pixel models
- **Database** - PostgreSQL with proper schema & foreign keys

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ or Bun
- PostgreSQL database (moon_mobile_repair)

### 1. Clone & Install

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### 2. Environment Configuration

**Frontend** (`frontend/.env` - optional, defaults included):
```env
# Vite will proxy /api → http://localhost:3001
# No DATABASE_URL needed on frontend
```

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql://postgres@localhost:5432/moon_mobile_repair
PORT=3001
NODE_ENV=development
APP_URL=http://localhost:5173
```

### 3. Database Setup

The backend auto-creates tables on first run. Or run manually:

```bash
cd backend
npx tsx src/index.ts
# Or psql: CREATE DATABASE moon_mobile_repair;
```

### 4. Run Development

```bash
# Start backend (port 3001)
cd backend
npx tsx src/index.ts

# Start frontend (port 3000, proxies /api to 3001)
cd frontend
npm run dev
```

Open http://localhost:3000 to view the app.

### 5. Build for Production

```bash
cd frontend
npm run build  # Creates dist/ (532 kB gzipped)
```

## 📦 Available Scripts

### Frontend (`frontend/package.json`)
- `npm run dev` - Start development server (Vite, proxy /api → 3001)
- `npm run build` - Build for production (Vite)
- `npm run lint` - TypeScript + ESLint check
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Prettier format all source files

### Backend (`backend/package.json`)
- `npm run test` - Test script (placeholder)
- Manual: `npx tsx src/index.ts` starts the Fastify server

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **Vite 6** - Fast HMR and dev server
- **TailwindCSS v4** - Utility-first CSS styling
- **React Router 7** - Routing with route guards
- **Lucide React** - Beautiful icon set
- **Sonner** - Toast notification system
- **TypeScript** - Full type safety
- **ESLint + Prettier** - Code quality

### Backend
- **Fastify** - Fast, low-overhead web framework
- **PostgreSQL** - Relational database
- **pg** - PostgreSQL client for Node.js
- **dotenv** - Environment variable loading

### Data & Localization
- **Nepal-focused** - All service areas are Nepal cities
- **Phone Format** - +977 (Nepal country code)
- **Currency** - Rs. (Nepalese Rupee)
- **Mock Data** - Seed data for technicians, services, devices

## 📁 Project Layout

```
frontend/
├── src/
│   ├── App.tsx              # Router: /, /login, /register, /track, /dashboard, /admin
│   ├── pages/               # LoginPage, RegisterPage, NotFound, TermsOfService, PrivacyPolicy
│   ├── components/          # Navbar, Hero, DeviceBrandSelector, ProblemSelection,
│   │                         # ServiceTypeSelector, ServiceLocation, Scheduling,
│   │                         # CustomerDetails, BookingConfirmation, ErrorBoundary,
│   │                         # SkeletonLoader, MoonLogo
│   ├── context/             # AuthContext (demo credentials), RepairContext,
│   │                         # ThemeContext (dark mode toggle)
│   ├── hooks/               # useToast (sonner)
│   ├── data/                # mockData.ts (POPULAR_BRANDS, REPAIR_ISSUES,
│                           # SERVICE_AREAS, TESTIMONIALS, FAQ_LIST)
│   └── types.ts             # DeviceType, ServiceType, Booking, Technician types
├── vite.config.ts           # Proxy: /api → http://localhost:3001
├── tailwind.config.js       # Tailwind v4 config
└── package.json

backend/
├── src/index.ts             # Fastify server, API routes, DB setup
├── .env                     # DATABASE_URL=postgresql://postgres@localhost:5432/moon_mobile_repair
├── package.json             # fastify, pg, dotenv dependencies
└── dist/                    # Production build (if built)
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET /api/technicians` | Get all technicians |
| `GET /api/technicians/:id` | Get technician by ID |
| `POST /api/users/register` | Register new user |
| `POST /api/users/login` | Login with demo credentials |
| `GET /api/bookings` | Get all bookings |
| `POST /api/bookings` | Create new booking |
| `PUT /api/bookings/:id/status` | Update booking status |

**Demo Credentials** (from AuthContext):
- **Customer**: `anishshrestha2007@gmail.com` / `password123`
- **Role selector**: Customer or Admin

## 🎯 Key Pages

### `/login` - Login Page
- Role selector (Customer / Admin)
- Demo credentials displayed
- Redirects to home after login

### `/register` - Register Page
- Form with name, email, password, terms checkbox
- Password strength meter
- Validates terms acceptance

### `/` / `home` - Homepage
- Hero section with value proposition
- Device brand selector
- Repair issue picker
- Service type choice (home/office/pickup/workshop)
- Location input (Nepal cities)
- Scheduling (date & time slots)
- Customer details form
- Booking confirmation

### `/track` - Technician Tracking
- View repair status
- Live location simulation

### `/dashboard` - Customer Dashboard
- View all bookings
- Filter by status
- Detailed booking information

### `/admin` - Admin Dashboard (Protected)
- View all bookings
- Technician management
- Analytics overview

## 📦 Build Output

```
frontend/dist/
├── index.html          # 1.39 kB
├── assets/index-BRREL_TF.css   # 61.94 kB gzipped
└── assets/index-f8z7oUmf.js   # 534.02 kB gzipped

backend/                # Runs independently on port 3001
```

## 📬 Need Help?

- Check the [Issues](https://github.com/your-org/moon-mobile-repair/issues) tab
- Review the [TypeScript errors](#-lint-errors-note) section above
- Ensure both frontend and backend are running simultaneously

## 🙏 Acknowledgments

- Nepal service areas and phone format localization
- React 19 and Vite 6 for performance
- Fastify for the API backend
- TailwindCSS v4 for styling
- Sonner for beautiful toast notifications
- Lucide for clean icons