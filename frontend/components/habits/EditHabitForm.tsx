"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { FormInput } from "@/components/ui/FormInput";
import { LoadingState } from "@/components/ui/LoadingState";
import { SelectField } from "@/components/ui/SelectField";
import { TargetPicker } from "@/components/ui/TargetPicker";
import { ToggleField } from "@/components/ui/ToggleField";
import { ApiClientError } from "@/lib/api/client";
import { habitsApi } from "@/lib/api/habits";
import type { Habit, HabitCategory, HabitType, UpdateHabitInput } from "@/types";

const helperText: Record<HabitType, string> = {
  checklist: "Choose how many days this habit should be completed this week.",
  frequency: "Choose how many total times you want to complete this habit this week.",
  duration: "Choose the total minutes you want to spend on this habit this week."
};

interface EditHabitFormProps {
  habitId: string;
}

export function EditHabitForm({ habitId }: EditHabitFormProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("checklist");
  const [category, setCategory] = useState<HabitCategory>("good");
  const [weeklyTarget, setWeeklyTarget] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBadHabit = category === "bad";
  const effectiveType = isBadHabit ? "checklist" : type;
  const targetLabel = getTargetLabel(category, effectiveType);
  const targetHint = getTargetHint(category, effectiveType);
  const targetMax = getTargetMax(category, effectiveType);

  const handleUnauthorized = useCallback(async () => {
    await logout();
    router.replace("/login");
  }, [logout, router]);

  const loadHabit = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const loadedHabit = await habitsApi.getHabitById(habitId);
      setHabit(loadedHabit);
      setName(loadedHabit.name);
      setType(loadedHabit.category === "bad" ? "checklist" : loadedHabit.type);
      setCategory(loadedHabit.category);
      setWeeklyTarget(String(loadedHabit.weeklyTarget));
      setIsActive(loadedHabit.isActive);
    } catch (requestError) {
      if (requestError instanceof ApiClientError && requestError.statusCode === 401) {
        await handleUnauthorized();
        return;
      }

      setError(requestError instanceof Error ? requestError.message : "Unable to load habit.");
    } finally {
      setIsLoading(false);
    }
  }, [handleUnauthorized, habitId]);

  useEffect(() => {
    void loadHabit();
  }, [loadHabit]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const input = validateHabitInput({ name, type: effectiveType, category, weeklyTarget, isActive, targetMax });
    if (typeof input === "string") {
      setError(input);
      return;
    }

    setIsSaving(true);

    try {
      await habitsApi.updateHabit(habitId, input);
      router.replace("/habits");
    } catch (requestError) {
      if (requestError instanceof ApiClientError && requestError.statusCode === 401) {
        await handleUnauthorized();
        return;
      }

      setError(requestError instanceof Error ? requestError.message : "Unable to update habit.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (error && !habit) {
    return (
      <ErrorState
        action={
          <Button className="mt-5" onClick={() => void loadHabit()} type="button" variant="danger">
            Try again
          </Button>
        }
        description={error}
        title="Could not load habit"
      />
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <FormInput
            label="Habit name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Review lecture notes"
            value={name}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Category"
              onValueChange={(value) => {
                const nextCategory = value as HabitCategory;
                setCategory(nextCategory);
                if (nextCategory === "bad") setType("checklist");
              }}
              options={[
                { label: "Good habit", value: "good" },
                { label: "Bad habit", value: "bad" }
              ]}
              value={category}
            />
            {isBadHabit ? (
              <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-3">
                <p className="text-sm font-medium text-cyan-100">Avoidance tracking</p>
                <p className="mt-1 text-xs leading-5 text-cyan-100/70">Saving this habit will keep it as successful avoided days.</p>
              </div>
            ) : (
              <SelectField
                hint={helperText[type]}
                label="Habit type"
                onValueChange={(value) => setType(value as HabitType)}
                options={[
                  { label: "Checklist", value: "checklist" },
                  { label: "Frequency", value: "frequency" },
                  { label: "Duration", value: "duration" }
                ]}
                value={type}
              />
            )}
          </div>
          <TargetPicker
            hint={targetHint}
            label={targetLabel}
            max={targetMax}
            onValueChange={setWeeklyTarget}
            quickValues={effectiveType === "duration" ? [60, 120, 180, 300] : [1, 3, 5, 7]}
            value={weeklyTarget}
          />
          <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-3 text-sm leading-6 text-cyan-100/80">
            Habit notes are saved on individual logs, not on the habit itself.
          </div>
          <ToggleField
            checked={isActive}
            hint="Paused habits stay saved but do not appear as active."
            label="Active habit"
            onCheckedChange={setIsActive}
          />
          {error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
              href="/habits"
            >
              Cancel
            </Link>
            <Button disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Card>

      <Card as="aside">
        <h2 className="text-lg font-semibold text-white">Edit guide</h2>
        <div className="mt-5 grid gap-4 text-sm leading-6 text-slate-400">
          <p>{targetHint}</p>
          <p>{isBadHabit ? "Bad habits are counted only as successful avoidance days." : "Good habits are counted toward weekly progress."}</p>
          <p>Changing the target affects future weekly summaries and dashboard progress.</p>
        </div>
      </Card>
    </section>
  );
}

function validateHabitInput(input: {
  name: string;
  type: HabitType;
  category: HabitCategory;
  weeklyTarget: string;
  isActive: boolean;
  targetMax: number;
}): UpdateHabitInput | string {
  const trimmedName = input.name.trim();
  const weeklyTarget = Number(input.weeklyTarget);

  if (!trimmedName) return "Habit name is required.";
  if (!Number.isInteger(weeklyTarget) || weeklyTarget <= 0) return "Weekly target must be a positive whole number.";
  if (weeklyTarget > input.targetMax) return `${getTargetLabel(input.category, input.type)} cannot be above ${input.targetMax}.`;

  return {
    name: trimmedName,
    type: input.category === "bad" ? "checklist" : input.type,
    category: input.category,
    weeklyTarget,
    isActive: input.isActive
  };
}

function getTargetLabel(category: HabitCategory, type: HabitType): string {
  if (category === "bad") return "Avoidance days per week";
  if (type === "duration") return "Minutes per week";
  if (type === "frequency") return "Times per week";
  return "Days per week";
}

function getTargetHint(category: HabitCategory, type: HabitType): string {
  if (category === "bad") return "Choose how many days this week you want to successfully avoid this habit.";
  return helperText[type];
}

function getTargetMax(category: HabitCategory, type: HabitType): number {
  return category === "bad" || type === "checklist" ? 7 : 10000;
}
