import type { IconName } from "@/components/ui/Icon";

export const navItems: Array<{ label: string; href: string; icon: IconName }> = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  { label: "Habits", href: "/habits", icon: "habits" },
  { label: "Log Activity", href: "/logs/new", icon: "log" },
  { label: "Daily Check-in", href: "/check-in", icon: "check" },
  { label: "Weekly Summary", href: "/weekly-summary", icon: "summary" },
  { label: "Settings", href: "/settings", icon: "settings" }
];
