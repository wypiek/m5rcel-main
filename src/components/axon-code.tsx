import type { ReactNode } from "react";

// Tiny Axon syntax highlighter: enough for a short sample, not a real lexer.
const KEYWORDS = new Set([
  "use", "fn", "let", "mut", "for", "in", "do", "while", "loop", "return",
  "if", "then", "else", "match", "try", "catch", "struct", "enum", "trait",
]);
const TYPES = new Set(["int", "uint", "uint64", "int64", "float", "bool", "str", "Core"]);

const TOKEN = /(#.*$)|(f?"(?:[^"\\]|\\.)*")|(\b\d[\w.]*\b)|(\b[A-Za-z_]\w*\b)|(->|\.\.)/gm;

function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN)) {
    const [text, comment, string, number, word, op] = m;
    const i = m.index ?? 0;
    if (i > last) out.push(line.slice(last, i));
    let cls = "";
    if (comment) cls = "text-subtle-foreground italic";
    else if (string) cls = "text-amber-200/90";
    else if (number) cls = "text-orange-300/90";
    else if (op) cls = "text-subtle-foreground";
    else if (word && KEYWORDS.has(word)) cls = "text-axon";
    else if (word && TYPES.has(word)) cls = "text-sky-300/90";
    else if (word && line.slice(i + word.length).startsWith("(")) cls = "text-foreground";
    out.push(cls ? <span key={i} className={cls}>{text}</span> : text);
    last = i + text.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export function AxonCode({ code, filename }: { code: string; filename?: string }) {
  const lines = code.split("\n");
  return (
    <div className="overflow-hidden rounded-lg border bg-background/80">
      {filename && (
        <div className="flex items-center gap-1.5 border-b px-4 py-2 font-mono text-[11px] text-subtle-foreground">
          <span className="size-2 rounded-full bg-white/10" />
          <span className="size-2 rounded-full bg-white/10" />
          <span className="size-2 rounded-full bg-white/10" />
          <span className="ml-2">{filename}</span>
        </div>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.7] text-secondary-foreground">
        <code>
          {lines.map((line, n) => (
            <div key={n} className="flex">
              <span className="mr-4 inline-block w-4 shrink-0 text-right text-white/15 select-none">{n + 1}</span>
              <span>{line ? highlight(line) : " "}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
