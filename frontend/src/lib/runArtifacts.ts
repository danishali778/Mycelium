import type { RunEvent, Tool } from "@/lib/types";

export type TaskToolStatus = "reused" | "building" | "generated" | "executed" | "failed";
export type TaskToolSource = "memory" | "generated" | "unknown";

export interface ToolRunResult {
  toolName: string;
  toolId?: string;
  stepId?: string;
  stepIntent?: string;
  summary?: string;
  data?: unknown;
  raw?: string;
  ok?: boolean;
  error?: string | null;
  eventIndex: number;
  finishedAt?: number;
}

export interface TaskTool {
  name: string;
  toolId?: string;
  source: TaskToolSource;
  status: TaskToolStatus;
  description: string;
  signature: string;
  code: string;
  usageCount?: number;
  result?: ToolRunResult;
  firstEventIndex: number;
  lastEventIndex: number;
  startedAt?: number;
}

const STATUS_RANK: Record<TaskToolStatus, number> = {
  reused: 1,
  building: 2,
  generated: 3,
  executed: 4,
  failed: 5,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function toolNameFromEvent(event: RunEvent): string | undefined {
  return asString(event.data?.name) ?? asString(event.data?.tool);
}

function mergeStatus(current: TaskToolStatus, next: TaskToolStatus): TaskToolStatus {
  return STATUS_RANK[next] >= STATUS_RANK[current] ? next : current;
}

function resultFromEvent(event: RunEvent, index: number): ToolRunResult | null {
  const name = toolNameFromEvent(event);
  if (!name) return null;

  const stepResult = isRecord(event.data?.step_result) ? event.data.step_result : {};
  const ok = asBoolean(event.data?.ok) ?? asBoolean(stepResult.ok);
  const rawError = event.data?.error ?? stepResult.error;

  return {
    toolName: name,
    toolId: asString(event.data?.tool_id),
    stepId: asString(event.data?.step_id) ?? asString(stepResult.step_id),
    stepIntent: asString(event.data?.step_intent),
    summary: asString(event.data?.summary) ?? asString(stepResult.summary),
    data: event.data?.data ?? stepResult.data,
    raw: asString(event.data?.result),
    ok,
    error: rawError == null ? null : String(rawError),
    eventIndex: index,
    finishedAt: event.receivedAt,
  };
}

export function deriveTaskTools(events: RunEvent[], tools: Tool[]): TaskTool[] {
  const byId = new Map(tools.map((tool) => [tool.id, tool]));
  const byName = new Map(tools.map((tool) => [tool.name, tool]));
  const taskTools = new Map<string, TaskTool>();

  function upsert(
    name: string,
    index: number,
    patch: Partial<Omit<TaskTool, "name" | "firstEventIndex" | "lastEventIndex">>,
    at?: number
  ) {
    const existing = taskTools.get(name);
    const tool = patch.toolId ? byId.get(patch.toolId) : byName.get(name);
    const nextStatus = patch.status ?? existing?.status ?? "reused";

    taskTools.set(name, {
      name,
      toolId: patch.toolId ?? existing?.toolId ?? tool?.id,
      source: patch.source ?? existing?.source ?? (tool ? "memory" : "unknown"),
      status: existing ? mergeStatus(existing.status, nextStatus) : nextStatus,
      description: patch.description ?? existing?.description ?? tool?.description ?? "",
      signature: patch.signature ?? existing?.signature ?? tool?.signature ?? "",
      code: patch.code ?? existing?.code ?? tool?.code ?? "",
      usageCount: tool?.usage_count ?? existing?.usageCount,
      result: patch.result ?? existing?.result,
      firstEventIndex: existing?.firstEventIndex ?? index,
      lastEventIndex: index,
      startedAt: existing?.startedAt ?? at,
    });
  }

  events.forEach((event, index) => {
    const name = toolNameFromEvent(event);

    if (event.type === "tool.matched" && name) {
      upsert(name, index, {
        toolId: asString(event.data?.tool_id),
        source: "memory",
        status: "reused",
      }, event.receivedAt);
    }

    if (event.type === "synthesis.code" && name) {
      upsert(name, index, {
        source: "generated",
        status: "building",
        code: asString(event.data?.code) ?? "",
      }, event.receivedAt);
    }

    if (event.type === "synthesis.registered" && name) {
      upsert(name, index, {
        toolId: asString(event.data?.tool_id),
        source: "generated",
        status: "generated",
        code: asString(event.data?.code) ?? "",
      }, event.receivedAt);
    }

    if (event.type === "tool.called" && name) {
      const result = resultFromEvent(event, index);
      upsert(name, index, {
        toolId: asString(event.data?.tool_id),
        source: taskTools.get(name)?.source ?? "memory",
        status: result?.ok === false ? "failed" : "executed",
        result: result ?? undefined,
      }, event.receivedAt);
    }
  });

  return [...taskTools.values()]
    .map((item) => {
      const tool = item.toolId ? byId.get(item.toolId) : byName.get(item.name);
      if (!tool) return item;
      return {
        ...item,
        toolId: item.toolId ?? tool.id,
        description: item.description || tool.description,
        signature: item.signature || tool.signature,
        code: item.code || tool.code,
        usageCount: tool.usage_count,
      };
    })
    .sort((a, b) => a.firstEventIndex - b.firstEventIndex);
}

export function rowsFromResultData(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter(isRecord).slice(0, 8);
  }
  if (isRecord(data)) {
    return Object.entries(data).map(([key, value]) => ({ field: key, value }));
  }
  return [];
}

export function formatArtifactValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number") {
    return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}
