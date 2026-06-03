import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { CheckInForm } from "@/components/checkins/CheckInForm";

export default function CheckInPage() {
  return (
    <AppLayout>
      <PageHeader
        description="Take a moment to reflect and track your day."
        eyebrow="21:00 recap"
        title="Daily Check-in"
      />
      <CheckInForm />
    </AppLayout>
  );
}
