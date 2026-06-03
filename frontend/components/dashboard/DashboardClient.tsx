"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HabitTypeIcon } from "@/components/habits/HabitTypeIcon";
import { useAuth } from "@/components/providers/AuthProvider";
import { WeeklyProgressChart } from "@/components/dashboard/WeeklyProgressChart";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Icon } from "@/components/ui/Icon";
import { LoadingState } from "@/components/ui/LoadingState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ApiClientError } from "@/lib/api/client";
import { checkinsApi } from "@/lib/api/checkins";
import { habitLogsApi } from "@/lib/api/habitLogs";
import { habitsApi } from "@/lib/api/habits";
import { weeklySummaryApi } from "@/lib/api/weeklySummary";
import { getRecentDateRange, normalizeDateString, todayDateString } from "@/lib/date-utils";
import { categoryLabel, habitProgressPercent, habitTypeLabel, habitUnitLabel } from "@/lib/habit-utils";
import { attachWeeklyProgress, filterLogsForWeek, getCurrentWeekRange } from "@/lib/progress-utils";
import { getCurrentActivityStreak } from "@/lib/streak-utils";
import type { DailyCheckIn, Habit, HabitLog, WeeklySummary } from "@/types";

export function DashboardClient() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [streakLogs, setStreakLogs] = useState<HabitLog[]>([]);
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleUnauthorized = useCallback(async () => {
    await logout();
    router.replace("/login");
  }, [logout, router]);
  const weekRange = useMemo(() => getCurrentWeekRange(), []);
  const streakRange = useMemo(() => getRecentDateRange(90), []);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextHabits = await habitsApi.getHabits();
      setHabits(nextHabits);
    } catch (requestError) {
      if (requestError instanceof ApiClientError && requestError.statusCode === 401) {
        await handleUnauthorized();
        return;
      }

      setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (isLoading || error) return;

    let isMounted = true;

    async function loadOptionalDashboardData() {
      const [logsResult, streakLogsResult, checkInResult, summaryResult] = await Promise.allSettled([
        habitLogsApi.getHabitLogs({ startDate: weekRange.start, endDate: weekRange.end }),
        habitLogsApi.getHabitLogs({ startDate: streakRange.startDate, endDate: streakRange.endDate }),
        checkinsApi.getCheckinByDate(todayDateString()),
        weeklySummaryApi.getCurrentWeeklySummary()
      ]);

      if (!isMounted) return;

      if (logsResult.status === "fulfilled") {
        setLogs(logsResult.value);
      } else if (logsResult.reason instanceof ApiClientError && logsResult.reason.statusCode === 401) {
        await handleUnauthorized();
        return;
      } else {
        setLogs([]);
      }

      if (streakLogsResult.status === "fulfilled") {
        setStreakLogs(streakLogsResult.value);
      } else if (streakLogsResult.reason instanceof ApiClientError && streakLogsResult.reason.statusCode === 401) {
        await handleUnauthorized();
        return;
      } else {
        setStreakLogs([]);
      }

      if (checkInResult.status === "fulfilled") {
        setTodayCheckIn(checkInResult.value);
      } else if (checkInResult.reason instanceof ApiClientError && checkInResult.reason.statusCode === 401) {
        await handleUnauthorized();
        return;
      } else {
        setTodayCheckIn(null);
      }

      if (summaryResult.status === "fulfilled") {
        setWeeklySummary(summaryResult.value);
      } else if (summaryResult.reason instanceof ApiClientError && summaryResult.reason.statusCode === 401) {
        await handleUnauthorized();
        return;
      } else {
        setWeeklySummary(null);
      }
    }

    void loadOptionalDashboardData();

    return () => {
      isMounted = false;
    };
  }, [error, handleUnauthorized, isLoading, streakRange.endDate, streakRange.startDate, weekRange.end, weekRange.start]);

  const activeHabits = useMemo(() => habits.filter((habit) => habit.isActive), [habits]);
  const weeklyLogs = useMemo(() => filterLogsForWeek(logs, weekRange), [logs, weekRange]);
  const todayLogs = useMemo(() => logs.filter((log) => normalizeDateString(log.date) === todayDateString()), [logs]);

  const habitsWithProgress = useMemo(() => attachWeeklyProgress(activeHabits, weeklyLogs), [activeHabits, weeklyLogs]);

  const completedToday = useMemo(() => new Set(todayLogs.filter((log) => log.amount > 0).map((log) => log.habitId)).size, [todayLogs]);
  const remainingToday = Math.max(0, activeHabits.length - completedToday);
  const targetsOnTrack = useMemo(() => habitsWithProgress.filter((habit) => habitProgressPercent(habit) >= 100).length, [habitsWithProgress]);
  const currentStreak = useMemo(() => getCurrentActivityStreak(streakLogs), [streakLogs]);
  const checkInStatus = todayCheckIn ? "Done" : "Pending";
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const dashboardInsight =
    weeklySummary?.insightText ||
    (todayCheckIn
      ? `Today's check-in is saved with ${todayCheckIn.energy} energy. Keep logging small actions so the weekly summary has useful context.`
      : "Generate your weekly summary to see AI insight.");
  const dashboardRecommendation =
    weeklySummary?.recommendationText ||
    (remainingToday > 0 ? "Pick one remaining habit and log the smallest honest version today." : "You are caught up for today. Keep the evening check-in simple.");

  if (isLoading) {
    return (
      <>
        <PageHeader description={weekRange.label} eyebrow="Dashboard" title={`Good evening, ${firstName}`} />
        <LoadingState />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader description={weekRange.label} eyebrow="Dashboard" title={`Good evening, ${firstName}`} />
        <ErrorState description={error} title="Could not load dashboard" />
      </>
    );
  }

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-300">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Good evening, {firstName}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            This week at a glance. Keep the week moving with one honest log at a time.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Badge tone="cyan">{weekRange.label}</Badge>
          <LinkButton href="/logs/new">
            Log Activity
            <Icon className="h-4 w-4" name="plus" />
          </LinkButton>
        </div>
      </header>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid gap-6">
          <Card className="overflow-hidden bg-slate-900/80 p-5" padded={false}>
            <WeeklyProgressChart
              habits={activeHabits}
              logs={weeklyLogs}
              today={todayDateString()}
              weekStart={weekRange.start}
            />
          </Card>

          <Card>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Habit progress</h2>
                <p className="text-sm text-slate-500">Current week progress toward each target</p>
              </div>
              <Link className="text-sm font-medium text-emerald-300 hover:text-emerald-200" href="/habits">
                View all
              </Link>
            </div>
            {habitsWithProgress.length > 0 ? (
              <div className="grid gap-3">
                {habitsWithProgress.slice(0, 4).map((habit) => (
                  <HabitProgressRow habit={habit} key={habit.id} />
                ))}
              </div>
            ) : (
              <EmptyState description="Create one small weekly target to start seeing progress here." title="No habits yet" />
            )}
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <StatusTile detail="Today's check-in" label="Check-in Status" tone="emerald" value={checkInStatus} />
          <StatusTile detail="Active habits" label="Habits" tone="cyan" value={String(activeHabits.length)} />
          <StatusTile detail="All habits" label="Logs This Week" tone="violet" value={String(weeklyLogs.length)} />
          <StatusTile detail="Weekly targets" label="Targets On Track" tone="cyan" value={`${targetsOnTrack}/${activeHabits.length}`} />
          <StatusTile
            className="lg:hidden"
            detail={currentStreak > 0 ? "Active days in a row" : "Log today to start"}
            label="Current Streak"
            tone="emerald"
            value={`${currentStreak}`}
          />

          <Card className="border-violet-400/20 bg-violet-400/10">
            <div className="flex items-center justify-between gap-4">
              <Badge tone="violet">{weeklySummary?.status === "generated" ? "AI insight" : "AI insight preview"}</Badge>
              <Icon className="h-5 w-5 text-violet-300" name="spark" />
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-200">{dashboardInsight}</p>
            <p className="mt-4 text-sm leading-6 text-slate-400">{dashboardRecommendation}</p>
            <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-200 hover:text-violet-100" href="/weekly-summary">
              View weekly summary
              <Icon className="h-4 w-4" name="arrow" />
            </Link>
          </Card>
        </div>
      </section>
    </>
  );
}

