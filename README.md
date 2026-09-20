# SmartBill

A GST-ready, cross-platform billing and inventory MVP. It contains a Next.js web dashboard, a NestJS API, PostgreSQL/Prisma persistence, and an Expo mobile starter.

## Features

- Firm-based multi-tenant data isolation
- JWT authentication with seeded demo user
- Customers and product inventory
- Tax invoices with CGST/SGST or IGST calculation
- Stock reduction when invoices are issued
- Payment recording and outstanding balances
- Dashboard summary
- Android/iOS mobile dashboard starter

## Stack

- Web: Next.js 14, React, TypeScript, Tailwind CSS
- API: NestJS, Prisma, PostgreSQL, JWT, Swagger
- Mobile: Expo + React Native + Expo Router
- Shared: TypeScript GST calculation package

## Local setup

1. Install Node.js 20+, pnpm 9+, and Docker Desktop.
2. Copy `.env.example` to `.env`.
3. Start services:

```bash
docker compose up -d
```

4. Install dependencies:

```bash
pnpm install
```

5. Generate Prisma client, migrate and seed:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

6. Start web and API:

```bash
pnpm dev
```

- Web: http://localhost:3000
- Swagger: http://localhost:4000/api/docs
- API: http://localhost:4000/api

### Demo login

- Email: `owner@smartbill.local`
- Password: `SmartBill@123`

## Mobile

```bash
cd apps/mobile
cp .env.example .env
pnpm install
pnpm start
```

Open the QR code with Expo Go, or run an Android/iOS simulator. Update `EXPO_PUBLIC_API_URL` to your computer's LAN IP for a physical phone.

## Production notes

Before production, use managed PostgreSQL, HTTPS, a rotating JWT secret, rate limiting, audit trails, database backups, object storage for PDFs, an Indian payment provider, and compliance review for GST/e-invoice/e-way-bill integrations.
