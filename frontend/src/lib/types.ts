// Mirrors backend/app/models/*.py (contracts live in code on the backend).

export type EventType =
  | "source.profiled"
  | "workflow.match_candidates"
  | "workflow.proposed"
  | "workflow.saved"
  | "plan.created"
  | "step.started"
  | "tool.matched"
  | "tool.gap_detected"
  | "synthesis.spec"
  | "synthesis.code"
  | "synthesis.run"
  | "synthesis.error"
  | "synthesis.repair"
  | "synthesis.registered"
  | "tool.called"
  | "step.observed"
  | "run.completed"
  | "error";

export interface RunEvent {
  type: EventType;
  message: string;
  data: Record<string, unknown>;
  /** Client-side receipt time (ms epoch); set when the SSE frame arrives. */
  receivedAt?: number;
}

export interface ColumnProfile {
  name: string;
  dtype: string;
  null_count: number;
  null_ratio: number;
  sample_values: string[];
  unique_sample_values: string[];
  dirty_patterns: string[];
  semantic_guess?: string | null;
}

export interface SourceProfile {
  source_ref: string;
  filename: string;
  row_count: number;
  column_count: number;
  columns: ColumnProfile[];
  preview_rows: Record<string, string>[];
  warnings: string[];
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  signature: string;
  code: string;
  pack_id: string;
  created_at: number;
  usage_count: number;
  last_error?: string | null;
}

export interface WorkflowStep {
  id: string;
  intent: string;
  tool_name: string;
  args: Record<string, unknown>;
  output_binding?: string | null;
}

export interface WorkflowRecipe {
  id: string;
  name: string;
  description: string;
  pack_id: string;
  created_from_goal: string;
  trigger_profile: Record<string, unknown>;
  steps: WorkflowStep[];
  created_at: number;
  usage_count: number;
  last_run_at?: number | null;
}

export interface ProposedWorkflow {
  name: string;
  description: string;
  pack_id: string;
  created_from_goal: string;
  trigger_profile: Record<string, unknown>;
  steps: WorkflowStep[];
}

export interface Pack {
  id: string;
  label: string;
}

export interface RunRequest {
  goal?: string;
  pack_id: string;
  session_id: string;
  source_ref?: string | null;
  source_filename?: string | null;
  workflow_id?: string | null;
}

export interface UploadResponse {
  source_ref: string;
  filename: string;
  source_profile: SourceProfile;
}

export interface SaveWorkflowPayload {
  name: string;
  description?: string;
  pack_id?: string;
  created_from_goal: string;
  trigger_profile: Record<string, unknown>;
  steps: WorkflowStep[];
}
