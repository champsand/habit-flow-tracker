import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface WeeklyOverviewProps {
  progress: number;
  activeHabits: number;
  logsThisWeek: number;
  checkInStatus: string;
  targetsOnTrack: number;
}

export function WeeklyOverview({
  progress,
  activeHabits,
  logsThisWeek,
  checkInStatus,
  targetsOnTrack
}: WeeklyOverviewProps) {
  const metrics = [
    { label: "Active habits", value: String(activeHabits) },
    { label: "Logs this week", value: String(logsThisWeek) },
    { label: "Check-in", value: checkInStatus },
    { label: "Targets on track", value: `${targetsOnTrack}/${activeHabits}` }
  ];

  return (
    <Card>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-300">Weekly progress</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white">{progress}%</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Based on this week&apos;s logs and your weekly targets.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm font-medium text-slate-300">
          Current week
        </div>
      </div>

      <div className="mt-6">
        <ProgressBar value={progress} />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4" key={metric.label}>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{metric.label}</p>
            <p className="mt-2 text-lg font-semibold text-slate-100">{metric.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
