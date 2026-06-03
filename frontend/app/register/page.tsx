import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { PublicOnly } from "@/components/auth/PublicOnly";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <PublicOnly>
      <AuthShell
        formSubtitle="Create your private workspace for good habits, avoidance goals, check-ins, and weekly summaries."
        formTitle="Create your account"
        visualCopy="Start with one small target, log what matters, and let the week show your real progress."
        visualTitle="Start with a calmer weekly rhythm."
      >
        <RegisterForm />

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="font-medium text-emerald-300 hover:text-emerald-200" href="/login">
            Login
          </Link>
        </p>
      </AuthShell>
    </PublicOnly>
  );
}
