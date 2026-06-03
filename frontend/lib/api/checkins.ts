import { apiClient } from "@/lib/api/client";
import { normalizeDateString } from "@/lib/date-utils";
import type { CreateCheckInInput, DailyCheckIn, EnergyLevel, UpdateCheckInInput } from "@/types";

interface CheckInListResponse {
  status: "success";
  checkins: unknown[];
}

interface CheckInResponse {
  status: "success";
  message?: string;
  checkin: unknown;
}

const energyLevels: EnergyLevel[] = ["low", "medium", "high"];

export const checkinsApi = {
  async getCheckins(): Promise<DailyCheckIn[]> {
    const response = await apiClient.get<CheckInListResponse>("/api/checkins");
    return response.checkins.map(normalizeCheckIn);
  },

  async getCheckinByDate(date: string): Promise<DailyCheckIn> {
    const response = await apiClient.get<CheckInResponse>(`/api/checkins/${encodeURIComponent(date)}`);
    return normalizeCheckIn(response.checkin);
  },

  async createCheckin(input: CreateCheckInInput): Promise<DailyCheckIn> {
    const response = await apiClient.post<CheckInResponse>("/api/checkins", input);
    return normalizeCheckIn(response.checkin);
  },

  async updateCheckin(id: string, input: UpdateCheckInInput): Promise<DailyCheckIn> {
    const response = await apiClient.put<CheckInResponse>(`/api/checkins/${encodeURIComponent(id)}`, input);
    return normalizeCheckIn(response.checkin);
  }
};

function normalizeCheckIn(rawCheckIn: unknown): DailyCheckIn {
  const raw = asRecord(rawCheckIn);

  return {
    id: toStringValue(raw.id),
    userId: toStringValue(raw.userId),
    date: normalizeDateString(toStringValue(raw.date)) || toStringValue(raw.date),
    mood: normalizeMood(raw.mood),
    energy: normalizeEnergy(raw.energy),
    note: raw.note === null || raw.note === undefined ? null : toStringValue(raw.note),
    createdAt: raw.createdAt ? toStringValue(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? toStringValue(raw.updatedAt) : undefined
  };
}

function normalizeEnergy(value: unknown): EnergyLevel {
  const normalized = String(value ?? "").toLowerCase();
  return energyLevels.includes(normalized as EnergyLevel) ? (normalized as EnergyLevel) : "medium";
}

function normalizeMood(value: unknown): string {
  const normalized = String(value ?? "")
    .toLowerCase()
    .replace(/^[^\w]+/, "")
    .trim();

  if (normalized.startsWith("great")) return "great";
  if (normalized.startsWith("good")) return "good";
  if (normalized.startsWith("okay") || normalized.startsWith("ok")) return "okay";
  if (normalized.startsWith("low")) return "low";
  if (normalized.startsWith("bad")) return "bad";
  return normalized;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}
