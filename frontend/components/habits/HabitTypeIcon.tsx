import type { Habit } from "@/types";

interface HabitTypeIconProps {
  habit: Pick<Habit, "category" | "type">;
  size?: "sm" | "md";
}

const sizes = {
  sm: "h-10 w-10",
  md: "h-12 w-12"
};

export function HabitTypeIcon({ habit, size = "md" }: HabitTypeIconProps) {
  const concept = habit.category === "bad" ? "avoidance" : habit.type;
  const styles = {
    avoidance: "border-rose-400/30 bg-rose-400/10 text-rose-300 shadow-[0_0_16px_rgba(251,113,133,0.12)]",
    checklist: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 shadow-[0_0_16px_rgba(52,211,153,0.12)]",
    duration: "border-violet-400/30 bg-violet-400/10 text-violet-300 shadow-[0_0_16px_rgba(167,139,250,0.12)]",
    frequency: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.12)]"
  };

  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl border ${sizes[size]} ${styles[concept]}`}>
      <span className="absolute inset-px rounded-[15px] bg-slate-950/18" />
      {concept === "avoidance" ? <AvoidanceIcon /> : null}
      {concept === "checklist" ? <ChecklistIcon /> : null}
      {concept === "duration" ? <DurationIcon /> : null}
      {concept === "frequency" ? <FrequencyIcon /> : null}
    </span>
  );
}

function FrequencyIcon() {
  return (
    <svg aria-hidden="true" className="relative h-7 w-7" fill="none" viewBox="0 0 24 24">
      <path d="M7 10.1a5 5 0 0 1 8.6-2.1l1.3 1.3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M17 6.2v3.2h-3.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M17 13.9a5 5 0 0 1-8.6 2.1l-1.3-1.3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M7 17.8v-3.2h3.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function ChecklistIcon() {
  return (
    <svg aria-hidden="true" className="relative h-7 w-7" fill="none" viewBox="0 0 24 24">
      <path d="m7 13 3.3 3.3L17.4 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" />
    </svg>
  );
}

function DurationIcon() {
  return (
    <svg aria-hidden="true" className="relative h-7 w-7" fill="none" viewBox="0 0 24 24">
      <path d="M9 4.8h6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <circle cx="12" cy="13.1" r="6.1" stroke="currentColor" strokeWidth="1.9" />
      <path d="M12 9.5v3.8l2.7 1.6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.1" />
    </svg>
  );
}

function AvoidanceIcon() {
  return (
    <svg aria-hidden="true" className="relative h-7 w-7" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 4.8 17.8 7v4.6c0 3.4-2.2 5.8-5.8 7.2-3.6-1.4-5.8-3.8-5.8-7.2V7z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.95"
      />
      <path d="m9.4 14 5.2-5.2M9.4 8.8l5.2 5.2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
