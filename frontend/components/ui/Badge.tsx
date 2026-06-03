import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "emerald" | "cyan" | "violet" | "slate" | "rose";
}

const tones = {
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  violet: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  slate: "border-slate-700 bg-slate-800 text-slate-300",
  rose: "border-rose-400/20 bg-rose-400/10 text-rose-300"
};

export function Badge({ children, tone = "slate" }: BadgeProps) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
