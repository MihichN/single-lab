export const scenarioTypes = [
  'success',
  'validation_error',
  'system_error',
  'slow_request',
  'teapot',
] as const;

export type ScenarioType = (typeof scenarioTypes)[number];

export const scenarioStatuses = {
  completed: 'completed',
  failed: 'failed',
  running: 'running',
} as const;
