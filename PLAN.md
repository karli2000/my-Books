# PLAN.md — BookSnap Archive

## Vision
Build **BookSnap Archive**: a Next.js 16 app where users can sign up/sign in, photograph books, auto-extract title/author metadata, and store everything in Supabase.

## Stack
- Next.js 16 (App Router)
- Tailwind CSS
- Better Auth (email/password)
- Supabase Postgres (auth + books storage)
- Drizzle ORM + postgres driver

## Milestones
1. **Project foundation**
   - Configure Next.js 16 app shell
   - Define design system and page layout
2. **Database layer**
   - Add Drizzle schema for Better Auth + books
   - Configure Supabase connection via env
3. **Auth layer**
   - Configure Better Auth server instance
   - Add `/api/auth/[...all]` handler
   - Add client auth helpers and sign-in/sign-up UI
4. **Book ingestion**
   - Camera/file capture UI
   - OCR extraction endpoint (initial local OCR parser)
   - Manual correction before save
5. **Library views**
   - Grid/list, search, filters, confidence badges
   - User-scoped queries
6. **Local testing & run**
   - Validate build/lint
   - Start local dev server and verify key routes
7. **Repository & handoff**
   - Commit/push to GitHub repo `my-Books`
   - Provide run port + setup notes

## Deliverables
- Working app code
- `PLAN.md` in repository
- `.env.example` with Supabase + Better Auth vars
- Local server running with verified port
