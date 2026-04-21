import { ScenarioDashboard } from "@/components/scenario-dashboard";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-10 lg:px-10">
      <div className="mb-8 max-w-3xl space-y-4">
        <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
          Signal Lab
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
          Observability playground for scenario-driven signals
        </h1>
        <p className="text-lg text-slate-600">
          Trigger synthetic backend scenarios, watch run history update from PostgreSQL, and
          inspect metrics, logs and exceptions in the observability stack.
        </p>
      </div>

      <ScenarioDashboard />
    </main>
  );
}
