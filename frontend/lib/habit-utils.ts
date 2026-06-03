import type { Habit } from "@/types";

export function habitProgressPercent(habit: Habit): number {
  if (habit.weeklyProgress === undefined || habit.weeklyTarget <= 0) return 0;
  const percent = Math.round((habit.weeklyProgress / habit.weeklyTarget) * 100);
  if (habit.weeklyProgress > 0 && percent === 0) return 1;
  return Math.min(100, percent);
}

export function habitUnitLabel(habit: Habit): string {
  if (habit.weeklyProgress === undefined) return habitTargetLabel(habit);
  if (habit.category === "bad") return `${habit.weeklyProgress}/${habit.weeklyTarget} avoidance days`;
  if (habit.type === "duration") return `${habit.weeklyProgress}/${habit.weeklyTarget} min`;
  if (habit.type === "frequency") return `${habit.weeklyProgress}/${habit.weeklyTarget} times`;
  return `${habit.weeklyProgress}/${habit.weeklyTarget} days`;
}

export function habitTargetLabel(habit: Habit): string {
  if (habit.category === "bad") return `${habit.weeklyTarget} avoidance days / week`;
  if (habit.type === "duration") return `${habit.weeklyTarget} min / week`;
  if (habit.type === "frequency") return `${habit.weeklyTarget} times / week`;
  return `${habit.weeklyTarget} days / week`;
}

export function habitTypeLabel(type: Habit["type"]): string {
  return {
    checklist: "Checklist",
    frequency: "Frequency",
    duration: "Duration"
  }[type];
}

export function categoryLabel(category: Habit["category"]): string {
  return category === "bad" ? "Bad habit" : "Good habit";
}
