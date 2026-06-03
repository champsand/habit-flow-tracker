import { Icon } from "@/components/ui/Icon";

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function ErrorState({
  title = "Something needs attention",
  description = "We couldn't complete that request. Please try again in a moment.",
  action
}: ErrorStateProps) {
  return (
    <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-6">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-400/10 text-rose-300">
        <Icon name="settings" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-rose-100/70">{description}</p>
      {action}
    </div>
  );
}
