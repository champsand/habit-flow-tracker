import { apiClient } from "@/lib/api/client";
import { normalizeDateString } from "@/lib/date-utils";
import type {
  CreateAvoidanceLogInput,
  CreateHabitLogInput,
  HabitLog,
  HabitLogFilters,
  UpdateHabitLogInput
} from "@/types";

interface HabitLogListResponse {
  status: "success";
  logs: unknown[];
}

interface HabitLogResponse {
  status: "success";
  message?: string;
  log: unknown;
}

interface DeleteHabitLogResponse {
  status: "success";
  message: string;
}

export const habitLogsApi = {
  async getHabitLogs(filters: HabitLogFilters = {}): Promise<HabitLog[]> {
    const params = new URLSearchParams();
    if (filters.habitId) params.set("habitId", filters.habitId);
    if (filters.date) params.set("date", filters.date);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);

    const query = params.toString();
    const response = await apiClient.get<HabitLogListResponse>(`/api/habit-logs${query ? `?${query}` : ""}`);
    return response.logs.map(normalizeHabitLog);
  },

  async createHabitLog(input: CreateHabitLogInput): Promise<HabitLog> {
    const response = await apiClient.post<HabitLogResponse>("/api/habit-logs", input);
    return normalizeHabitLog(response.log);
  },

  async createAvoidanceLog(input: CreateAvoidanceLogInput): Promise<HabitLog> {
    const response = await apiClient.post<HabitLogResponse>("/api/habit-logs/avoid", input);
    return normalizeHabitLog(response.log);
  },

  async updateHabitLog(id: string, input: UpdateHabitLogInput): Promise<HabitLog> {
    const response = await apiClient.put<HabitLogResponse>(`/api/habit-logs/${encodeURIComponent(id)}`, input);
    return normalizeHabitLog(response.log);
  },

  async deleteHabitLog(id: string): Promise<DeleteHabitLogResponse> {
    return apiClient.delete<DeleteHabitLogResponse>(`/api/habit-logs/${encodeURIComponent(id)}`);
  }
};

function normalizeHabitLog(rawLog: unknown): HabitLog {
  const raw = asRecord(rawLog);

  return {
    id: toStringValue(raw.id),
    userId: toStringValue(raw.userId),
    habitId: toStringValue(raw.habitId),
    date: normalizeDateString(toStringValue(raw.date)) || toStringValue(raw.date),
    amount: toNumber(raw.amount),
    note: raw.note === null || raw.note === undefined ? null : toStringValue(raw.note),
    createdAt: raw.createdAt ? toStringValue(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? toStringValue(raw.updatedAt) : undefined
  };
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
