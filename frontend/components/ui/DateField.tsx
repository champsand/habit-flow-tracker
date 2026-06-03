"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { isDateInputValue, normalizeDateString, todayDateString, toDateInputValue } from "@/lib/date-utils";

interface DateFieldProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  hint?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
}

const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

export function DateField({ label, value, onValueChange, hint, min, max, disabled = false, className = "" }: DateFieldProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selectedDate = useMemo(() => parseDate(value) ?? new Date(), [value]);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(selectedDate));
  const normalizedValue = normalizeDateString(value);

  useEffect(() => {
    setVisibleMonth(startOfMonth(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const monthLabel = visibleMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const minDate = normalizeDateString(min);
  const maxDate = normalizeDateString(max);
  const displayLabel = normalizedValue
    ? parseDate(normalizedValue)?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "Choose date";

  function selectDate(nextValue: string) {
    if (!isSelectable(nextValue, minDate, maxDate)) return;
    onValueChange(nextValue);
    setIsOpen(false);
  }

  return (
    <div className={`relative grid gap-2 ${className}`} ref={wrapperRef}>
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <button
        className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-left outline-none transition hover:border-slate-600 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/15">
          <CalendarIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-slate-100">{displayLabel}</span>
          <span className="mt-0.5 block text-xs text-slate-500">{normalizedValue || "YYYY-MM-DD"}</span>
        </span>
      </button>
      {isOpen ? (
        <div className="absolute left-0 right-0 top-[5.25rem] z-40 rounded-3xl border border-slate-700 bg-slate-950 p-4 shadow-2xl shadow-black/40">
          <div className="flex items-center justify-between gap-3">
            <button
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-800 text-slate-300 transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
              type="button"
            >
              &lt;
            </button>
            <div className="text-sm font-semibold text-white">{monthLabel}</div>
            <button
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-800 text-slate-300 transition hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
              type="button"
            >
              &gt;
            </button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-500">
            {weekdayLabels.map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dayValue = toDateInputValue(day.date);
              const isSelected = dayValue === normalizedValue;
              const isToday = dayValue === todayDateString();
              const disabledDay = !isSelectable(dayValue, minDate, maxDate);

              return (
                <button
                  className={`aspect-square rounded-xl text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-35 ${
                    isSelected
                      ? "bg-emerald-400 text-slate-950"
                      : day.isCurrentMonth
                        ? "bg-slate-900 text-slate-200 hover:bg-slate-800"
                        : "bg-transparent text-slate-600 hover:bg-slate-900/60"
                  } ${isToday && !isSelected ? "ring-1 ring-cyan-300/45" : ""}`}
                  disabled={disabledDay}
                  key={dayValue}
                  onClick={() => selectDate(dayValue)}
                  type="button"
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
          <button
            className="mt-3 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!isSelectable(todayDateString(), minDate, maxDate)}
            onClick={() => selectDate(todayDateString())}
            type="button"
          >
            Today
          </button>
        </div>
      ) : null}
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M7 4v3M17 4v3M5 9h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path
        d="M6.5 6h11A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-9A2.5 2.5 0 0 1 6.5 6Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 16h.01M12 16h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
    </svg>
  );
}

function parseDate(value: string): Date | null {
  const normalized = normalizeDateString(value);
  if (!isDateInputValue(normalized)) return null;
  return new Date(`${normalized}T00:00:00`);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function buildCalendarDays(month: Date) {
  const firstDay = startOfMonth(month);
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);

    return {
      date,
      isCurrentMonth: date.getMonth() === month.getMonth()
    };
  });
}

function isSelectable(value: string, minDate: string, maxDate: string): boolean {
  if (!isDateInputValue(value)) return false;
  if (minDate && value < minDate) return false;
  if (maxDate && value > maxDate) return false;
  return true;
}
