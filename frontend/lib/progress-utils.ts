import { normalizeDateString, toDateInputValue } from "@/lib/date-utils";
import type { Habit, HabitLog } from "@/types";

export interface WeekRange {
  start: string;
  end: string;
  label: string;
}

export interface DailyRhythmItem {
  day: string;
  date: string;
  value: number;
  logCount: number;
  amount: number;
}

export function getCurrentWeekRange(): WeekRange {
  const today = new Date();
  const monday = new Date(today);
  const day = today.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  monday.setDate(today.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: toDateInputValue(monday),
    end: toDateInputValue(sunday),
    label: `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
  };
}

export function filterLogsForWeek(logs: HabitLog[], weekRange: WeekRange): HabitLog[] {
  return logs.filter((log) => {
    const logDate = normalizeDateString(log.date);
    return logDate >= weekRange.start && logDate <= weekRange.end;
  });
}

export function calculateHabitWeeklyProgress(habit: Habit, logs: HabitLog[]): number {
  const habitLogs = logs.filter((log) => log.habitId === habit.id && log.amount > 0);

  if (habit.type === "checklist" || habit.category === "bad") {
    return new Set(habitLogs.map((log) => normalizeDateString(log.date)).filter(Boolean)).size;
  }

  return habitLogs.reduce((total, log) => total + log.amount, 0);
}

export function attachWeeklyProgress(habits: Habit[], logs: HabitLog[]): Habit[] {
  return habits.map((habit) => ({
    ...habit,
    weeklyProgress: calculateHabitWeeklyProgress(habit, logs)
  }));
}

export function buildDailyRhythm(habits: Habit[], logs: HabitLog[], weekStart: string): DailyRhythmItem[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekStartDate = new Date(`${weekStart}T00:00:00`);

  return days.map((day, index) => {
    const currentDate = new Date(weekStartDate);
    currentDate.setDate(weekStartDate.getDate() + index);
    const date = toDateInputValue(currentDate);
    const dayLogs = logs.filter((log) => normalizeDateString(log.date) === date && log.amount > 0);
    const rawValue = dayLogs.reduce((total, log) => {
      const habit = habits.find((item) => item.id === log.habitId);
      if (!habit || habit.weeklyTarget <= 0) return total;
      const contribution = (getLogProgressAmount(habit, log) / habit.weeklyTarget) * 100;
      return total + contribution;
    }, 0);
    const roundedValue = Math.round(rawValue);

    return {
      day,
      date,
      value: rawValue > 0 && roundedValue === 0 ? 1 : Math.min(100, roundedValue),
      logCount: dayLogs.length,
      amount: dayLogs.reduce((total, log) => total + log.amount, 0)
    };
  });
}

function getLogProgressAmount(habit: Habit, log: HabitLog): number {
  if (habit.type === "checklist" || habit.category === "bad") return log.amount > 0 ? 1 : 0;
  return log.amount;
}
