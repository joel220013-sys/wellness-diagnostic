# Wellness Diagnostic — Production Healthcare Blood Collection Platform

A complete, production-oriented healthcare diagnostic and blood collection platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Lucide React**, **Leaflet Maps**, and **Supabase (PostgreSQL, Auth, Storage & RLS)**.

Designed following the **Wellness Diagnostic** brand design system with Botanical Green (`#08784E`), Dark Green (`#18352E`), Warm Peach (`#F6B58D`), Ivory (`#FFF9F2`), and White surfaces (`#FFFFFF`).

---

## 🌟 Key Architecture & Capabilities

### 1. Mandatory Entry Portal Selection (`/`)
- Opening the root URL (`/`) immediately presents the **Choose Your Access Portal** entry gateway before the landing page or any dashboard.
- Three dedicated role-protected portals:
  1. **Patient Portal** (`/patient/login`): Book blood tests, schedule home collection, track phlebotomist dispatch, access digital pathology reports, and download itemized tax invoices.
  2. **Admin Portal** (`/admin/login`): Dispatch collections, monitor live city-wide collection map, manage test packages and prices, register staff, upload & sign lab reports, and manage billing.
  3. **Driver / Phlebotomist Portal** (`/driver/login`): Mobile-first field route console, patient contact, directions link, barcode vial scanning, cold-chain temperature verification, and collection completion logging.
- The public website and marketing pages are available at `/home`.

### 2. Full-Stack Next.js App Router Structure
- **Frontend**: Next.js App Router, React 19, TypeScript strict mode, Tailwind CSS, shadcn/ui aesthetic, Recharts, and Leaflet.
- **Backend**: Next.js Route Handlers under `src/app/api/` with Zod validation, role authorization, and centralized error handling.
- **No external server**: Strictly Next.js for both client and API route handlers.
- **Pricing & Currency**: Indian Rupee (`₹` INR) with authoritative server-side calculation (Free home collection on orders ≥ ₹999, else ₹150; 10% multi-test bundle discount).

---

## 🔑 Portal Access & Accounts

| Portal | Role | Description |
| :--- | :--- | :--- |
| **Patient Portal** | `patient` | Patient appointments, live dispatch tracking, test catalogs & verified lab reports |
| **Admin Portal** | `admin` | Laboratory management, order dispatching, driver assignments & diagnostics catalog |
| **Driver Portal** | `driver` | Phlebotomist route schedule, home sample collection workflows & cold-chain logging |

---

## 📁 Suggested & Implemented File Structure

```text
wellness-diagnostic/
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # Portal Selection gateway
│   │   ├── globals.css
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   ├── (auth)/
│   │   │   ├── portal/page.tsx
│   │   │   ├── patient/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   └── forgot-password/page.tsx
│   │   │   ├── admin/login/page.tsx
│   │   │   └── driver/login/page.tsx
│   │   ├── (public)/
│   │   │   ├── home/page.tsx
│   │   │   ├── tests/page.tsx
│   │   │   ├── tests/[id]/page.tsx
│   │   │   ├── packages/page.tsx
│   │   │   ├── home-collection/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   └── contact/page.tsx
│   │   ├── (patient)/
│   │   │   └── patient/
│   │   │       ├── layout.tsx
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── book/page.tsx
│   │   │       ├── bookings/page.tsx
│   │   │       ├── bookings/[id]/page.tsx
│   │   │       ├── reports/page.tsx
│   │   │       ├── invoices/page.tsx
│   │   │       ├── addresses/page.tsx
│   │   │       └── profile/page.tsx
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── layout.tsx
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── orders/page.tsx
│   │   │       ├── orders/[id]/page.tsx
│   │   │       ├── map/page.tsx
│   │   │       ├── patients/page.tsx
│   │   │       ├── tests/page.tsx
│   │   │       ├── packages/page.tsx
│   │   │       ├── drivers/page.tsx
│   │   │       ├── assignments/page.tsx
│   │   │       ├── reports/page.tsx
│   │   │       ├── invoices/page.tsx
│   │   │       └── settings/page.tsx
│   │   ├── (driver)/
│   │   │   └── driver/
│   │   │       ├── layout.tsx
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── assignments/page.tsx
│   │   │       ├── assignments/[id]/page.tsx
│   │   │       ├── history/page.tsx
│   │   │       └── profile/page.tsx
│   │   └── api/
│   │       ├── tests/route.ts
│   │       ├── tests/[id]/route.ts
│   │       ├── packages/route.ts
│   │       ├── packages/[id]/route.ts
│   │       ├── addresses/route.ts
│   │       ├── addresses/[id]/route.ts
│   │       ├── geocode/search/route.ts
│   │       ├── geocode/reverse/route.ts
│   │       ├── bookings/route.ts
│   │       ├── bookings/[id]/route.ts
│   │       ├── bookings/[id]/cancel/route.ts
│   │       ├── bookings/[id]/events/route.ts
│   │       ├── admin/orders/route.ts
│   │       ├── admin/orders/[id]/route.ts
│   │       ├── admin/assignments/route.ts
│   │       ├── driver/assignments/route.ts
│   │       ├── driver/assignments/[id]/route.ts
│   │       ├── driver/assignments/[id]/start/route.ts
│   │       ├── driver/assignments/[id]/complete/route.ts
│   │       ├── driver/assignments/[id]/fail/route.ts
│   │       ├── driver/history/route.ts
│   │       ├── reports/route.ts
│   │       └── invoices/route.ts
│   ├── components/
│   ├── lib/
│   ├── context/
│   └── services/
├── supabase/
│   ├── migrations/
│   │   ├── 001_profiles.sql
│   │   ├── 002_patient_addresses.sql
│   │   ├── 003_tests_and_packages.sql
│   │   ├── 004_bookings.sql
│   │   ├── 005_assignments_and_events.sql
│   │   ├── 006_reports_and_invoices.sql
│   │   └── 007_rls_policies.sql
│   ├── seed.sql
│   └── config.toml
├── tests/
│   ├── auth.test.ts
│   ├── authorization.test.ts
│   ├── booking.test.ts
│   ├── address.test.ts
│   └── invoice.test.ts
├── .env.example
├── middleware.ts
└── README.md
```

---

## 🗄️ Supabase Migrations & Database Setup

The database schema and Row Level Security (RLS) policies are divided into sequential modular migrations:

1. `001_profiles.sql`: User profiles and `user_role` enum (`patient`, `admin`, `driver`).
2. `002_patient_addresses.sql`: Verified patient collection addresses with numeric coordinates.
3. `003_tests_and_packages.sql`: Diagnostic test catalog and bundled health packages.
4. `004_bookings.sql`: Bookings, line items, and immutable address snapshots.
5. `005_assignments_and_events.sql`: Phlebotomist collection dispatch and audit logs.
6. `006_reports_and_invoices.sql`: Pathology reports, itemized invoices, and system audit trails.
7. `007_rls_policies.sql`: Mandatory Row Level Security policies enforcing data isolation.
8. `seed.sql`: Demonstration catalog data in INR (₹) without real patient PII.

---

## 🧪 Testing

Automated test suites covering core business logic and authorization:

```bash
# Run tests
npm test
```

Suites:
- `tests/auth.test.ts`: Role validation and helper functions.
- `tests/authorization.test.ts`: Role-based access control and unauthorized request blocking.
- `tests/booking.test.ts`: Booking Zod schema validation and GPS coordinate requirements.
- `tests/address.test.ts`: Coordinate validation safeguards.
- `tests/invoice.test.ts`: Authoritative INR pricing, collection fees, and bundle discounts.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the portal selection entry gateway.
