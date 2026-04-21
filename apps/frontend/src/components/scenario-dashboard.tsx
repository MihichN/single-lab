"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, ExternalLink, LoaderCircle, Siren, Timer } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { fetchHealth, fetchScenarioRuns, runScenario } from "@/lib/api";
import type { ScenarioRun, ScenarioType } from "@/lib/api";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const formSchema = z.object({
  type: z.enum([
    "success",
    "validation_error",
    "system_error",
    "slow_request",
    "teapot",
  ]),
  name: z.string().max(120).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const scenarioOptions: { value: ScenarioType; label: string; hint: string }[] = [
  {
    value: "success",
    label: "success",
    hint: "Green path with metrics, info logs and completed run.",
  },
  {
    value: "validation_error",
    label: "validation_error",
    hint: "Returns 400, writes warn log and error metric.",
  },
  {
    value: "system_error",
    label: "system_error",
    hint: "Throws 500, writes error log and captures Sentry exception.",
  },
  {
    value: "slow_request",
    label: "slow_request",
    hint: "Sleeps 2-5 seconds and creates latency spike.",
  },
  {
    value: "teapot",
    label: "teapot",
    hint: "Optional easter egg: returns HTTP 418 with signal 42.",
  },
];

function getBadgeVariant(status: string) {
  if (status === "completed") {
    return "success" as const;
  }

  if (status === "failed") {
    return "danger" as const;
  }

  return "warning" as const;
}

function formatDuration(duration: number | null) {
  if (duration == null) {
    return "n/a";
  }

  return `${duration} ms`;
}

function RunHistoryItem({ run }: { run: ScenarioRun }) {
  return (
    <div className="grid gap-2 rounded-lg border border-slate-200 p-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] md:items-center">
      <div>
        <div className="font-medium text-slate-900">{run.type}</div>
        <div className="text-sm text-slate-500">{run.name || "Unnamed run"}</div>
      </div>
      <Badge variant={getBadgeVariant(run.status)}>{run.status}</Badge>
      <div className="text-sm text-slate-600">{formatDuration(run.duration)}</div>
      <div className="text-sm text-slate-500">
        {new Date(run.createdAt).toLocaleString()}
      </div>
    </div>
  );
}

export function ScenarioDashboard() {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "success",
      name: "",
    },
  });
  const selectedType = useWatch({
    control: form.control,
    name: "type",
  });

  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 15_000,
  });

  const historyQuery = useQuery({
    queryKey: ["scenario-runs"],
    queryFn: fetchScenarioRuns,
    refetchInterval: 10_000,
  });

  const mutation = useMutation({
    mutationFn: runScenario,
    onSuccess: (result) => {
      toast.success(result.message, {
        description: `Run ${result.id} finished with status ${result.status}.`,
      });
      form.reset({
        type: "success",
        name: "",
      });
      void queryClient.invalidateQueries({ queryKey: ["scenario-runs"] });
      void queryClient.invalidateQueries({ queryKey: ["health"] });
    },
    onError: (error) => {
      toast.error("Scenario failed", {
        description: error.message,
      });
      void queryClient.invalidateQueries({ queryKey: ["scenario-runs"] });
    },
  });

  const onSubmit = form.handleSubmit((values) =>
    mutation.mutate({
      type: values.type,
      name: values.name?.trim() || undefined,
    }),
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Run Scenario</CardTitle>
            <CardDescription>
              Trigger backend signals and inspect how they appear in metrics, logs and errors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Scenario type</label>
                <Select
                  value={selectedType}
                  onValueChange={(value) =>
                    form.setValue("type", value as ScenarioType, { shouldValidate: true })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarioOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500">
                  {scenarioOptions.find((option) => option.value === selectedType)?.hint}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Run name</label>
                <Input placeholder="Optional business label" {...form.register("name")} />
                {form.formState.errors.name ? (
                  <p className="text-sm text-rose-600">
                    {form.formState.errors.name.message}
                  </p>
                ) : null}
              </div>

              <Button className="w-full sm:w-auto" disabled={mutation.isPending} type="submit">
                {mutation.isPending ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  "Run Scenario"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Run History</CardTitle>
            <CardDescription>
              Latest 20 runs fetched with TanStack Query and refreshed automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {historyQuery.isLoading ? (
              <div className="text-sm text-slate-500">Loading scenario history...</div>
            ) : historyQuery.data?.length ? (
              historyQuery.data.map((run) => <RunHistoryItem key={run.id} run={run} />)
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                No runs yet. Trigger a scenario to populate PostgreSQL, Prometheus and Loki.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Quick health signal for the backend API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
              <Activity className="h-5 w-5 text-sky-600" />
              <div>
                <div className="font-medium text-slate-900">
                  {healthQuery.data?.status === "ok" ? "Backend healthy" : "Waiting for backend"}
                </div>
                <div className="text-sm text-slate-500">
                  {healthQuery.data?.timestamp
                    ? `Updated at ${new Date(healthQuery.data.timestamp).toLocaleTimeString()}`
                    : "Health endpoint not reachable yet."}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observability Links</CardTitle>
            <CardDescription>
              Shortcuts for the verification walkthrough from the assignment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <a
              className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50"
              href="http://localhost:3100/d/signal-lab/signal-lab-overview"
              rel="noreferrer"
              target="_blank"
            >
              <span>
                <span className="block font-medium text-slate-900">Grafana dashboard</span>
                <span className="text-slate-500">http://localhost:3100</span>
              </span>
              <ExternalLink className="h-4 w-4 text-slate-500" />
            </a>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-1 flex items-center gap-2 font-medium text-slate-900">
                <Siren className="h-4 w-4 text-rose-600" />
                Loki query
              </div>
              <code className="rounded bg-slate-100 px-2 py-1 text-xs">{'{app="signal-lab"}'}</code>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-1 flex items-center gap-2 font-medium text-slate-900">
                <Timer className="h-4 w-4 text-amber-600" />
                Sentry
              </div>
              <p className="text-slate-500">
                Trigger <code>system_error</code> and inspect the configured project dashboard.
              </p>
            </div>

            <a
              className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition hover:bg-slate-50"
              href="http://localhost:3001/metrics"
              rel="noreferrer"
              target="_blank"
            >
              <span>
                <span className="block font-medium text-slate-900">Prometheus metrics endpoint</span>
                <span className="text-slate-500">http://localhost:3001/metrics</span>
              </span>
              <ExternalLink className="h-4 w-4 text-slate-500" />
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
