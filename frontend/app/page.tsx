import { FlowBackground } from "@/components/auth/AuthShell";
import { AppLogo } from "@/components/layout/AppLogo";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/ProgressBar";

const features = [
  {
    title: "Weekly consistency",
    copy: "Set realistic weekly targets and keep progress visible with lightweight streak feedback."
  },
  {
    title: "Bad habit avoidance",
    copy: "Track successful avoidance days with the same calm rhythm as good habits."
  },
  {
    title: "AI weekly insight",
    copy: "Generate a focused summary from habit logs, check-ins, and weekly patterns."
  }
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#03070d] text-slate-100">
      <FlowBackground className="opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(20,184,166,0.12),transparent_34%),linear-gradient(90deg,rgba(2,6,23,0.9),rgba(2,6,23,0.42),rgba(2,6,23,0.9))]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <AppLogo compact href="/" />
        </nav>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1fr_0.92fr]">
          <div className="max-w-3xl">
            <Badge tone="emerald">Weekly consistency for real life</Badge>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Build better habits. <span className="text-emerald-300">Flow</span> through life.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Habit Flow brings good habits, bad habit avoidance, daily check-ins, and AI weekly insights into one calm dark workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LinkButton className="shadow-emerald-500/20" href="/register">
                Create account
                <Icon className="h-4 w-4" name="arrow" />
              </LinkButton>
              <LinkButton href="/login" variant="secondary">
                Login
              </LinkButton>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {features.map((feature) => (
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 backdrop-blur" key={feature.title}>
                  <p className="text-sm font-semibold text-white">{feature.title}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{feature.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-6">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-300/15 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Weekly progress</p>
                  <p className="mt-1 text-5xl font-semibold text-white">72%</p>
                </div>
                <Badge tone="cyan">This week</Badge>
              </div>
              <div className="mt-6">
                <ProgressBar value={72} />
              </div>

              <div className="mt-8 grid gap-3">
                {[
                  ["Meditation", "Good habit - Checklist", "80%"],
                  ["Workout", "Good habit - Frequency", "67%"],
                  ["No Sugar", "Bad habit - Avoidance", "50%"]
                ].map(([title, meta, value]) => (
                  <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4" key={title}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-1 text-xs text-slate-500">{meta}</p>
                      </div>
                      <p className="text-sm font-semibold text-emerald-300">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-violet-400/25 bg-violet-500/10 p-4">
                <p className="text-sm font-semibold text-violet-100">AI insight</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Your strongest weeks come from small logs made consistently, not perfect days.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
