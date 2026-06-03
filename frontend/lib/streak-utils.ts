import { normalizeDateString, todayDateString, toDateInputValue } from "@/lib/date-utils";
import type { HabitLog } from "@/types";

export function getCurrentActivityStreak(logs: HabitLog[], today = todayDateString()): number {
  const activeDates = new Set(
    logs
      .filter((log) => log.amount > 0)
      .map((log) => normalizeDateString(log.date))
      .filter((date) => date && date <= today)
  );

  if (!activeDates.has(today)) return 0;

  let streak = 0;
  const cursor = new Date(`${today}T00:00:00`);

  while (activeDates.has(toDateInputValue(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
