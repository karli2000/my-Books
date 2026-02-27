"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        router.push("/");
        router.refresh();
      }}
      className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-200 hover:border-zinc-400"
    >
      Sign out
    </button>
  );
}
