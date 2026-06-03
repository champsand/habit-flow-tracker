"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MonthlyCalendarPanel } from "@/components/logs/MonthlyCalendarPanel";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextareaField } from "@/components/ui/FormInput";
import { ApiClientError } from "@/lib/api/client";
import { checkinsApi } from "@/lib/api/checkins";
import { isDateInputValue, todayDateString } from "@/lib/date-utils";
import type { DailyCheckIn, EnergyLevel, MoodOption } from "@/types";

const moods: MoodOption[] = [
  { label: "Great", value: "great" },
  { label: "Good", value: "good" },
  { label: "Okay", value: "okay" },
  { label: "Low", value: "low" },
  { label: "Bad", value: "bad" }
];

const energyLevels: Array<{ label: string; value: EnergyLevel; description: string }> = [
  { label: "Low", value: "low", description: "Tired, drained, or low capacity today." },
  { label: "Medium", value: "medium", description: "Steady enough to follow your normal routine." },
  { label: "High", value: "high", description: "Energized, focused, and ready to do more." }
];

export function CheckInForm() {
  const router = useRouter();
  const { logout } = useAuth();
  const [date, setDate] = useState(todayDateString());
  const [mood, setMood] = useState(moods[1].value);
  const [energy, setEnergy] = useState<EnergyLevel>("medium");
  const [note, setNote] = useState("");
  const [existingCheckIn, setExistingCheckIn] = useState<DailyCheckIn | null>(null);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUnauthorized = useCallback(async () => {
    await logout();
    router.replace("/login");
  }, [logout, router]);

  const loadExistingCheckIn = useCallback(
    async (checkInDate: string) => {
      if (!isDateInputValue(checkInDate)) return;

      setIsCheckingExisting(true);
      setError(null);

      try {
        const checkIn = await checkinsApi.getCheckinByDate(checkInDate);
        setExistingCheckIn(checkIn);
        setMood(normalizeMoodValue(checkIn.mood));
        setEnergy(checkIn.energy);
        setNote(checkIn.note ?? "");
      } catch (requestError) {
        if (requestError instanceof ApiClientError && requestError.statusCode === 401) {
          await handleUnauthorized();
          return;
        }

        if (requestError instanceof ApiClientError && requestError.statusCode === 404) {
          setExistingCheckIn(null);
          setMood(moods[1].value);
          setEnergy("medium");
          setNote("");
          return;
        }

        setError(requestError instanceof Error ? requestError.message : "Unable to check this date.");
      } finally {
        setIsCheckingExisting(false);
      }
    },
    [handleUnauthorized]
  );

  useEffect(() => {
    void loadExistingCheckIn(date);
  }, [date, loadExistingCheckIn]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isDateInputValue(date)) {
      setError("Choose a valid date.");
      return;
    }

    if (date > todayDateString()) {
      setError("Check-ins cannot be submitted for future dates.");
      return;
    }

    if (!mood) {
      setError("Choose a mood.");
      return;
    }

    if (!energy) {
      setError("Choose an energy level.");
      return;
    }

    const payload = {
      mood,
      energy,
      note: note.trim() || null
    };

    setIsSubmitting(true);

    try {
      const savedCheckIn = existingCheckIn
        ? await checkinsApi.updateCheckin(existingCheckIn.id, payload)
        : await checkinsApi.createCheckin({
            date,
            ...payload
          });

      setExistingCheckIn(savedCheckIn);
      setSuccess(existingCheckIn ? "Check-in updated." : "Check-in saved.");
    } catch (requestError) {
      if (requestError instanceof ApiClientError && requestError.statusCode === 409) {
        await updateDuplicateCheckIn(payload);
        return;
      }

      await handleSubmitError(requestError);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateDuplicateCheckIn(payload: { mood: string; energy: EnergyLevel; note: string | null }) {
    try {
      const checkIn = await checkinsApi.getCheckinByDate(date);
      const savedCheckIn = await checkinsApi.updateCheckin(checkIn.id, payload);
      setExistingCheckIn(savedCheckIn);
      setSuccess("Check-in updated for this date.");
    } catch (requestError) {
      await handleSubmitError(requestError);
    }
  }

  async function handleSubmitError(requestError: unknown) {
    if (requestError instanceof ApiClientError && requestError.statusCode === 401) {
      await handleUnauthorized();
      return;
    }

    setError(requestError instanceof Error ? requestError.message : "Unable to save check-in.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
      <Card>
        {success ? (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-sm font-semibold text-emerald-200">{success}</p>
            <p className="mt-1 text-sm text-slate-300">
              {moodLabelFromValue(mood)} mood with {energy} energy.
            </p>
          </div>
        ) : null}

        {existingCheckIn ? (
          <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
            A check-in already exists for this date. Saving will update it.
          </div>
        ) : null}

        <form className="grid gap-8" onSubmit={handleSubmit}>
          <section>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-white">How are you feeling?</p>
                <p className="mt-1 text-sm text-slate-500">Select your overall mood today.</p>
              </div>
              {isCheckingExisting ? <span className="text-xs text-slate-500">Checking...</span> : null}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
              {moods.map((item) => (
                <button
                  aria-label={item.label}
                  className={`min-h-36 rounded-2xl border px-3 py-4 text-center transition focus:outline-none focus:ring-2 focus:ring-violet-400/35 ${
                    mood === item.value
                      ? "border-violet-400/55 bg-violet-400/10 text-violet-100 shadow-[0_0_28px_rgba(139,92,246,0.14)]"
                      : "border-slate-800 bg-slate-950/45 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                  key={item.label}
                  onClick={() => setMood(item.value)}
                  type="button"
                >
                  <MoodIcon mood={item.label} selected={mood === item.value} />
                  <span className="mt-3 block text-sm font-semibold">{item.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="text-lg font-semibold text-white">What is your energy level?</p>
            <p className="mt-1 text-sm text-slate-500">How would you rate your energy today?</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {energyLevels.map((level) => (
                <button
                  className={`rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus:ring-2 focus:ring-violet-400/35 ${
                    energy === level.value
                      ? "border-violet-400/45 bg-violet-400/10 text-violet-100"
                      : "border-slate-800 bg-slate-950/45 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                  key={level.value}
                  onClick={() => setEnergy(level.value)}
                  type="button"
                >
                  <span className="block text-sm font-semibold">{level.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{level.description}</span>
                </button>
              ))}
            </div>
          </section>

          <TextareaField
            label="Notes"
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
            placeholder="How was your day? Any wins, challenges, or thoughts to remember?"
            value={note}
          />

          {error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-4 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">Consistency is the key to growth.</p>
            <Button className="w-full justify-center sm:w-fit sm:min-w-56" disabled={isSubmitting || isCheckingExisting} type="submit">
              {isSubmitting ? "Saving..." : existingCheckIn ? "Update check-in" : "Submit check-in"}
            </Button>
          </div>
        </form>
      </Card>

      <aside className="grid gap-4 self-start">
        <MonthlyCalendarPanel
          max={todayDateString()}
          onValueChange={setDate}
          title="Check-in date"
          value={date}
        />
        <CheckInContextPanel
          checking={isCheckingExisting}
          date={date}
          existingCheckIn={existingCheckIn}
        />
      </aside>
    </div>
  );
}

function CheckInContextPanel({
  checking,
  date,
  existingCheckIn
}: {
  checking: boolean;
  date: string;
  existingCheckIn: DailyCheckIn | null;
}) {
  const saved = Boolean(existingCheckIn);

  return (
    <Card>
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-emerald-300">Check-in status</p>
          <span className={`max-w-full shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
          saved ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-slate-700 bg-slate-950/60 text-slate-300"
        }`}>
            {date}
          </span>
        </div>
        <p className="text-2xl font-semibold leading-tight tracking-tight text-white">
          {checking ? "Checking..." : saved ? "Saved" : "Not submitted"}
        </p>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">
        {saved ? "Saving again will update this date." : "You can submit one check-in for this date."}
      </p>
      <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/45 p-3 text-xs leading-5 text-slate-500">
        Choose today or any past date to review your day. Future dates stay locked until they arrive.
      </div>
    </Card>
  );
}

function moodLabelFromValue(value: string): string {
  const knownMood = moods.find((item) => item.value === normalizeMoodValue(value));
  if (knownMood) return knownMood.label;

  return value.replace(/^[^\w]+/, "").trim() || "Selected";
}

function normalizeMoodValue(value: string): string {
  const normalized = value.toLowerCase().replace(/^[^\w]+/, "").trim();
  if (normalized.startsWith("great")) return "great";
  if (normalized.startsWith("good")) return "good";
  if (normalized.startsWith("okay") || normalized.startsWith("ok")) return "okay";
  if (normalized.startsWith("low")) return "low";
  if (normalized.startsWith("bad")) return "bad";
  return normalized;
}

function MoodIcon({ mood, selected }: { mood: string; selected: boolean }) {
  const mouthPath = {
    Great: "M8.5 15c1.4 2 4.6 2 6 0",
    Good: "M9 15c1.2 1.1 3.8 1.1 5 0",
    Okay: "M9 15h5",
    Low: "M8.8 16.2c1.4-1.3 4.4-1.3 5.8 0",
    Bad: "M8.5 16.5c1.5-2 4.5-2 6 0"
  }[mood] ?? "M9 15h5";

  const accent = {
    Great: "text-emerald-300",
    Good: "text-cyan-300",
    Okay: "text-violet-300",
    Low: "text-slate-300",
    Bad: "text-rose-300"
  }[mood] ?? "text-cyan-300";

  return (
    <span className={`mx-auto grid h-12 w-12 place-items-center rounded-full border transition ${
      selected ? "border-current bg-slate-950/80" : "border-slate-700 bg-slate-900/70"
    } ${accent}`}>
      <svg aria-hidden="true" className="h-8 w-8" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8.6 10.2h.01M15.4 10.2h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.8" />
        <path d={mouthPath} stroke="currentColor" strokeLinecap="round" strokeWidth="1.9" />
        {mood === "Great" ? <path d="M17.5 5.5 18 4l.5 1.5L20 6l-1.5.5L18 8l-.5-1.5L16 6l1.5-.5Z" fill="currentColor" /> : null}
      </svg>
    </span>
  );
}
