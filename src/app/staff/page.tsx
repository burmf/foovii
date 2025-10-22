import { StaffBoard } from "@/components/staff";

export default function StaffPage() {
  return (
    <main className="min-h-screen bg-background px-6 pb-16 pt-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <StaffBoard />
      </div>
    </main>
  );
}
