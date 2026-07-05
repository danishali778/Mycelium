import { API_URL } from "@/lib/utils";
import type {
  Pack,
  ProposedWorkflow,
  SaveWorkflowPayload,
  SourceProfile,
  Tool,
  UploadResponse,
  WorkflowRecipe,
} from "@/lib/types";

export async function fetchTools(packId?: string): Promise<Tool[]> {
  const url = new URL(`${API_URL}/tools`);
  if (packId) url.searchParams.set("pack_id", packId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to load tools");
  return res.json();
}

export async function fetchPacks(): Promise<Pack[]> {
  const res = await fetch(`${API_URL}/packs`);
  if (!res.ok) throw new Error("Failed to load packs");
  return res.json();
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function fetchWorkflows(packId?: string): Promise<WorkflowRecipe[]> {
  const url = new URL(`${API_URL}/workflows`);
  if (packId) url.searchParams.set("pack_id", packId);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to load workflows");
  return res.json();
}

export async function saveWorkflow(payload: SaveWorkflowPayload): Promise<WorkflowRecipe> {
  const res = await fetch(`${API_URL}/workflows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save workflow");
  return res.json();
}

export async function deleteWorkflow(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/workflows/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete workflow");
}

export function exportToolUrl(toolId: string): string {
  return `${API_URL}/tools/${toolId}/export`;
}

export type { ProposedWorkflow, SourceProfile, WorkflowRecipe };
