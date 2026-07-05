"use client";

import { useMemo } from "react";

/** Minimal regex-based Python highlighter for tool card previews (no deps). */

const KEYWORDS = new Set([
  "def", "return", "import", "from", "if", "elif", "else", "for", "while",
  "in", "not", "and", "or", "None", "True", "False", "with", "as", "try",
  "except", "raise", "class", "lambda", "pass", "yield", "is",
]);

const TOKEN_RE =
  /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|([A-Za-z_]\w*)(?=\()|\b([A-Za-z_]\w*)\b|(\d+(?:\.\d+)?)|(\s+)|(.)/gm;

type Token = { text: string; className?: string };

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(line)) !== null) {
    const [, comment, str, callName, word, num, space, other] = match;
    if (comment != null) tokens.push({ text: comment, className: "text-slate-600 italic" });
    else if (str != null) tokens.push({ text: str, className: "text-amber-300/90" });
    else if (callName != null) {
      tokens.push({
        text: callName,
        className: KEYWORDS.has(callName) ? "text-reuse" : "text-accent",
      });
    } else if (word != null) {
      tokens.push({
        text: word,
        className: KEYWORDS.has(word) ? "text-reuse" : undefined,
      });
    } else if (num != null) tokens.push({ text: num, className: "text-accent/80" });
    else if (space != null) tokens.push({ text: space });
    else if (other != null) tokens.push({ text: other, className: "text-slate-500" });
    if (match.index === TOKEN_RE.lastIndex) TOKEN_RE.lastIndex++;
  }
  return tokens;
}

export function CodePreview({
  code,
  maxLines = 7,
  className,
}: {
  code: string;
  maxLines?: number;
  className?: string;
}) {
  const lines = useMemo(() => {
    const all = code.replace(/\r\n/g, "\n").split("\n");
    const trimmed = all.slice(0, maxLines);
    return { shown: trimmed.map(tokenizeLine), truncated: all.length > maxLines };
  }, [code, maxLines]);

  return (
    <pre
      className={
        "overflow-hidden rounded-lg border border-white/[0.06] bg-base/80 px-3 py-2.5 font-mono text-[10.5px] leading-[1.7] text-slate-400 " +
        (className ?? "")
      }
    >
      {lines.shown.map((tokens, i) => (
        <div key={i} className="truncate">
          {tokens.map((token, j) =>
            token.className ? (
              <span key={j} className={token.className}>
                {token.text}
              </span>
            ) : (
              token.text
            )
          )}
        </div>
      ))}
      {lines.truncated && <div className="text-slate-700">...</div>}
    </pre>
  );
}
