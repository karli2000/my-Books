import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ScanUploader } from "@/components/scan-uploader";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";

export default async function LibraryPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/sign-in");

  const myBooks = await db
    .select()
    .from(books)
    .where(eq(books.userId, session.user.id))
    .orderBy(desc(books.createdAt));

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">BookSnap Archive</p>
            <h1 className="text-3xl font-semibold">Welcome, {session.user.name}</h1>
            <p className="text-sm text-zinc-400">Scan and archive your personal collection.</p>
          </div>
          <SignOutButton />
        </header>

        <ScanUploader initialBooks={myBooks.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() }))} />
      </div>
    </main>
  );
}
