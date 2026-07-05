"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { fetchTools, fetchWorkflows } from "@/lib/api";
import { runStream } from "@/lib/stream";
import type { ProposedWorkflow, RunEvent, SourceProfile, Tool, WorkflowRecipe } from "@/lib/types";

export interface SessionRecord {
  id: string;
  sourceRef: string;
  filename: string;
  rows: number;
  columns: number;
  lastGoal?: string;
  lastRunAt?: number;
}

interface CockpitContextValue {
  packId: string;
  setPackId: (id: string) => void;
  sourceRef: string | null;
  sourceProfile: SourceProfile | null;
  setSource: (ref: string, profile: SourceProfile) => void;
  sessions: SessionRecord[];
  events: RunEvent[];
  tools: Tool[];
  workflows: WorkflowRecipe[];
  running: boolean;
  proposedWorkflow: ProposedWorkflow | null;
  workflowCandidates: { name: string; score: number }[];
  run: (goal: string, workflowId?: string | null) => Promise<void>;
  refreshTools: () => Promise<void>;
  refreshWorkflows: () => Promise<void>;
}

const CockpitContext = createContext<CockpitContextValue | null>(null);
const SESSIONS_KEY = "mycelium.sessions.v1";

function loadSessions(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as SessionRecord[]) : [];
  } catch {
    return [];
  }
}

function persistSessions(sessions: SessionRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 8)));
}

export function CockpitProvider({ children }: { children: ReactNode }) {
  const [packId, setPackId] = useState("data");
  const [sourceRef, setSourceRef] = useState<string | null>(null);
  const [sourceProfile, setSourceProfile] = useState<SourceProfile | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowRecipe[]>([]);
  const [running, setRunning] = useState(false);
  const sessionId = useRef(crypto.randomUUID());

  const refreshTools = useCallback(async () => {
    try {
      setTools(await fetchTools(packId));
    } catch {
      /* backend may be offline */
    }
  }, [packId]);

  const refreshWorkflows = useCallback(async () => {
    try {
      setWorkflows(await fetchWorkflows(packId));
    } catch {
      /* backend may be offline */
    }
  }, [packId]);

  useEffect(() => {
    refreshTools();
    refreshWorkflows();
  }, [refreshTools, refreshWorkflows]);

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  const setSource = useCallback((ref: string, profile: SourceProfile) => {
    setSourceRef(ref);
    setSourceProfile(profile);
    setSessions((prev) => {
      const record: SessionRecord = {
        id: ref,
        sourceRef: ref,
        filename: profile.filename,
        rows: profile.row_count,
        columns: profile.column_count,
      };
      const next = [record, ...prev.filter((s) => s.sourceRef !== ref)].slice(0, 8);
      persistSessions(next);
      return next;
    });
  }, []);

  const proposedWorkflow = useMemo(() => {
    const ev = [...events].reverse().find((e) => e.type === "workflow.proposed");
    return (ev?.data?.workflow as ProposedWorkflow) ?? null;
  }, [events]);

  const workflowCandidates = useMemo(() => {
    const ev = events.find((e) => e.type === "workflow.match_candidates");
    return (ev?.data?.candidates as { name: string; score: number }[]) ?? [];
  }, [events]);

  const run = useCallback(
    async (goal: string, workflowId?: string | null) => {
      setEvents([]);
      setRunning(true);
      try {
        await runStream(
          {
            goal,
            pack_id: packId,
            session_id: sessionId.current,
            source_ref: sourceRef,
            source_filename: sourceProfile?.filename ?? null,
            workflow_id: workflowId ?? null,
          },
          (ev) => {
            setEvents((prev) => [...prev, { ...ev, receivedAt: Date.now() }]);
            if (ev.type === "synthesis.registered" || ev.type === "tool.called") {
              refreshTools();
            }
          }
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Run failed";
        setEvents((prev) => [
          ...prev,
          { type: "error", message, data: { error: message } },
        ]);
      } finally {
        if (sourceRef && goal.trim()) {
          setSessions((prev) => {
            const next = prev.map((session) =>
              session.sourceRef === sourceRef
                ? { ...session, lastGoal: goal.trim(), lastRunAt: Date.now() }
                : session
            );
            persistSessions(next);
            return next;
          });
        }
        setRunning(false);
        refreshTools();
        refreshWorkflows();
      }
    },
    [packId, sourceRef, sourceProfile, refreshTools, refreshWorkflows]
  );

  const value = useMemo(
    () => ({
      packId,
      setPackId,
      sourceRef,
      sourceProfile,
      setSource,
      sessions,
      events,
      tools,
      workflows,
      running,
      proposedWorkflow,
      workflowCandidates,
      run,
      refreshTools,
      refreshWorkflows,
    }),
    [
      packId,
      sourceRef,
      sourceProfile,
      setSource,
      sessions,
      events,
      tools,
      workflows,
      running,
      proposedWorkflow,
      workflowCandidates,
      run,
      refreshTools,
      refreshWorkflows,
    ]
  );

  return <CockpitContext.Provider value={value}>{children}</CockpitContext.Provider>;
}

export function useCockpit() {
  const ctx = useContext(CockpitContext);
  if (!ctx) throw new Error("useCockpit must be used within CockpitProvider");
  return ctx;
}
