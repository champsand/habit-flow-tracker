import { ApiClientError, apiClient } from "@/lib/api/client";
import { normalizeDateString } from "@/lib/date-utils";
import type {
  GenerateWeeklySummaryInput,
  HabitCategory,
  HabitProgressItem,
  HabitRankingItem,
  HabitType,
  WeeklySummary,
  WeeklySummaryStatus
} from "@/types";

interface WeeklySummaryResponse {
  status: "success";
  message?: string;
  weeklySummary?: unknown;
  summary?: unknown;
  data?: unknown;
}

const habitTypes: HabitType[] = ["checklist", "frequency", "duration"];
const habitCategories: HabitCategory[] = ["good", "bad"];
const summaryStatuses: WeeklySummaryStatus[] = ["preview", "generated", "not_generated"];

export const weeklySummaryApi = {
  async getCurrentWeeklySummary(): Promise<WeeklySummary | null> {
    try {
      const response = await apiClient.get<WeeklySummaryResponse>("/api/weekly-summary/current", { timeoutMs: 8000 });
      return normalizeWeeklySummary(extractSummaryPayload(response));
    } catch (error) {
      if (error instanceof ApiClientError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  async getWeeklySummaryById(id: string): Promise<WeeklySummary | null> {
    try {
      const response = await apiClient.get<WeeklySummaryResponse>(`/api/weekly-summary/${encodeURIComponent(id)}`, { timeoutMs: 8000 });
      return normalizeWeeklySummary(extractSummaryPayload(response));
    } catch (error) {
      if (error instanceof ApiClientError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  },

  async generateWeeklySummary(input: GenerateWeeklySummaryInput = {}): Promise<WeeklySummary | null> {
    const response = await apiClient.post<WeeklySummaryResponse>("/api/weekly-summary/generate", input, { timeoutMs: 30000 });
    return normalizeWeeklySummary(extractSummaryPayload(response));
  }
};

function extractSummaryPayload(response: WeeklySummaryResponse | WeeklySummary | null): unknown {
  if (!response) return null;

  if ("weeklySummary" in response || "summary" in response || "data" in response) {
    const payload = response.weeklySummary ?? response.summary ?? response.data ?? null;
    if (payload && typeof payload === "object" && ("weeklySummary" in payload || "summary" in payload || "data" in payload)) {
      return extractSummaryPayload(payload as WeeklySummaryResponse);
    }
    return payload;
  }

  return response;
}

function normalizeWeeklySummary(rawSummary: unknown): WeeklySummary | null {
  if (!rawSummary) return null;

  const raw = asRecord(rawSummary);
  const rankingData = normalizeProgressList(raw.rankingData);
  const progressData = normalizeProgressList(raw.progressData);

  return {
    id: raw.id === null || raw.id === undefined ? null : toStringValue(raw.id),
    userId: toStringValue(raw.userId),
    weekStartDate: normalizeDateString(toStringValue(raw.weekStartDate ?? raw.weekStart)) || toStringValue(raw.weekStartDate ?? raw.weekStart),
    weekEndDate: normalizeDateString(toStringValue(raw.weekEndDate ?? raw.weekEnd)) || toStringValue(raw.weekEndDate ?? raw.weekEnd),
    rankingData,
    progressData,
    topHabit: normalizeProgressItem(raw.topHabit),
    habitsNeedingAttention: normalizeProgressList(raw.habitsNeedingAttention),
    insightText: toNullableString(raw.insightText),
    recommendationText: toNullableString(raw.recommendationText ?? raw.recommendation),
    status: normalizeStatus(raw.status),
    checkinCount: toOptionalNumber(raw.checkinCount),
    targetsAchieved: toOptionalNumber(raw.targetsAchieved),
    totalHabits: toOptionalNumber(raw.totalHabits),
    readableSummary: toNullableString(raw.readableSummary) ?? undefined,
    isInsightStale: typeof raw.isInsightStale === "boolean" ? raw.isInsightStale : undefined,
    generatedAt: toNullableString(raw.generatedAt),
    createdAt: toNullableString(raw.createdAt),
    updatedAt: toNullableString(raw.updatedAt)
  };
}

function normalizeProgressList(value: unknown): HabitProgressItem[] {
  if (Array.isArray(value)) {
    return value.map(normalizeProgressItem).filter(Boolean) as HabitProgressItem[];
  }

  if (value && typeof value === "object") {
    return Object.values(value).map(normalizeProgressItem).filter(Boolean) as HabitProgressItem[];
  }

  return [];
}

function normalizeProgressItem(value: unknown): HabitRankingItem | null {
  if (!value || typeof value !== "object") return null;

  const raw = value as Record<string, unknown>;
  const score = clamp01(toNumber(raw.score ?? raw.consistency));
  const consistency = Math.round(score * 100);

  return {
    habitId: toStringValue(raw.habitId ?? raw.id),
    name: toStringValue(raw.name ?? raw.habitName),
    type: normalizeHabitType(raw.type),
    category: normalizeHabitCategory(raw.category),
    weeklyTarget: toNumber(raw.weeklyTarget),
    isActive: raw.isActive !== false,
    logCount: toNumber(raw.logCount),
    progressAmount: toNumber(raw.progressAmount ?? raw.currentValue),
    progressLabel: toStringValue(raw.progressLabel),
    score,
    consistency,
    targetAchieved: Boolean(raw.targetAchieved ?? raw.achieved)
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

function normalizeStatus(value: unknown): WeeklySummaryStatus {
  const normalized = String(value ?? "").toLowerCase();
  return summaryStatuses.includes(normalized as WeeklySummaryStatus) ? (normalized as WeeklySummaryStatus) : "not_generated";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const stringValue = toStringValue(value).trim();
  return stringValue || null;
}

function toNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value > 1) return value > 100 ? 1 : value / 100;
  return value;
}
