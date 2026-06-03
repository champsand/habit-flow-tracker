"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HabitTypeIcon } from "@/components/habits/HabitTypeIcon";
import { useAuth } from "@/components/providers/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ApiClientError } from "@/lib/api/client";
import { weeklySummaryApi } from "@/lib/api/weeklySummary";
import { todayDateString } from "@/lib/date-utils";
import { categoryLabel, habitTypeLabel } from "@/lib/habit-utils";
import type { HabitProgressItem, WeeklySummary } from "@/types";

export function WeeklySummaryClient() {
  const router = useRouter();
  const { logout } = useAuth();
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUnauthorized = useCallback(async () => {
    await logout();
    router.replace("/login");
  }, [logout, router]);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentSummary = await weeklySummaryApi.getCurrentWeeklySummary();
      setSummary(currentSummary);
    } catch (requestError) {
      if (requestError instanceof ApiClientError && requestError.statusCode === 401) {
        await handleUnauthorized();
        return;
      }

      setError(requestError instanceof Error ? requestError.message : "Unable to load weekly summary.");
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const generatedSummary = await weeklySummaryApi.generateWeeklySummary({ weekDate: todayDateString() });
      setSummary(generatedSummary);
      setSuccess("Weekly summary generated.");
    } catch (requestError) {
      if (requestError instanceof ApiClientError && requestError.statusCode === 401) {
        await handleUnauthorized();
        return;
      }

      setError(requestError instanceof Error ? requestError.message : "Unable to generate weekly summary.");
    } finally {
      setIsGenerating(false);
    }
  }

  const rankedHabits = useMemo(() => getRankedHabits(summary), [summary]);
  const progressItems = summary?.progressData ?? [];
  const stats = useMemo(() => buildSummaryStats(summary, rankedHabits), [summary, rankedHabits]);
  const weekLabel = useMemo(() => formatWeekRange(summary), [summary]);
  const hasSummaryData = Boolean(summary && (rankedHabits.length || progressItems.length || summary.insightText || summary.recommendationText));
  const isGenerated = summary?.status === "generated";

  if (isLoading) {
    return <WeeklySummarySkeleton />;
  }

  if (error && !summary) {
    return (
      <ErrorState
        action={
          <Button className="mt-5" onClick={() => void loadSummary()} type="button" variant="danger">
            Try again
          </Button>
        }
        description={error}
        title="Could not load weekly summary"
      />
    );
  }

  return (
    <div className="grid gap-6">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-soft shadow-black/10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={isGenerated ? "emerald" : "violet"}>{isGenerated ? "Generated" : "Not generated"}</Badge>
            <Badge tone="cyan">{weekLabel}</Badge>
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">Weekly performance overview</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Rankings, target progress, and AI guidance based on this week&apos;s habit activity.
          </p>
        </div>
        <Button className="w-full sm:w-fit" disabled={isGenerating} onClick={handleGenerate} type="button">
          {isGenerating ? "Generating..." : isGenerated ? "Regenerate Summary" : "Generate Summary"}
          <Icon className="h-4 w-4" name="spark" />
        </Button>
      </section>

      {success ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{success}</div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>
      ) : null}

      {!hasSummaryData ? (
        <EmptyState
          action={
            <Button disabled={isGenerating} onClick={handleGenerate} type="button">
              {isGenerating ? "Generating..." : "Generate Weekly Summary"}
            </Button>
          }
          description="Log habits and check in during the week to get better insights."
          title="No weekly summary yet"
        />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryStatCard
              helper="From habit progress"
              label="Average Progress"
              ring
              tone="emerald"
              value={`${stats.consistency}%`}
              numericValue={stats.consistency}
            />
            <SummaryStatCard helper="All habits" label="Total Logs" tone="cyan" value={String(stats.totalLogs)} />
            <SummaryStatCard helper="This week" label="Targets Achieved" tone="emerald" value={`${stats.targetsAchieved}/${stats.totalTargets}`} />
            <SummaryStatCard helper="From summary data" label="Check-in" tone="violet" value={stats.checkInLabel} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card className="p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Top Habits This Week</h2>
                  <p className="mt-1 text-sm text-slate-500">Ranked by weekly consistency.</p>
                </div>
                <Badge tone="emerald">{rankedHabits.length} ranked</Badge>
              </div>

              {rankedHabits.length ? (
                <div className="grid gap-3">
                  {rankedHabits.map((habit, index) => (
                    <RankingRow habit={habit} index={index} key={`${habit.habitId}-${index}`} />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4 text-sm text-slate-400">
                  No habit ranking is available yet.
                </p>
              )}
            </Card>

            <aside className="grid gap-6 self-start">
              <AiInsightCard insight={summary?.insightText} onRefresh={handleGenerate} isRefreshing={isGenerating} />
              <RecommendationCard recommendation={summary?.recommendationText} />
            </aside>
          </section>

          <WeeklyPatterns stats={stats} rankedHabits={rankedHabits} summary={summary} />
        </>
      )}
    </div>
  );
}

function SummaryStatCard({
  label,
  value,
  helper,
  tone,
  ring = false,
  numericValue = 0
}: {
  label: string;
  value: string;
  helper: string;
  tone: "emerald" | "cyan" | "violet";
  ring?: boolean;
  numericValue?: number;
}) {
  const accent = {
    emerald: "text-emerald-300 border-emerald-400/20 bg-emerald-400/10",
    cyan: "text-cyan-300 border-cyan-400/20 bg-cyan-400/10",
    violet: "text-violet-300 border-violet-400/20 bg-violet-400/10"
  }[tone];

  return (
    <Card className="p-4" padded={false}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
        {ring ? (
          <div
            className="grid h-16 w-16 place-items-center rounded-full"
            style={{ background: `conic-gradient(#34d399 ${Math.min(100, Math.max(0, numericValue))}%, #1f2937 0)` }}
          >
            <div className="h-11 w-11 rounded-full bg-slate-900" />
          </div>
        ) : (
          <span className={`grid h-11 w-11 place-items-center rounded-2xl border ${accent}`}>
            <Icon className="h-5 w-5" name={tone === "violet" ? "check" : tone === "cyan" ? "log" : "summary"} />
          </span>
        )}
      </div>
    </Card>
  );
}

function RankingRow({ habit, index }: { habit: HabitProgressItem; index: number }) {
  const tone = habit.category === "bad" ? "rose" : habit.type === "duration" ? "violet" : habit.type === "frequency" ? "cyan" : "emerald";
  const typeLabel = habit.category === "bad" ? "Avoidance" : habitTypeLabel(habit.type);

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4 transition hover:border-slate-700 hover:bg-slate-950/70">
      <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)_96px_auto] sm:items-center">
        <span className="grid h-7 w-7 place-items-center rounded-full border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300">
          {index + 1}
        </span>
        <div className="flex min-w-0 items-center gap-3">
          <HabitTypeIcon habit={habit} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{habit.name}</p>
            <p className="mt-1 text-xs text-slate-500">
              {categoryLabel(habit.category)} / {typeLabel}
            </p>
          </div>
        </div>
        <ProgressBar tone={tone} value={habit.consistency} />
        <span className="text-right text-sm font-semibold text-slate-100">{habit.consistency}%</span>
      </div>
    </article>
  );
}

