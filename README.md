# BeautyOS / Beauty Passport

Personalization-first beauty commerce for Iran.

The product is not a classic marketplace with banners, categories, and discounts.
The core promise is:

> Help people avoid buying the wrong beauty product.

## MVP Focus

The first version focuses on skincare decisions:

- Beauty Passport
- Shopping by Need
- Personal Match Score
- Similar-Me Reviews
- Routine Builder

The initial catalog should be small and high-quality: roughly 50 to 150 products with complete structured data.

## Tech Choice

- TypeScript
- Next.js App Router
- PostgreSQL
- Prisma
- Server-side recommendation rules
- RTL-first Persian UI

This keeps the MVP fast to build while leaving room to split services later if traffic or team size requires it.

## Project Status

This repository currently contains the foundation:

- Product brief
- Architecture notes
- Database design
- Initial Prisma schema
- Minimal Next.js application shell

## Local Setup

```bash
npm install
npm run db:generate
npm run dev
```

Create `.env` from `.env.example` before database commands.

