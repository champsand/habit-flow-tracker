import type { ReactNode } from "react";
import { AppLogo } from "@/components/layout/AppLogo";

interface AuthShellProps {
  eyebrow?: string;
  visualTitle: string;
  visualCopy: string;
  formTitle: string;
  formSubtitle: string;
  children: ReactNode;
  bullets?: Array<{
    title: string;
    copy: string;
  }>;
}

export function FlowBackground({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_56%_50%,rgba(45,212,191,0.12),transparent_18%),radial-gradient(circle_at_78%_22%,rgba(34,211,238,0.07),transparent_30%),radial-gradient(circle_at_24%_82%,rgba(16,185,129,0.08),transparent_30%)]" />
      <div className="absolute left-[46%] top-[40%] h-72 w-[34rem] -translate-x-1/2 -rotate-12 rounded-full bg-gradient-to-r from-emerald-400/0 via-emerald-300/10 to-cyan-300/0 blur-3xl" />
      <div className="absolute left-[58%] top-[52%] h-40 w-[28rem] -translate-x-1/2 rotate-6 rounded-full bg-gradient-to-r from-cyan-300/0 via-cyan-300/8 to-emerald-300/0 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,0.82))]" />
      <svg className="absolute inset-x-0 bottom-0 h-[72%] w-full opacity-80" fill="none" viewBox="0 0 1000 520">
        <path d="M70 410C195 372 276 302 393 288C523 272 589 334 713 260C800 208 856 142 940 126" stroke="rgba(45,212,191,0.42)" strokeLinecap="round" strokeWidth="1.8" />
        <path d="M116 452C230 396 300 354 428 344C556 334 640 360 755 308C832 273 888 224 956 208" stroke="rgba(34,211,238,0.22)" strokeDasharray="2 14" strokeLinecap="round" strokeWidth="1.4" />
        <path d="M42 352C156 336 261 282 355 222C460 155 557 152 672 178C770 200 849 170 952 92" stroke="rgba(16,185,129,0.18)" strokeLinecap="round" strokeWidth="1.2" />
        <path d="M154 482C250 430 351 421 474 382C596 344 663 282 764 248C836 224 888 226 954 240" stroke="rgba(148,163,184,0.07)" strokeLinecap="round" strokeWidth="1" />
        <path d="M214 264C320 226 396 190 504 202C622 215 682 254 789 204" stroke="rgba(45,212,191,0.13)" strokeDasharray="1 12" strokeLinecap="round" strokeWidth="1.2" />
        <circle cx="394" cy="288" fill="rgba(45,212,191,0.35)" r="2.2" />
        <circle cx="713" cy="260" fill="rgba(34,211,238,0.22)" r="1.8" />
        <circle cx="672" cy="178" fill="rgba(16,185,129,0.18)" r="1.6" />
      </svg>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.45),transparent_42%,rgba(2,6,23,0.52))]" />
    </div>
  );
}

export function AuthShell({
  eyebrow = "Habit Flow",
  visualTitle,
  visualCopy,
  formTitle,
  formSubtitle,
  bullets = defaultBullets,
  children
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03070d] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <FlowBackground className="opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.5),transparent_34%),linear-gradient(90deg,rgba(2,6,23,0.72),rgba(2,6,23,0.3),rgba(2,6,23,0.86))]" />

      <section className="relative mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden min-h-[640px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/35 p-8 shadow-2xl shadow-black/30 lg:block">
          <FlowBackground className="opacity-95" />
          <div className="relative z-10 flex h-full flex-col">
            <AppLogo compact href="/" markSize="sm" />
            <div className="mt-16 max-w-lg">
              <p className="text-sm font-medium uppercase tracking-[0.26em] text-emerald-300/80">{eyebrow}</p>
              <h1 className="mt-5 text-5xl font-semibold tracking-tight text-white">
                {visualTitle}
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-slate-300">{visualCopy}</p>
            </div>

            <div className="mt-12 grid max-w-md gap-4">
              {bullets.map((bullet) => (
                <div className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4 backdrop-blur" key={bullet.title}>
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.75)]" />
                  <div>
                    <p className="text-sm font-semibold text-white">{bullet.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">{bullet.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="relative rounded-[2rem] border border-white/10 bg-slate-950/72 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8">
          <div className="mb-8 lg:hidden">
            <AppLogo compact href="/" markSize="sm" />
          </div>
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-emerald-300/80">Habit Flow</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{formTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">{formSubtitle}</p>
            {children}
          </div>
        </section>
      </section>
    </main>
  );
}

const defaultBullets = [
  {
    title: "Track weekly rhythm",
    copy: "Plan good habits and bad habit avoidance around realistic weekly targets."
  },
  {
    title: "Reflect with context",
    copy: "Daily mood and energy check-ins explain what helped your progress."
  },
  {
    title: "Review with AI insight",
    copy: "Weekly summaries turn your logs into one focused recommendation."
  }
];
