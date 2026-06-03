"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HabitTypeIcon } from "@/components/habits/HabitTypeIcon";
import { MonthlyCalendarPanel } from "@/components/logs/MonthlyCalendarPanel";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DateField } from "@/components/ui/DateField";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { TextareaField } from "@/components/ui/FormInput";
import { LoadingState } from "@/components/ui/LoadingState";
import { NumberStepper } from "@/components/ui/NumberStepper";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ApiClientError } from "@/lib/api/client";
import { habitLogsApi } from "@/lib/api/habitLogs";
import { habitsApi } from "@/lib/api/habits";
import { getRecentDateRange, isDateInputValue, todayDateString } from "@/lib/date-utils";
import { categoryLabel, habitProgressPercent, habitTargetLabel, habitTypeLabel } from "@/lib/habit-utils";
import { calculateHabitWeeklyProgress, filterLogsForWeek, getCurrentWeekRange } from "@/lib/progress-utils";
import { getCurrentActivityStreak } from "@/lib/streak-utils";
import type { Habit, HabitLog } from "@/types";

export function LogActivityForm() {
  const router = useRouter();
  const { logout } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [habitId, setHabitId] = useState("");
  const [date, setDate] = useState(todayDateString());
  const [amount, setAmount] = useState("1");
  const [checklistDone, setChecklistDone] = useState(true);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedHabit = useMemo(() => habits.find((habit) => habit.id === habitId) ?? habits[0], [habitId, habits]);
  const activeHabits = useMemo(() => habits.filter((habit) => habit.isActive), [habits]);
  const weekRange = useMemo(() => getCurrentWeekRange(), []);
  const weeklyLogs = useMemo(() => filterLogsForWeek(logs, weekRange), [logs, weekRange]);
  const selectedHabitWithProgress = useMemo(() => {
    if (!selectedHabit) return null;
    return {
      ...selectedHabit,
      weeklyProgress: calculateHabitWeeklyProgress(selectedHabit, weeklyLogs)
    };
  }, [selectedHabit, weeklyLogs]);

  const handleUnauthorized = useCallback(async () => {
    await logout();
    router.replace("/login");
  }, [logout, router]);

  const loadHabits = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextHabits = await habitsApi.getHabits();
      setHabits(nextHabits);
      const firstActiveHabit = nextHabits.find((habit) => habit.isActive) ?? nextHabits[0];
      setHabitId((currentHabitId) => currentHabitId || firstActiveHabit?.id || "");

      try {
        const range = getRecentDateRange(90);
        const nextLogs = await habitLogsApi.getHabitLogs(range);
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
  }, [handleUnauthorized]);

  useEffect(() => {
    void loadHabits();
  }, [loadHabits]);

  useEffect(() => {
    if (!selectedHabit) return;
    if (selectedHabit.category === "bad" || selectedHabit.type === "checklist") {
      setAmount("1");
      return;
    }
    if (selectedHabit.type === "duration") {
      setAmount("30");
      return;
    }
    setAmount("1");
  }, [selectedHabit?.id, selectedHabit]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedHabit) {
      setError("Choose a habit before saving a log.");
      return;
    }

    if (!isDateInputValue(date)) {
      setError("Choose a valid date.");
      return;
    }

    if (date > todayDateString()) {
      setError("Habit logs cannot be submitted for future dates.");
      return;
    }

    const trimmedNote = note.trim();

    if (selectedHabit.category === "bad") {
      setIsSubmitting(true);

      try {
        const savedLog = await habitLogsApi.createAvoidanceLog({
          habitId: selectedHabit.id,
          date,
          note: trimmedNote || null
        });
        setLogs((currentLogs) => [
          ...currentLogs.filter((log) => !(log.habitId === selectedHabit.id && log.date === date)),
          savedLog
        ]);
        setSuccess(`Avoidance recorded for ${selectedHabit.name}.`);
        setNote("");
      } catch (requestError) {
        await handleSubmitError(requestError);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const parsedAmount = selectedHabit.type === "checklist" ? (checklistDone ? 1 : 0) : Number(amount);

    if (!Number.isInteger(parsedAmount) || parsedAmount < 0) {
      setError("Amount must be a whole number.");
      return;
    }

    if ((selectedHabit.type === "frequency" || selectedHabit.type === "duration") && parsedAmount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    setIsSubmitting(true);

    try {
      const savedLog = await habitLogsApi.createHabitLog({
        habitId: selectedHabit.id,
        date,
        amount: parsedAmount,
        note: trimmedNote || null
      });
      setLogs((currentLogs) => [
        ...currentLogs.filter((log) => !(log.habitId === selectedHabit.id && log.date === date)),
        savedLog
      ]);
      setSuccess(`Activity saved for ${selectedHabit.name}.`);
      setNote("");
      if (selectedHabit.type !== "checklist") setAmount("");
    } catch (requestError) {
      await handleSubmitError(requestError);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitError(requestError: unknown) {
    if (requestError instanceof ApiClientError && requestError.statusCode === 401) {
      await handleUnauthorized();
      return;
    }

    setError(requestError instanceof Error ? requestError.message : "Unable to save log.");
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

  if (habits.length === 0) {
    return (
      <EmptyState
        action={<LinkButton href="/habits/new">Create habit</LinkButton>}
        description="Create one habit first, then come back to log today's progress."
        title="No habits to log"
      />
    );
  }

  const selectedIsBadHabit = selectedHabit?.category === "bad";
  const amountLabel = selectedHabit?.type === "duration" ? "Minutes" : selectedHabit?.type === "frequency" ? "Count" : "Checklist";

  const streak = getCurrentActivityStreak(logs);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <form className="grid gap-6" onSubmit={handleSubmit}>
        {success ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            {success}
          </div>
        ) : null}

        <Card>
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">1. Select habit</p>
              <p className="mt-1 text-sm text-slate-500">Choose what you want to log today.</p>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              {streak} day streak
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(activeHabits.length > 0 ? activeHabits : habits).map((habit) => {
              const selected = selectedHabit?.id === habit.id;
              const typeLabel = habit.category === "bad" ? "Avoidance" : habitTypeLabel(habit.type);

              return (
                <button
                  className={`rounded-3xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-400/25 ${
                    selected
                      ? "border-emerald-400/45 bg-emerald-400/10 shadow-[0_0_28px_rgba(16,185,129,0.12)]"
                      : "border-slate-800 bg-slate-950/45 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                  key={habit.id}
                  onClick={() => setHabitId(habit.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <HabitTypeIcon habit={habit} size="sm" />
                    {selected ? <span className="rounded-full bg-emerald-400 px-2 py-1 text-xs font-bold text-slate-950">Selected</span> : null}
                  </div>
                  <p className="mt-4 truncate text-sm font-semibold text-white">{habit.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {categoryLabel(habit.category)} - {typeLabel}
                  </p>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="mb-5">
            <p className="text-sm font-semibold text-white">2. Log details</p>
            <p className="mt-1 text-sm text-slate-500">Add the date, amount, and any useful context.</p>
          </div>

          <div className="grid gap-5">
            <DateField label="Date" max={todayDateString()} onValueChange={setDate} value={date} />

            {selectedHabit ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
                <p className="text-sm font-semibold text-slate-100">{selectedHabit.name}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {selectedIsBadHabit
                    ? "Record a successful avoidance for this date."
                    : selectedHabit.type === "duration"
                      ? "Log total minutes. 60 minutes = 1 hour."
                      : selectedHabit.type === "frequency"
                        ? "Log how many times you completed it."
                        : "Mark whether this yes/no habit was done."}
                </p>
              </div>
            ) : null}

            {selectedIsBadHabit ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <p className="text-sm font-semibold text-emerald-200">Record avoidance</p>
                <p className="mt-1 text-sm text-emerald-100/70">This saves one successful avoided day.</p>
              </div>
            ) : selectedHabit?.type === "checklist" ? (
              <div>
                <p className="text-sm font-medium text-slate-200">{amountLabel}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Done", value: true },
                    { label: "Not done", value: false }
                  ].map((item) => (
                    <button
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-400/35 ${
                        checklistDone === item.value
                          ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-200"
                          : "border-slate-700 bg-slate-950/50 text-slate-300 hover:bg-slate-900"
                      }`}
                      key={item.label}
                      onClick={() => setChecklistDone(item.value)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <NumberStepper
                hint={selectedHabit?.type === "duration" ? "Enter minutes. Example: 60 means 1 hour." : "Enter a whole number count for today."}
                label={amountLabel}
                min={1}
                onValueChange={setAmount}
                placeholder={selectedHabit?.type === "duration" ? "60" : "1"}
                quickValues={selectedHabit?.type === "duration" ? [15, 30, 45, 60] : [1, 2, 3, 5]}
                value={amount}
              />
            )}

            <TextareaField
              label="Notes"
              maxLength={500}
              onChange={(event) => setNote(event.target.value)}
              placeholder="What helped today?"
              value={note}
            />

            {error ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}
          </div>
        </Card>

        <Button className="w-full justify-center py-3 sm:w-fit sm:min-w-52" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : selectedIsBadHabit ? "Record avoidance" : "Save activity"}
        </Button>
      </form>

      <aside className="grid gap-4 self-start">
        <MonthlyCalendarPanel max={todayDateString()} onValueChange={setDate} value={date} />
        {selectedHabitWithProgress ? <SelectedHabitSummaryPanel habit={selectedHabitWithProgress} /> : null}
      </aside>
    </div>
  );
}

function SelectedHabitSummaryPanel({ habit }: { habit: Habit }) {
  const typeLabel = habit.category === "bad" ? "Avoidance" : habitTypeLabel(habit.type);
  const percent = habitProgressPercent(habit);
  const current = habit.weeklyProgress ?? 0;
  const remaining = Math.max(0, habit.weeklyTarget - current);
  const tone = habit.category === "bad" ? "rose" : habit.type === "duration" ? "violet" : habit.type === "frequency" ? "cyan" : "emerald";

  return (
    <Card>
      <div className="flex items-start gap-3">
        <HabitTypeIcon habit={habit} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-white">{habit.name}</p>
          <p className="mt-1 text-sm text-slate-500">
            {categoryLabel(habit.category)} - {typeLabel}
          </p>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-xs font-semibold text-slate-200">
          {percent}%
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        <SummaryMetric label="Current progress" value={currentProgressLabel(habit)} />
        <SummaryMetric label="Weekly target" value={habitTargetLabel(habit)} />
      </div>

      <div className="mt-5">
        <ProgressBar tone={tone} value={percent} />
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-400">{buildSelectedHabitHelper(habit, remaining)}</p>
    </Card>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function currentProgressLabel(habit: Habit): string {
  const progress = habit.weeklyProgress ?? 0;
  if (habit.category === "bad") return `${progress} avoidance ${progress === 1 ? "day" : "days"}`;
  if (habit.type === "duration") return `${progress} min`;
  if (habit.type === "frequency") return `${progress} ${progress === 1 ? "time" : "times"}`;
  return `${progress} ${progress === 1 ? "day" : "days"}`;
}

function buildSelectedHabitHelper(habit: Habit, remaining: number): string {
  if (remaining <= 0) {
    return "This weekly target is complete. Keep logging if you do more.";
  }

  if (habit.category === "bad") {
    return `${remaining} more avoided ${remaining === 1 ? "day" : "days"} to reach this week's target.`;
  }

  if (habit.type === "duration") {
    return `${remaining} min left to reach this week's target.`;
  }

  if (habit.type === "frequency") {
    return `${remaining} more ${remaining === 1 ? "log" : "logs"} to reach this week's target.`;
  }

  return `${remaining} more completed ${remaining === 1 ? "day" : "days"} to reach this week's target.`;
}
