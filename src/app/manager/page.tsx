import { ManagerDashboard } from "@/components/manager";

export default function ManagerPage() {
  return (
    <main className="min-h-screen bg-background px-6 pb-16 pt-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <ManagerDashboard />
      </div>
    </main>
  );
}
