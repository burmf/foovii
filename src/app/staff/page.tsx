export default function StaffPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-24 text-center text-muted-foreground">
      <div className="max-w-xl space-y-4">
        <h1 className="text-3xl font-semibold text-foreground">Staff Dashboard</h1>
        <p>
          The live order kanban for Foovii tenants will be implemented here.
          Refer to docs/todo.md section 4 for the planned column flow.
        </p>
      </div>
    </main>
  );
}
