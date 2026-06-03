"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormInput } from "@/components/ui/FormInput";
import { SelectField } from "@/components/ui/SelectField";
import { TargetPicker } from "@/components/ui/TargetPicker";
import { ToggleField } from "@/components/ui/ToggleField";
import { ApiClientError } from "@/lib/api/client";
import { habitsApi } from "@/lib/api/habits";
import { habitTypeLabel } from "@/lib/habit-utils";
import type { CreateHabitInput, HabitCategory, HabitType } from "@/types";

const helperText: Record<HabitType, string> = {
  checklist: "Choose how many days this habit should be completed this week.",
  frequency: "Choose how many total times you want to complete this habit this week.",
  duration: "Choose the total minutes you want to spend on this habit this week."
};

export function NewHabitForm() {
  const router = useRouter();
  const { logout } = useAuth();
  const [name, setName] = useState("");
  const [type, setType] = useState<HabitType>("checklist");
  const [category, setCategory] = useState<HabitCategory>("good");
  const [weeklyTarget, setWeeklyTarget] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isBadHabit = category === "bad";
  const effectiveType = isBadHabit ? "checklist" : type;
  const targetLabel = getTargetLabel(category, effectiveType);
  const targetHint = getTargetHint(category, effectiveType);
  const targetMax = getTargetMax(category, effectiveType);

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
      await habitsApi.createHabit(input);
      router.replace("/habits");
    } catch (requestError) {
      if (requestError instanceof ApiClientError && requestError.statusCode === 401) {
        await logout();
        router.replace("/login");
        return;
      }

      setError(requestError instanceof Error ? requestError.message : "Unable to create habit.");
    } finally {
      setIsSaving(false);
    }
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
                <p className="mt-1 text-xs leading-5 text-cyan-100/70">Bad habits are tracked as successful avoided days.</p>
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
            Notes are added when you log activity, so each entry can keep its own context.
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
              {isSaving ? "Saving..." : "Save habit"}
            </Button>
          </div>
        </form>
      </Card>

      <Card as="aside">
        <p className="text-sm font-medium text-emerald-300">Habit preview</p>
        <h2 className="mt-2 truncate text-xl font-semibold text-white">{name.trim() || "Untitled habit"}</h2>
        <p className="mt-2 text-sm text-slate-500">
          {category === "bad" ? "Bad habit" : "Good habit"} - {isBadHabit ? "Avoidance" : habitTypeLabel(effectiveType)}
        </p>

        <div className="mt-6 grid gap-3">
          <PreviewMetric label="Weekly target" value={weeklyTarget ? `${weeklyTarget} ${targetPreviewUnit(category, effectiveType)}` : targetLabel} />
          <PreviewMetric label="Status" value={isActive ? "Active" : "Paused"} />
        </div>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
          <p className="text-sm font-semibold text-slate-100">{isBadHabit ? "Avoidance tracking" : habitTypeLabel(effectiveType)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{getPreviewExplanation(category, effectiveType)}</p>
        </div>
      </Card>
    </section>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function validateHabitInput(input: {
  name: string;
  type: HabitType;
  category: HabitCategory;
  weeklyTarget: string;
  isActive: boolean;
  targetMax: number;
}): CreateHabitInput | string {
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

function targetPreviewUnit(category: HabitCategory, type: HabitType): string {
  if (category === "bad") return "avoidance days / week";
  if (type === "duration") return "min / week";
  if (type === "frequency") return "times / week";
  return "days / week";
}

function getPreviewExplanation(category: HabitCategory, type: HabitType): string {
  if (category === "bad") return "Track how many days you successfully avoided this habit this week.";
  if (type === "duration") return "Track the total minutes spent on this habit this week.";
  if (type === "frequency") return "Track how many times this habit is completed this week.";
  return "Complete this habit on selected days during the week.";
}
