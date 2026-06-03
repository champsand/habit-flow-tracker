export type HabitType = "checklist" | "frequency" | "duration";

export type HabitCategory = "good" | "bad";

export type EnergyLevel = "low" | "medium" | "high";

export interface MoodOption {
  label: string;
  value: string;
}

export type WeeklySummaryStatus = "preview" | "generated" | "not_generated";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  type: HabitType;
  category: HabitCategory;
  weeklyTarget: number;
  weeklyProgress?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateHabitInput {
  name: string;
  type: HabitType;
  category: HabitCategory;
  weeklyTarget: number;
  isActive?: boolean;
}

export type UpdateHabitInput = Partial<CreateHabitInput>;

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  amount: number;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string;
  mood: string;
  energy: EnergyLevel;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHabitLogInput {
  habitId: string;
  date: string;
  amount: number;
  note?: string | null;
}

export interface CreateAvoidanceLogInput {
  habitId: string;
  date: string;
  note?: string | null;
}

export interface HabitLogFilters {
  habitId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export type UpdateHabitLogInput = Partial<Omit<CreateHabitLogInput, "habitId">>;

export interface CreateCheckInInput {
  date: string;
  mood: string;
  energy: EnergyLevel;
  note?: string | null;
}

export type UpdateCheckInInput = Partial<Omit<CreateCheckInInput, "date">>;

export interface HabitProgressItem {
  habitId: string;
  name: string;
  type: HabitType;
  category: HabitCategory;
  weeklyTarget: number;
  isActive: boolean;
  logCount: number;
  progressAmount: number;
  progressLabel: string;
  score: number;
  consistency: number;
  targetAchieved: boolean;
}

export type HabitRankingItem = HabitProgressItem;

export interface WeeklySummary {
  id: string | null;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  rankingData: HabitRankingItem[];
  progressData: HabitProgressItem[];
  topHabit: HabitProgressItem | null;
  habitsNeedingAttention: HabitProgressItem[];
  insightText: string | null;
  recommendationText: string | null;
  status: WeeklySummaryStatus;
  checkinCount?: number;
  targetsAchieved?: number;
  totalHabits?: number;
  readableSummary?: string;
  isInsightStale?: boolean;
  generatedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface GenerateWeeklySummaryInput {
  weekDate?: string;
}

export interface GenerateWeeklySummaryResponse {
  status: "success";
  message?: string;
  weeklySummary: WeeklySummary;
}

export interface AiInsight {
  insightText: string;
}

export interface AiRecommendation {
  recommendationText: string;
}

export interface DashboardStats {
  habitsCompleted: number;
  habitsRemaining: number;
  checkInStatus: "done" | "pending" | "missed";
  weeklyProgress: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  status: "success";
  message?: string;
  user: User;
  token?: string;
}

export interface CurrentUserResponse {
  status: "success";
  user: User;
}

export interface ApiError {
  status: "error";
  message: string;
  details?: Record<string, string>;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedAuth: boolean;
  error: string | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  loadCurrentUser: () => Promise<void>;
  clearError: () => void;
}
