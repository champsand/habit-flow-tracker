"use client";

import { useEffect, useState } from "react";
import { isDateInputValue, todayDateString, toDateInputValue } from "@/lib/date-utils";

interface MonthlyCalendarPanelProps {
  value: string;
  onValueChange: (value: string) => void;
  max?: string;
  min?: string;
  title?: string;
}

const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

export function MonthlyCalendarPanel({ value, onValueChange, max = todayDateString(), min = "", title = "Calendar" }: MonthlyCalendarPanelProps) {
  const selectedDate = isDateInputValue(value) ? new Date(`${value}T00:00:00`) : new Date();
  const selectedYear = selectedDate.getFullYear();
  const selectedMonth = selectedDate.getMonth();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const month = visibleMonth;
  const calendarDays = buildCalendarDays(month);
  const monthLabel = month.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const previousMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
  const nextMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  const canGoPrevious = !min || endOfMonth(previousMonth) >= dateFromString(min);
  const canGoNext = !max || nextMonth <= dateFromString(max);

  useEffect(() => {
    setVisibleMonth(new Date(selectedYear, selectedMonth, 1));
  }, [selectedMonth, selectedYear]);

  function selectDate(nextValue: string) {
    if (!isSelectable(nextValue, min, max)) return;
    onValueChange(nextValue);
  }

  function goToMonth(offset: number) {
    setVisibleMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/75 p-5 shadow-soft shadow-black/10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            aria-label="Previous month"
            className="grid h-8 w-8 place-items-center rounded-xl border border-slate-700 bg-slate-950/60 text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!canGoPrevious}
            onClick={() => goToMonth(-1)}
            type="button"
          >
            <span aria-hidden="true">{"<"}</span>
          </button>
          <button
            aria-label="Next month"
            className="grid h-8 w-8 place-items-center rounded-xl border border-slate-700 bg-slate-950/60 text-slate-300 transition hover:border-slate-600 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!canGoNext}
            onClick={() => goToMonth(1)}
            type="button"
          >
            <span aria-hidden="true">{">"}</span>
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-500">
        {weekdayLabels.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {calendarDays.map((day) => {
          const dayValue = toDateInputValue(day.date);
          const selected = dayValue === value;
          const today = dayValue === todayDateString();
          const disabled = !isSelectable(dayValue, min, max);

          return (
            <button
              className={`aspect-square rounded-xl text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400/25 disabled:cursor-not-allowed disabled:opacity-30 ${
                selected
                  ? "bg-emerald-400 text-slate-950"
                  : day.isCurrentMonth
                    ? "bg-slate-950/60 text-slate-200 hover:bg-slate-800"
                    : "text-slate-700 hover:bg-slate-950/50"
              } ${today && !selected ? "ring-1 ring-cyan-300/50" : ""}`}
              disabled={disabled}
              key={dayValue}
              onClick={() => selectDate(dayValue)}
              type="button"
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function buildCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
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

function isSelectable(value: string, min: string, max: string): boolean {
  if (!isDateInputValue(value)) return false;
  if (min && value < min) return false;
  if (max && value > max) return false;
  return true;
}

function dateFromString(value: string): Date {
  return isDateInputValue(value) ? new Date(`${value}T00:00:00`) : new Date(0);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
