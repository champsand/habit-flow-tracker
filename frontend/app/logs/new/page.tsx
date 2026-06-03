import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { LogActivityForm } from "@/components/logs/LogActivityForm";

export default function LogActivityPage() {
  return (
    <AppLayout>
      <PageHeader
        description="Record your progress and keep your streak going."
        eyebrow="Daily flow"
        title="Log Activity"
      />
      <LogActivityForm />
    </AppLayout>
  );
}
