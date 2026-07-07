import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./utils";

type BadgeTone = "cyan" | "emerald" | "amber" | "rose" | "slate";

const tones: Record<BadgeTone, string> = {
  cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
  emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  rose: "border-rose-400/20 bg-rose-400/10 text-rose-200",
  slate: "border-white/10 bg-white/5 text-slate-300",
};

export function Badge({ tone = "cyan", className, children, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", tones[tone], className)} {...props}>
      {children}
    </span>
  );
}
