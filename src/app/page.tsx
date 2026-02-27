import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <p className="mb-4 inline-block w-fit rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
          BookSnap Archive
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
          Photograph your shelves. Auto-detect books. Build a searchable personal library.
        </h1>
        <p className="mt-5 max-w-2xl text-zinc-300">
          A moody bookshelf-inspired app using Next.js 16, Tailwind, Supabase Auth, and Supabase Postgres.
          Snap book spines or covers and let OCR fill title + author before saving.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/sign-up" className="rounded-lg bg-amber-300 px-5 py-3 font-medium text-zinc-900 hover:bg-amber-200">
            Get started
          </Link>
          <Link href="/sign-in" className="rounded-lg border border-zinc-500 px-5 py-3 text-zinc-100 hover:border-zinc-300">
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
