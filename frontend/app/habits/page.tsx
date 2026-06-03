import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { HabitsClient } from "@/components/habits/HabitsClient";
import { LinkButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

export default function HabitsPage() {
  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1100px]">
        <PageHeader
          description="Track and manage your weekly consistency."
          eyebrow="Habit library"
          title="My Habits"
        >
          <LinkButton href="/habits/new">
            Add habit
            <Icon className="h-4 w-4" name="plus" />
          </LinkButton>
        </PageHeader>
        <HabitsClient />
      </div>
    </AppLayout>
  );
}
