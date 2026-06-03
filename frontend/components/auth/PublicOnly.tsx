"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export function PublicOnly({ children }: { children: ReactNode }) {
  const { hasCheckedAuth, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && hasCheckedAuth && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [hasCheckedAuth, isAuthenticated, isLoading, router]);

  if (!isLoading && hasCheckedAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
