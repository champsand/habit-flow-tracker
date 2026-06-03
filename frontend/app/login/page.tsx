import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { PublicOnly } from "@/components/auth/PublicOnly";

export default function LoginPage() {
  return (
    <PublicOnly>
      <AuthShell
        formSubtitle="Log in to continue your weekly rhythm, habit logs, and insight history."
        formTitle="Welcome back"
        visualCopy="Pick up where you left off with habits, check-ins, weekly progress, and AI guidance."
        visualTitle="Return to your weekly flow."
      >
        <LoginForm />

        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{" "}
          <Link className="font-medium text-emerald-300 hover:text-emerald-200" href="/register">
            Create an account
          </Link>
        </p>
      </AuthShell>
    </PublicOnly>
  );
}
