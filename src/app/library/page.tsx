"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScanUploader } from "@/components/scan-uploader";
import { SignOutButton } from "@/components/sign-out-button";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Book = {
  id: string;
  title: string;
  author: string;
  confidence: number;
  createdAt: string;
  isbn?: string | null;
  publisher?: string | null;
  coverUrl?: string | null;
};

export default function LibraryPage() {
  const router = useRouter();
  const [name, setName] = useState("Reader");
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        router.push("/sign-in");
        return;
      }
      setName((user.user_metadata?.username as string) || user.email || "Reader");

      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const res = await fetch("/api/books", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const payload = await res.json();
        setBooks(payload.books ?? []);
      }
    };

    run();
  }, [router]);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">BookSnap Archive</p>
            <h1 className="text-3xl font-semibold">Welcome, {name}</h1>
            <p className="text-sm text-zinc-400">Scan and archive your personal collection.</p>
          </div>
          <SignOutButton />
        </header>

        <ScanUploader initialBooks={books} />
      </div>
    </main>
  );
}
