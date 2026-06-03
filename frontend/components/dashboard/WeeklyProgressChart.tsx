import type { Habit, HabitLog } from "@/types";
import { normalizeDateString, toDateInputValue } from "@/lib/date-utils";

interface WeeklyProgressChartProps {
  habits: Habit[];
  logs: HabitLog[];
  weekStart: string;
  today: string;
}

interface ChartPoint {
  day: string;
  date: string;
  value: number;
  isFuture: boolean;
  index: number;
}

const chartWidth = 680;
const chartHeight = 208;
const plot = {
  left: 46,
  right: 24,
  top: 20,
  bottom: 34
};
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyProgressChart({ habits, logs, weekStart, today }: WeeklyProgressChartProps) {
  const points = buildChartPoints(habits, logs, weekStart, today);
  const activePoints = points.filter((point) => !point.isFuture);
  const futurePoints = buildFuturePathPoints(points, activePoints);
  const currentProgress = activePoints.at(-1)?.value ?? 0;
  const activePath = toPath(activePoints);
  const futurePath = toPath(futurePoints);
  const areaPath = activePoints.length ? `${activePath} L ${pointX(activePoints.at(-1)!)} ${chartHeight - plot.bottom} L ${plot.left} ${chartHeight - plot.bottom} Z` : "";

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-emerald-300">Weekly progress</p>
          <div className="mt-1.5 flex flex-wrap items-end gap-x-3 gap-y-1">
            <h2 className="text-6xl font-semibold leading-none tracking-tight text-white">{currentProgress}%</h2>
            <p className="pb-1 text-sm leading-6 text-slate-500">Cumulative progress from Monday to Sunday.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-3.5 py-2.5 text-xs font-medium text-slate-400">
          Week resets Monday
        </div>
      </div>

      <svg aria-label="Weekly cumulative progress chart" className="max-h-[240px] w-full overflow-visible" role="img" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <defs>
          <linearGradient id="weeklyLine" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="weeklyArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[100, 50, 0].map((tick) => (
          <g key={tick}>
            <line
              stroke={tick === 0 ? "#334155" : "#1f2937"}
              strokeDasharray={tick === 0 ? "0" : "4 7"}
              x1={plot.left}
              x2={chartWidth - plot.right}
              y1={valueY(tick)}
              y2={valueY(tick)}
            />
            <text fill="#64748b" fontSize="11" x="0" y={valueY(tick) + 4}>
              {tick}%
            </text>
          </g>
        ))}

        {areaPath ? <path d={areaPath} fill="url(#weeklyArea)" /> : null}
        {activePath ? <path d={activePath} fill="none" stroke="url(#weeklyLine)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" /> : null}
        {futurePath ? <path d={futurePath} fill="none" stroke="#475569" strokeDasharray="7 8" strokeLinecap="round" strokeWidth="2.6" /> : null}

        {points.map((point) => {
          const x = pointX(point);
          const y = pointY(point);

          return (
            <g key={point.day}>
              <circle
                cx={x}
                cy={y}
                fill={point.isFuture ? "#0f172a" : "#020617"}
                r="6.2"
                stroke={point.isFuture ? "#64748b" : "#34d399"}
                strokeWidth="2.6"
              />
              <text fill={point.isFuture ? "#64748b" : "#cbd5e1"} fontSize="12" textAnchor="middle" x={x} y={chartHeight - 7}>
                {point.day}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function buildChartPoints(habits: Habit[], logs: HabitLog[], weekStart: string, today: string): ChartPoint[] {
  const activeHabits = habits.filter((habit) => habit.isActive);
  const weekStartDate = new Date(`${weekStart}T00:00:00`);
  let lastKnownValue = 0;

  return days.map((day, index) => {
    const currentDate = new Date(weekStartDate);
    currentDate.setDate(weekStartDate.getDate() + index);
    const date = toDateInputValue(currentDate);
    const isFuture = date > today;
    const value = isFuture ? lastKnownValue : calculateAverageHabitProgress(activeHabits, logs, date);

    if (!isFuture) {
      lastKnownValue = value;
    }

    return {
      day,
      date,
      value,
      isFuture,
      index
    };
  });
}

function calculateAverageHabitProgress(habits: Habit[], logs: HabitLog[], date: string): number {
  if (!habits.length) {
    return 0;
  }

  const habitPercentTotal = habits.reduce((total, habit) => {
    const habitProgress = calculateHabitProgressThroughDate(habit, logs, date);
    const weeklyTarget = Number.isFinite(habit.weeklyTarget) && habit.weeklyTarget > 0 ? habit.weeklyTarget : 1;
    const habitPercent = Math.min(100, Math.round((habitProgress / weeklyTarget) * 100));
    return total + habitPercent;
  }, 0);

  return Math.round(habitPercentTotal / habits.length);
}

function calculateHabitProgressThroughDate(habit: Habit, logs: HabitLog[], date: string): number {
  const habitLogs = logs.filter((log) => {
    const logDate = normalizeDateString(log.date);
    return log.habitId === habit.id && log.amount > 0 && logDate <= date;
  });

  if (habit.category === "bad" || habit.type === "checklist") {
    return new Set(habitLogs.map((log) => normalizeDateString(log.date))).size;
  }

  return habitLogs.reduce((total, log) => total + log.amount, 0);
}

function buildFuturePathPoints(points: ChartPoint[], activePoints: ChartPoint[]) {
  const futurePoints = points.filter((point) => point.isFuture);
  if (!futurePoints.length) return [];
  const anchorPoint = activePoints.at(-1);
  return anchorPoint ? [anchorPoint, ...futurePoints] : futurePoints;
}

function toPath(points: ChartPoint[]) {
  if (!points.length) return "";
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${pointX(point)} ${pointY(point)}`)
    .join(" ");
}

function pointX(point: ChartPoint) {
  const width = chartWidth - plot.left - plot.right;
  return plot.left + (width / (days.length - 1)) * point.index;
}

function pointY(point: ChartPoint) {
  return valueY(point.value);
}

function valueY(value: number) {
  const height = chartHeight - plot.top - plot.bottom;
  return plot.top + ((100 - Math.min(100, Math.max(0, value))) / 100) * height;
}
