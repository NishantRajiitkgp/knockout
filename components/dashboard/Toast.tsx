"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type Kind = "success" | "error" | "info";
type ToastItem = { id: number; kind: Kind; text: string };
type Push = (t: { kind?: Kind; text: string }) => void;

const ToastCtx = createContext<Push>(() => {});

export function useToast(): Push {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const push = useCallback<Push>(({ kind = "info", text }) => {
    const id = ++seq.current;
    setItems((s) => [...s, { id, kind, text }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3800);
  }, []);

  const dismiss = (id: number) => setItems((s) => s.filter((t) => t.id !== id));

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {items.map((t) => (
          <button
            key={t.id}
            onClick={() => dismiss(t.id)}
            className="toast flex items-start gap-2.5 rounded-lg border border-hairline bg-surface-elevated px-4 py-3 text-left"
          >
            <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${dotColor(t.kind)}`} />
            <span className="text-[13px] leading-snug text-body">{t.text}</span>
          </button>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function dotColor(kind: Kind): string {
  if (kind === "success") return "bg-accent-green";
  if (kind === "error") return "bg-accent-red";
  return "bg-accent-blue";
}
