import Link from "next/link";
import { HabitTypeIcon } from "@/components/habits/HabitTypeIcon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { categoryLabel, habitProgressPercent, habitTypeLabel } from "@/lib/habit-utils";
import type { Habit } from "@/types";

interface HabitCardProps {
  habit: Habit;
  onRequestDelete?: () => void;
  showActions?: boolean;
}

export function HabitCard({
  habit,
  onRequestDelete,
  showActions = false
}: HabitCardProps) {
  const percent = habitProgressPercent(habit);
  const isBadHabit = habit.category === "bad";
  const typeLabel = isBadHabit ? "Avoidance" : habitTypeLabel(habit.type);
  const progressText = getProgressText(habit);
  const progressTone = getProgressTone(habit);
  const cardGlow = getCardGlow(habit);

  return (
    <article className="group relative isolate flex min-h-[190px] flex-col overflow-visible rounded-[24px] border border-slate-800/80 bg-slate-900/80 p-5 shadow-soft shadow-black/10 transition hover:-translate-y-0.5 hover:border-slate-700/90 hover:bg-slate-900 sm:p-6">
      <div className={`pointer-events-none absolute inset-0 rounded-[24px] opacity-70 ${cardGlow}`} />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <HabitTypeIcon habit={habit} />
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold leading-6 text-white">{habit.name}</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <HabitBadge tone={isBadHabit ? "rose" : "emerald"}>{categoryLabel(habit.category)}</HabitBadge>
              <HabitBadge tone="slate">{typeLabel}</HabitBadge>
              <HabitBadge tone={habit.isActive ? "cyan" : "slate"}>{habit.isActive ? "Active" : "Paused"}</HabitBadge>
            </div>
          </div>
        </div>

        {showActions ? (
          <details className="relative shrink-0">
            <summary className="grid h-8 w-8 cursor-pointer list-none place-items-center rounded-full border border-slate-800 bg-slate-950/60 text-slate-500 transition hover:border-slate-700 hover:bg-slate-900 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 [&::-webkit-details-marker]:hidden">
              <span className="sr-only">Habit actions</span>
              <svg aria-hidden="true" className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 16 16">
                <circle cx="3" cy="8" r="1.35" />
                <circle cx="8" cy="8" r="1.35" />
                <circle cx="13" cy="8" r="1.35" />
              </svg>
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-1 shadow-2xl shadow-black/40">
              <Link
                className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                href={`/habits/${habit.id}/edit`}
              >
                Edit habit
              </Link>
              <button
                className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-300 transition hover:bg-rose-400/10"
                onClick={onRequestDelete}
                type="button"
              >
                Delete habit
              </button>
            </div>
          </details>
        ) : null}
      </div>

      <div className="relative mt-auto pt-7">
        <div className="mb-2.5 flex items-center justify-between gap-4">
          <p className="truncate text-xs font-medium text-slate-400">{progressText}</p>
          <p className="text-sm font-semibold text-slate-100">{percent}%</p>
        </div>
        <div className="[&>div]:h-2">
          <ProgressBar tone={progressTone} value={percent} />
        </div>
      </div>

    </article>
  );
}

function HabitBadge({ children, tone }: { children: string; tone: "emerald" | "cyan" | "rose" | "slate" }) {
  const tones = {
    emerald: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
    rose: "border-rose-400/25 bg-rose-400/10 text-rose-300",
    slate: "border-slate-700/80 bg-slate-800/70 text-slate-300"
  };

  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-4 ${tones[tone]}`}>{children}</span>;
}

function getProgressText(habit: Habit): string {
  const current = habit.weeklyProgress ?? 0;
  if (habit.category === "bad") return `${current} / ${habit.weeklyTarget} avoidance days`;
  if (habit.type === "duration") return `${current} / ${habit.weeklyTarget} min`;
  if (habit.type === "frequency") return `${current} / ${habit.weeklyTarget} times`;
  return `${current} / ${habit.weeklyTarget} days`;
}

function getProgressTone(habit: Habit): "emerald" | "cyan" | "violet" | "rose" {
  if (habit.category === "bad") return "rose";
  if (habit.type === "duration") return "violet";
  if (habit.type === "frequency") return "cyan";
  return "emerald";
}

function getCardGlow(habit: Habit): string {
  if (habit.category === "bad") return "bg-[radial-gradient(circle_at_12%_14%,rgba(251,113,133,0.1),transparent_34%)]";
  if (habit.type === "duration") return "bg-[radial-gradient(circle_at_12%_14%,rgba(167,139,250,0.1),transparent_34%)]";
  if (habit.type === "frequency") return "bg-[radial-gradient(circle_at_12%_14%,rgba(34,211,238,0.1),transparent_34%)]";
  return "bg-[radial-gradient(circle_at_12%_14%,rgba(52,211,153,0.1),transparent_34%)]";
}
