export type ScenarioType =
  | "success"
  | "validation_error"
  | "system_error"
  | "slow_request"
  | "teapot";

export type ScenarioRun = {
  id: string;
  type: ScenarioType;
  name: string | null;
  status: string;
  duration: number | null;
  error: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

type RunScenarioInput = {
  type: ScenarioType;
  name?: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        message = body.message;
      }
    } catch {
      // Ignore non-JSON responses.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function fetchScenarioRuns() {
  return request<ScenarioRun[]>("/scenarios");
}

export function runScenario(input: RunScenarioInput) {
  return request<{
    id: string;
    status: string;
    duration: number;
    message: string;
    signal?: number;
  }>("/scenarios/run", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function fetchHealth() {
  return request<{ status: string; timestamp: string }>("/health");
}
