import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";

interface InsightCardProps {
  title?: string;
  insight: string;
  recommendation: string;
}

export function InsightCard({ title = "AI insight preview", insight, recommendation }: InsightCardProps) {
  return (
    <article className="rounded-3xl border border-violet-400/20 bg-violet-400/10 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <Badge tone="violet">{title}</Badge>
        <Icon className="h-5 w-5 text-violet-300" name="spark" />
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-200">{insight}</p>
      <div className="mt-5 rounded-2xl border border-violet-400/15 bg-slate-950/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-300">Recommendation</p>
        <p className="mt-2 text-sm text-slate-300">{recommendation}</p>
      </div>
    </article>
  );
}
