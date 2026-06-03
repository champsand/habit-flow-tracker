import type { IconName } from "@/components/ui/Icon";
import { Icon } from "@/components/ui/Icon";

interface StatCardProps {
  label: string;
  value: string;
  detail: string;
  icon: IconName;
  tone?: "emerald" | "cyan" | "violet";
}

const tones = {
  emerald: "bg-emerald-400/10 text-emerald-300",
  cyan: "bg-cyan-400/10 text-cyan-300",
  violet: "bg-violet-400/10 text-violet-300"
};

export function StatCard({ label, value, detail, icon, tone = "emerald" }: StatCardProps) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900/75 p-5 shadow-soft shadow-black/10 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{value}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${tones[tone]}`}>
          <Icon name={icon} />
        </div>
      </div>
      <p className="mt-4 text-sm leading-5 text-slate-500">{detail}</p>
    </article>
  );
}
