"use client";

import { motion } from "framer-motion";

export function RepairDiff({ error }: { error: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-danger/30 bg-danger/[0.06] p-4 shadow-panel"
    >
      <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-danger">
        Error {"->"} self-repairing
      </div>
      <pre className="whitespace-pre-wrap font-mono text-xs text-danger/90">
        {error}
      </pre>
    </motion.div>
  );
}
