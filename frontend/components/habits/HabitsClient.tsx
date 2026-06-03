"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HabitCard } from "@/components/habits/HabitCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button, LinkButton } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { ApiClientError } from "@/lib/api/client";
import { habitLogsApi } from "@/lib/api/habitLogs";
import { habitsApi } from "@/lib/api/habits";
import { attachWeeklyProgress, filterLogsForWeek, getCurrentWeekRange } from "@/lib/progress-utils";
import type { Habit, HabitCategory, HabitLog, HabitType } from "@/types";

type HabitFilter = "all" | HabitCategory | HabitType;

const filters: Array<{ label: string; value: HabitFilter }> = [
  { label: "All", value: "all" },
  { label: "Good", value: "good" },
  { label: "Bad", value: "bad" },
  { label: "Frequency", value: "frequency" },
  { label: "Duration", value: "duration" },
  { label: "Checklist", value: "checklist" }
];

export function HabitsClient() {
  const router = useRouter();
  const { logout } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [filter, setFilter] = useState<HabitFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleUnauthorized = useCallback(async () => {
    await logout();
    router.replace("/login");
  }, [logout, router]);
  const weekRange = useMemo(() => getCurrentWeekRange(), []);

  const loadHabits = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextHabits = await habitsApi.getHabits();
      setHabits(nextHabits);

      try {
        const nextLogs = await habitLogsApi.getHabitLogs({ startDate: weekRange.start, endDate: weekRange.end });
        setLogs(nextLogs);
      } catch (logError) {
        if (logError instanceof ApiClientError && logError.statusCode === 401) {
          await handleUnauthorized();
          return;
        }

        setLogs([]);
      }
    } catch (requestError) {
      if (requestError instanceof ApiClientError && requestError.statusCode === 401) {
        await handleUnauthorized();
        return;
      }

      setError(requestError instanceof Error ? requestError.message : "Unable to load habits.");
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized, weekRange.end, weekRange.start]);

  useEffect(() => {
    void loadHabits();
  }, [loadHabits]);

  const weeklyLogs = useMemo(() => filterLogsForWeek(logs, weekRange), [logs, weekRange]);
  const habitsWithProgress = useMemo(() => attachWeeklyProgress(habits, weeklyLogs), [habits, weeklyLogs]);
  const filteredHabits = useMemo(() => {
    if (filter === "all") return habitsWithProgress;
    if (filter === "good" || filter === "bad") return habitsWithProgress.filter((habit) => habit.category === filter);
    return habitsWithProgress.filter((habit) => habit.category === "good" && habit.type === filter);
  }, [filter, habitsWithProgress]);
  const habitPendingDelete = useMemo(
    () => habits.find((habit) => habit.id === confirmingDeleteId) ?? null,
    [confirmingDeleteId, habits]
  );

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);

    try {
      await habitsApi.deleteHabit(id);
      setHabits((currentHabits) => currentHabits.filter((habit) => habit.id !== id));
      setConfirmingDeleteId(null);
    } catch (requestError) {
      if (requestError instanceof ApiClientError && requestError.statusCode === 401) {
        await handleUnauthorized();
        return;
      }

      setError(requestError instanceof Error ? requestError.message : "Unable to delete habit.");
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error && habits.length === 0) {
    return (
      <ErrorState
        action={
          <Button className="mt-5" onClick={() => void loadHabits()} type="button" variant="danger">
            Try again
          </Button>
        }
        description={error}
        title="Could not load habits"
      />
    );
  }

  return (
    <>
      <div className="mb-5 flex w-full flex-wrap items-center gap-2">
        {filters.map((item) => {
          const isActive = filter === item.value;

          return (
            <button
              aria-pressed={isActive}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-400/40 ${
                isActive
                  ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-200 shadow-lg shadow-emerald-950/20"
                  : "border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200"
              }`}
              key={item.value}
              onClick={() => setFilter(item.value)}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="mb-5 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {habits.length === 0 ? (
        <EmptyState
          action={<LinkButton href="/habits/new">Add your first habit</LinkButton>}
          description="You haven't created any habits yet. Start with one small habit for this week."
          title="No habits yet"
        />
      ) : filteredHabits.length === 0 ? (
        <EmptyState
          action={
            <Button onClick={() => setFilter("all")} type="button" variant="secondary">
              Clear filter
            </Button>
          }
          description="Try another category or type filter."
          title="No habits match this filter"
        />
      ) : (
        <section className="grid w-full items-stretch gap-4 md:grid-cols-2 xl:gap-5">
          {filteredHabits.map((habit) => (
            <HabitCard
              habit={habit}
              key={habit.id}
              onRequestDelete={() => setConfirmingDeleteId(habit.id)}
              showActions
            />
          ))}
        </section>
      )}

      <ConfirmDialog
        confirmLabel="Delete"
        description={
          habitPendingDelete
            ? `This will permanently remove "${habitPendingDelete.name}". This action cannot be undone.`
            : "This action cannot be undone."
        }
        isBusy={Boolean(deletingId)}
        isOpen={Boolean(habitPendingDelete)}
        onClose={() => {
          if (!deletingId) setConfirmingDeleteId(null);
        }}
        onConfirm={() => {
          if (habitPendingDelete) void handleDelete(habitPendingDelete.id);
        }}
        title="Delete this habit?"
      />
    </>
  );
}
