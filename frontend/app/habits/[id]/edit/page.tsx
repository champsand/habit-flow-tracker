import { EditHabitForm } from "@/components/habits/EditHabitForm";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";

interface EditHabitPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditHabitPage({ params }: EditHabitPageProps) {
  const { id } = await params;

  return (
    <AppLayout>
      <PageHeader
        description="Adjust the weekly target or pause a habit without changing the rest of your account."
        eyebrow="Habits"
        title="Edit habit"
      />
      <EditHabitForm habitId={id} />
    </AppLayout>
  );
}
