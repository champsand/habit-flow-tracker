import { apiClient } from "@/lib/api/client";
import type { CreateHabitInput, Habit, HabitCategory, HabitType, UpdateHabitInput } from "@/types";

interface HabitListResponse {
  status: "success";
  habits: unknown[];
}

interface HabitResponse {
  status: "success";
  message?: string;
  habit: unknown;
}

interface DeleteHabitResponse {
  status: "success";
  message: string;
}

const habitTypes: HabitType[] = ["checklist", "frequency", "duration"];
const habitCategories: HabitCategory[] = ["good", "bad"];

export const habitsApi = {
  async getHabits(): Promise<Habit[]> {
    const response = await apiClient.get<HabitListResponse>("/api/habits");
    return response.habits.map(normalizeHabit);
  },

  async getHabitById(id: string): Promise<Habit> {
    const response = await apiClient.get<HabitResponse>(`/api/habits/${encodeURIComponent(id)}`);
    return normalizeHabit(response.habit);
  },

  async createHabit(input: CreateHabitInput): Promise<Habit> {
    const response = await apiClient.post<HabitResponse>("/api/habits", input);
    return normalizeHabit(response.habit);
  },

  async updateHabit(id: string, input: UpdateHabitInput): Promise<Habit> {
    const response = await apiClient.put<HabitResponse>(`/api/habits/${encodeURIComponent(id)}`, input);
    return normalizeHabit(response.habit);
  },

  async deleteHabit(id: string): Promise<DeleteHabitResponse> {
    return apiClient.delete<DeleteHabitResponse>(`/api/habits/${encodeURIComponent(id)}`);
  }
};

function normalizeHabit(rawHabit: unknown): Habit {
  const raw = asRecord(rawHabit);
  const category = normalizeHabitCategory(raw.category);
  const type = normalizeHabitType(raw.type);
  const weeklyProgress = toOptionalNumber(raw.weeklyProgress);

  return {
    id: toStringValue(raw.id),
    userId: toStringValue(raw.userId),
    name: toStringValue(raw.name),
    type,
    category,
    weeklyTarget: toNumber(raw.weeklyTarget),
    weeklyProgress,
    isActive: raw.isActive !== false,
    createdAt: toStringValue(raw.createdAt),
    updatedAt: raw.updatedAt ? toStringValue(raw.updatedAt) : undefined
  };
}

function normalizeHabitType(value: unknown): HabitType {
  const normalized = String(value ?? "").toLowerCase();
  return habitTypes.includes(normalized as HabitType) ? (normalized as HabitType) : "checklist";
}

function normalizeHabitCategory(value: unknown): HabitCategory {
  const normalized = String(value ?? "").toLowerCase();
  return habitCategories.includes(normalized as HabitCategory) ? (normalized as HabitCategory) : "good";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}

function toNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null) return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}
