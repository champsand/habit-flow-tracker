"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { navItems } from "@/components/layout/nav-items";

const mobileItems = navItems;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 px-2 pb-3 pt-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-6 gap-1">
        {mobileItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              aria-label={item.label}
              className={`grid min-h-14 place-items-center rounded-2xl px-1 text-[10px] font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-400/40 sm:text-[11px] ${
                active ? "bg-slate-800 text-emerald-300" : "text-slate-500 hover:text-slate-200"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-5 w-5" name={item.icon} />
              <span className="mt-1 line-clamp-1">{shortLabel(item.label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function shortLabel(label: string) {
  if (label === "Dashboard") return "Home";
  if (label === "Log Activity") return "Log";
  if (label === "Daily Check-in") return "Check";
  if (label === "Weekly Summary") return "Summary";
  return label;
}
