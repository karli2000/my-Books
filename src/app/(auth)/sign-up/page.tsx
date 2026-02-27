import { AuthForm } from "@/components/auth-form";

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-950 p-6 text-zinc-100">
      <AuthForm mode="sign-up" />
    </main>
  );
}
