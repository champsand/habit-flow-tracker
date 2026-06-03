import type { ReactNode } from "react";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen overflow-x-hidden bg-background text-slate-100">
        <Sidebar />
        <main className="min-h-screen pb-32 lg:pl-72 lg:pb-0">
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">{children}</div>
        </main>
        <MobileNav />
      </div>
    </ProtectedRoute>
  );
}
