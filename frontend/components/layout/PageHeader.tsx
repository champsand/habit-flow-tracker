import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({ title, eyebrow = "Habit Flow", description, children }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <Badge tone="cyan">{eyebrow}</Badge>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-3">{children}</div> : null}
    </header>
  );
}
