CREATE TABLE "scenario_runs" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "name" TEXT,
  "status" TEXT NOT NULL,
  "duration" INTEGER,
  "error" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "scenario_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "scenario_runs_created_at_idx" ON "scenario_runs" ("created_at" DESC);
