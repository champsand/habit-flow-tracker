interface ProgressBarProps {
  value: number;
  tone?: "emerald" | "cyan" | "violet" | "rose";
}

const tones = {
  emerald: "bg-emerald-400",
  cyan: "bg-cyan-400",
  violet: "bg-violet-400",
  rose: "bg-rose-400"
};

export function ProgressBar({ value, tone = "emerald" }: ProgressBarProps) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
      <div className={`h-full rounded-full ${tones[tone]}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
