"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    const fd = new FormData(event.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const username = String(fd.get("username") ?? "");

    try {
      if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      router.push("/library");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const oauth = async (provider: "google" | "github") => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/library`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-zinc-900/80 p-6">
      <h1 className="text-2xl font-semibold text-amber-100">{mode === "sign-up" ? "Create account" : "Sign in"}</h1>
      {mode === "sign-up" && (
        <input
          name="username"
          required
          placeholder="Username"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-amber-300"
        />
      )}
      <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-amber-300" />
      <input name="password" type="password" required minLength={8} placeholder="Password" className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 outline-none focus:border-amber-300" />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button disabled={loading} className="w-full rounded-lg bg-amber-300 px-4 py-2 font-medium text-zinc-900 hover:bg-amber-200 disabled:opacity-70">
        {loading ? "Please wait…" : mode === "sign-up" ? "Sign up" : "Sign in"}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => oauth("google")} className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-100 hover:border-zinc-400">Google</button>
        <button type="button" onClick={() => oauth("github")} className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-100 hover:border-zinc-400">GitHub</button>
      </div>

      <p className="text-sm text-zinc-400">
        {mode === "sign-up" ? "Already have an account?" : "No account yet?"}{" "}
        <Link href={mode === "sign-up" ? "/sign-in" : "/sign-up"} className="text-amber-300 hover:underline">
          {mode === "sign-up" ? "Sign in" : "Create one"}
        </Link>
      </p>
    </form>
  );
}
