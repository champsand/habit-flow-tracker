import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { UserProfileCard } from "@/components/auth/UserProfileCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icon, type IconName } from "@/components/ui/Icon";

const habitPreferences = [
  { label: "Week starts", value: "Monday", icon: "summary" },
  { label: "Daily recap", value: "21:00", icon: "log" },
  { label: "Tracking style", value: "Weekly goals with active-day streak support", icon: "check" }
];

const appMode = [
  { label: "Backend", value: "Connected", tone: "emerald" },
  { label: "AI insights", value: "Gemini via backend", tone: "cyan" },
  { label: "Workspace", value: "Account-linked data", tone: "violet" },
  { label: "Theme", value: "Dark mode", tone: "emerald" }
];

const privacyNotes = [
  "Your habit data is linked to your account.",
  "API keys and secrets are handled by the backend.",
  "The frontend never stores AI provider secrets."
];

export default function SettingsPage() {
  return (
    <AppLayout>
      <PageHeader
        description="Review your account, tracking preferences, app mode, and privacy basics."
        eyebrow="Account"
        title="Settings"
      />

      <section className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <UserProfileCard />

        <div className="grid gap-6">
          <Card className="p-5 sm:p-6">
            <SectionHeading
              description="These defaults keep Habit Flow focused on weekly consistency."
              icon="habits"
              title="Habit preferences"
            />
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {habitPreferences.map((setting) => (
                <SettingTile
                  icon={setting.icon as IconName}
                  key={setting.label}
                  label={setting.label}
                  value={setting.value}
                />
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeading
                description="A compact view of the app services currently powering this workspace."
                icon="spark"
                title="Workspace status"
              />
              <Badge tone="emerald">Backend configured</Badge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {appMode.map((setting) => (
                <InfoTile
                  key={setting.label}
                  label={setting.label}
                  tone={setting.tone as "emerald" | "cyan" | "violet"}
                  value={setting.value}
                />
              ))}
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <SectionHeading
              description="Short, practical notes about how the app handles sensitive data."
              icon="settings"
              title="Privacy & data"
            />
            <div className="mt-5 grid gap-3">
              {privacyNotes.map((note) => (
                <div className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-950/45 p-4" key={note}>
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                    <Icon className="h-3.5 w-3.5" name="check" />
                  </span>
                  <p className="text-sm leading-6 text-slate-300">{note}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </AppLayout>
  );
}

function SectionHeading({ description, icon, title }: { description: string; icon: IconName; title: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-slate-800 bg-slate-950/60 text-emerald-300">
        <Icon className="h-5 w-5" name={icon} />
      </span>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function SettingTile({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
      <Icon className="h-5 w-5 text-cyan-300" name={icon} />
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-100">{value}</p>
    </article>
  );
}

function InfoTile({ label, value, tone }: { label: string; value: string; tone: "emerald" | "cyan" | "violet" }) {
  const tones = {
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    violet: "border-violet-400/20 bg-violet-400/10 text-violet-300"
  }[tone];

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
      <Badge tone={tone}>{label}</Badge>
      <p className="mt-4 text-sm font-semibold leading-6 text-slate-100">{value}</p>
      <div className={`mt-4 h-1 rounded-full ${tones}`} />
    </article>
  );
}
