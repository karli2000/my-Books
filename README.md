# BookSnap Archive

A Next.js 16 app for photographing your physical books, auto-detecting metadata (title/author), and storing your personal library in Postgres/Supabase.

## Stack

- Next.js 16 (App Router)
- Tailwind CSS
- Better Auth (email/password sign up + sign in)
- Supabase Postgres (or any Postgres) + Drizzle ORM
- OCR via `tesseract.js`

## Features

- Sign up / sign in with Better Auth
- Camera capture in browser (`getUserMedia`)
- OCR extraction endpoint
- Parsed title + author + confidence
- Save scans to database
- Personal library view per user

## Setup

1. Install deps

```bash
npm install
```

2. Create env file

```bash
cp .env.example .env
```

3. Set env values in `.env`:

```env
BETTER_AUTH_SECRET=your-long-secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
SUPABASE_DB_URL=postgres://...
DATABASE_URL=postgres://...
```

4. Create/update schema

```bash
npm run db:generate
npm run db:push
```

5. Run

```bash
npm run dev
```

Open: `http://localhost:3000` (or the printed fallback port)

## Notes

- Plan is documented in `PLAN.md`.
- For local testing, you can use a local Postgres container and point `DATABASE_URL` to it.
