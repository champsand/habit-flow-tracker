"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/components/providers/AuthProvider";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { hasCheckedAuth, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && hasCheckedAuth && !isAuthenticated) {
      const loginPath = `/login?next=${encodeURIComponent(pathname)}`;
      router.replace(loginPath);
    }
  }, [hasCheckedAuth, isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <LoadingState />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 text-sm text-slate-400">
        Redirecting to login...
      </div>
    );
  }

  return <>{children}</>;
}