function AiInsightCard({ insight, onRefresh, isRefreshing }: { insight?: string | null; onRefresh: () => void; isRefreshing: boolean }) {
  return (
    <Card className="border-violet-400/20 bg-violet-400/10">
      <div className="flex items-center justify-between gap-4">
        <Badge tone="violet">AI Insight</Badge>
        <Icon className="h-5 w-5 text-violet-300" name="spark" />
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-200">
        {insight || "Generate your weekly summary to see AI insight."}
      </p>
      <Button className="mt-5 min-h-10 px-3 py-2" disabled={isRefreshing} onClick={onRefresh} type="button" variant="ghost">
        {isRefreshing ? "Refreshing..." : "Refresh summary"}
      </Button>
    </Card>
  );
}

function RecommendationCard({ recommendation }: { recommendation?: string | null }) {
  const text = recommendation || "Focus on one habit and log it consistently for the next two days.";

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white">Next Week Recommendation</h2>
      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
        <p className="text-sm leading-6 text-slate-300">{text}</p>
      </div>
    </Card>
  );
}

function WeeklyPatterns({
  stats,
  rankedHabits,
  summary
}: {
  stats: SummaryStats;
  rankedHabits: HabitProgressItem[];
  summary: WeeklySummary | null;
}) {
  const bestHabit = rankedHabits[0]?.name ?? summary?.topHabit?.name ?? "No habit yet";
  const attentionHabit = getNeedsAttentionHabit(summary, rankedHabits);
  const weakestHabit = attentionHabit?.name ?? (rankedHabits.length ? "All habits on track" : "No habit yet");
  const weakestDetail = attentionHabit ? `${attentionHabit.consistency}% current progress` : "All habits on track";

  return (
    <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:grid-cols-3">
      <PatternCard label="Best Habit" value={bestHabit} detail={`${rankedHabits[0]?.consistency ?? 0}% consistency`} tone="emerald" />
      <PatternCard label="Needs Attention" value={weakestHabit} detail={weakestDetail} tone="rose" />
      <PatternCard label="Total Logs" value={String(stats.totalLogs)} detail="Logged this week" tone="cyan" />
    </section>
  );
}

function PatternCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: "emerald" | "cyan" | "rose" }) {
  const colors = {
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    rose: "border-rose-400/20 bg-rose-400/10 text-rose-300"
  }[tone];

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${colors}`}>{label}</span>
      <p className="mt-4 truncate text-sm font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </article>
  );
}

function WeeklySummarySkeleton() {
  return (
    <div className="grid gap-6">
      <div className="h-32 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/70" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div className="h-28 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/70" key={item} />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-3xl border border-slate-800 bg-slate-900/70" />
    </div>
  );
}

interface SummaryStats {
  consistency: number;
  totalLogs: number;
  targetsAchieved: number;
  totalTargets: number;
  checkInLabel: string;
}

function buildSummaryStats(summary: WeeklySummary | null, rankedHabits: HabitProgressItem[]): SummaryStats {
  const progressItems = summary?.progressData?.length ? summary.progressData : rankedHabits;
  const consistency = progressItems.length
    ? Math.round(progressItems.reduce((total, item) => total + item.consistency, 0) / progressItems.length)
    : 0;
  const totalLogs = progressItems.reduce((total, item) => total + item.logCount, 0);
  const targetsAchieved = summary?.targetsAchieved ?? progressItems.filter((item) => item.targetAchieved).length;
  const totalTargets = summary?.totalHabits ?? progressItems.length;
  const checkInLabel = summary?.checkinCount === undefined ? "-" : String(summary.checkinCount);

  return {
    consistency,
    totalLogs,
    targetsAchieved,
    totalTargets,
    checkInLabel
  };
}

function getRankedHabits(summary: WeeklySummary | null): HabitProgressItem[] {
  const source = summary?.rankingData?.length ? summary.rankingData : summary?.progressData ?? [];
  return [...source].sort((a, b) => b.consistency - a.consistency);
}

function getNeedsAttentionHabit(summary: WeeklySummary | null, rankedHabits: HabitProgressItem[]): HabitProgressItem | null {
  const source = summary?.progressData?.length ? summary.progressData : rankedHabits;
  const incompleteHabits = source.filter((habit) => !habit.targetAchieved);

  if (!incompleteHabits.length) {
    return null;
  }

  return [...incompleteHabits].sort((a, b) => {
    if (a.consistency !== b.consistency) {
      return a.consistency - b.consistency;
    }

    return a.name.localeCompare(b.name);
  })[0];
}

function formatWeekRange(summary: WeeklySummary | null): string {
  if (!summary?.weekStartDate || !summary.weekEndDate) return "Current week";
  const start = formatShortDate(summary.weekStartDate);
  const end = new Date(`${summary.weekEndDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  return `${start} - ${end}`;
}

function formatShortDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Current week";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}
