import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { NewHabitForm } from "@/components/habits/NewHabitForm";

export default function NewHabitPage() {
  return (
    <AppLayout>
      <PageHeader
        description="Create a weekly target that is useful, measurable, and realistic."
        eyebrow="Habits"
        title="Add habit"
      />
      <NewHabitForm />
    </AppLayout>
  );
}
