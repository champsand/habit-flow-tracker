"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { AppLogo } from "@/components/layout/AppLogo";
import { navItems } from "@/components/layout/nav-items";
import { habitLogsApi } from "@/lib/api/habitLogs";
import { getRecentDateRange, normalizeDateString, todayDateString, toDateInputValue } from "@/lib/date-utils";
import { getCurrentActivityStreak } from "@/lib/streak-utils";
import type { HabitLog } from "@/types";

export function Sidebar() {
  const pathname = usePathname();
  const [logs, setLogs] = useState<HabitLog[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadStreakLogs() {
      try {
        const range = getRecentDateRange(90);
        const nextLogs = await habitLogsApi.getHabitLogs(range);
        if (isMounted) setLogs(nextLogs);
      } catch {
        if (isMounted) setLogs([]);
      }
    }

    void loadStreakLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const streak = getCurrentActivityStreak(logs);
  const streakStrip = buildStreakStrip(logs);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-800 bg-slate-950 px-5 py-6 lg:block">
      <AppLogo />

      <nav className="mt-10 grid gap-1.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition ${
                active
                  ? "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/15"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
              }`}
              href={item.href}
              key={item.href}
            >
              <Icon className="h-5 w-5" name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-6 left-5 right-5 rounded-3xl border border-emerald-400/15 bg-slate-900/75 p-4 shadow-soft shadow-emerald-950/10">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
            <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path
                d="M12.5 3.2c1.7 2.2 4.4 4.9 4.4 8.4a4.9 4.9 0 0 1-9.8 0c0-2.4 1.2-4.1 2.8-5.8.2 1.5.8 2.5 1.8 3.3 1-1.6 1.1-3.5.8-5.9Z"
                fill="currentColor"
                opacity="0.95"
              />
              <path
                d="M10.2 13.4c0-1.2.7-2.2 1.8-3.2 1.1 1 1.8 2 1.8 3.2a1.8 1.8 0 1 1-3.6 0Z"
                fill="#22d3ee"
                opacity="0.9"
              />
            </svg>
          </span>
          <div>
            <p className="text-2xl font-semibold tracking-tight text-white">{streak}</p>
            <p className="text-xs font-medium text-slate-400">active days in a row</p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {streak > 0 ? "Habit activity is keeping this streak alive." : "Log activity today to start a streak."}
        </p>
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {streakStrip.map((day) => (
            <div className="grid gap-1 text-center" key={day.date}>
              <span
                className={`mx-auto h-2.5 w-2.5 rounded-full ring-offset-2 ring-offset-slate-900 ${
                  day.status === "active"
                    ? "bg-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.55)]"
                    : day.status === "missed"
                      ? "bg-rose-400/45"
                      : "bg-slate-700"
                } ${day.isToday ? "ring-2 ring-cyan-300/70" : ""}`}
                title={`${day.label}: ${day.status}`}
              />
              <span className={`text-[10px] font-medium ${day.isToday ? "text-cyan-200" : "text-slate-600"}`}>
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

type StreakDayStatus = "active" | "missed" | "future";

function buildStreakStrip(logs: HabitLog[]) {
  const today = todayDateString();
  const activeDates = new Set(
    logs
      .filter((log) => log.amount > 0)
      .map((log) => normalizeDateString(log.date))
      .filter((date) => date && date <= today)
  );
  const baseDate = new Date(`${today}T00:00:00`);

  return Array.from({ length: 7 }, (_, index) => {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + index - 4);
    const date = toDateInputValue(currentDate);
    const isFuture = date > today;
    const isToday = date === today;
    const status: StreakDayStatus = isFuture ? "future" : activeDates.has(date) ? "active" : "missed";

    return {
      date,
      isToday,
      label: String(currentDate.getDate()),
      status
    };
  });
}
