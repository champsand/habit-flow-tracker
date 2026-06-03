"use client";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/components/providers/AuthProvider";

export function UserProfileCard() {
  const { user } = useAuth();

  return (
    <Card as="aside" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/25 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 shadow-[0_0_34px_rgba(16,185,129,0.12)]">
          <Icon className="h-7 w-7" name="user" />
        </div>
        <Badge tone="emerald">Active account</Badge>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account overview</p>
        <h2 className="mt-3 break-words text-2xl font-semibold leading-tight text-white">{user?.name ?? "Habit Flow user"}</h2>
        <p className="mt-2 break-words text-sm leading-6 text-slate-400">{user?.email ?? "Authenticated account"}</p>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
        <p className="text-sm font-medium text-slate-200">Session</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Logout clears your local session and returns you to the sign-in page.</p>
      </div>
      <LogoutButton />
    </Card>
  );
}