function StatusTile({
  label,
  value,
  detail,
  tone,
  className = ""
}: {
  label: string;
  value: string;
  detail: string;
  tone: "emerald" | "cyan" | "violet";
  className?: string;
}) {
  const toneClasses = {
    emerald: "text-emerald-300 bg-emerald-400/10 border-emerald-400/15",
    cyan: "text-cyan-300 bg-cyan-400/10 border-cyan-400/15",
    violet: "text-violet-300 bg-violet-400/10 border-violet-400/15"
  };

  return (
    <Card className={`p-4 sm:p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-300">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <span className={`grid h-9 w-9 place-items-center rounded-2xl border ${toneClasses[tone]}`}>
          <Icon className="h-4 w-4" name={tone === "violet" ? "summary" : tone === "cyan" ? "habits" : "check"} />
        </span>
      </div>
    </Card>
  );
}

function HabitProgressRow({ habit }: { habit: Habit }) {
  const percent = habitProgressPercent(habit);
  const typeLabel = habit.category === "bad" ? "Avoidance" : habitTypeLabel(habit.type);
  const tone = habit.category === "bad" ? "rose" : habit.type === "duration" ? "violet" : habit.type === "frequency" ? "cyan" : "emerald";

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/45 p-3.5 transition hover:border-slate-700 hover:bg-slate-950/70">
      <div className="flex items-center gap-3">
        <HabitTypeIcon habit={habit} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-100">{habit.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {categoryLabel(habit.category)} · {typeLabel}
          </p>
        </div>
        <span className="shrink-0 text-sm font-semibold text-slate-200">{percent}%</span>
      </div>
      <div className="mt-3">
        <ProgressBar tone={tone} value={percent} />
      </div>
      <p className="mt-2 text-xs font-medium text-slate-500">{habitUnitLabel(habit)}</p>
    </article>
  );
}
