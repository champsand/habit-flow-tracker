import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { WeeklySummaryClient } from "@/components/summary/WeeklySummaryClient";

export default function WeeklySummaryPage() {
  return (
    <AppLayout>
      <PageHeader
        description="Your weekly performance overview."
        eyebrow="Weekly review"
        title="Weekly Summary"
      />
      <WeeklySummaryClient />
    </AppLayout>
  );
}
