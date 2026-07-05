import { API_URL } from "@/lib/utils";
import type { RunEvent, RunRequest } from "@/lib/types";

/**
 * POST /run and consume the SSE stream. Since EventSource only supports GET,
 * we read the streamed response body and parse SSE frames manually.
 */
export async function runStream(
  request: RunRequest,
  onEvent: (event: RunEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${API_URL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail || `Run failed with status ${res.status}`);
  }

  if (!res.body) throw new Error("No response stream");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  function emitFrame(frame: string) {
    const dataLine = frame
      .split(/\r?\n/)
      .find((line) => line.startsWith("data:"));
    if (!dataLine) return;
    const payload = dataLine.slice("data:".length).trim();
    try {
      onEvent(JSON.parse(payload) as RunEvent);
    } catch {
      // ignore keep-alive / non-JSON frames
    }
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const frames = buffer.split(/\r?\n\r?\n/);
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      emitFrame(frame);
    }
  }
  if (buffer.trim()) emitFrame(buffer);
}
