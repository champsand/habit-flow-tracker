import type { DailyRhythmItem } from "@/lib/progress-utils";

interface WeeklyBarsProps {
  data: DailyRhythmItem[];
  dateRange?: string;
  subtitle?: string;
}

export function WeeklyBars({ data, dateRange = "Current week", subtitle = "Real logs from this week" }: WeeklyBarsProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/75 p-5 shadow-soft shadow-black/10 sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Weekly rhythm</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">{dateRange}</span>
      </div>
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {data.map((item) => (
          <div
            className="rounded-2xl border border-slate-800 bg-slate-950/50 p-2 text-center transition hover:border-slate-700"
            key={item.day}
            title={`${item.day}: ${item.value}% from ${item.logCount} log${item.logCount === 1 ? "" : "s"}`}
          >
            <div className="mb-2 text-[11px] font-semibold text-slate-400">{item.day}</div>
            <div className="relative h-28 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-inner shadow-black/25">
              <div
                className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-500 via-emerald-400 to-cyan-300 transition-all ${item.value > 0 ? "min-h-1" : ""}`}
                style={{ height: `${Math.min(100, Math.max(0, item.value))}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] to-transparent" />
            </div>
            <div className="mt-2 text-xs font-semibold text-slate-100">{item.value}%</div>
            <div className="mt-1 text-[10px] text-slate-500">{item.logCount} log{item.logCount === 1 ? "" : "s"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
