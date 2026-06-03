"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    router.replace("/login");
  }

  return (
    <Button className="mt-6 w-full" disabled={isLoggingOut} onClick={handleLogout} type="button" variant="danger">
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  );
}
