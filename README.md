# BookSnap Archive

A Next.js 16 app for photographing your physical books, auto-detecting metadata (title/author), and storing your personal library in Postgres/Supabase.

## Stack

- Next.js 16 (App Router)
- Tailwind CSS
- Supabase Auth (email/password + Google + GitHub)
- Supabase Postgres (or any Postgres) + Drizzle ORM
- LLM vision extraction via Vercel AI SDK (`ai`) + OpenRouter

## Features

- Sign up / sign in with Supabase Auth (email/password)
- Camera capture in browser (`getUserMedia`)
- Multi-book detection from one image using LLM vision
- Parsed title + author + confidence per detected book
- Free metadata enrichment from OpenLibrary + Google Books (ISBN/publisher/year when available)
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
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_DB_URL=postgres://...
DATABASE_URL=postgres://...
OPENROUTER_API_KEY=...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
BOOKS_VISION_MODEL=qwen/qwen2.5-vl-7b-instruct
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
