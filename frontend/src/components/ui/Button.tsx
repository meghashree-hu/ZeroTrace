import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "./utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-cyan-400/30 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:brightness-110",
  secondary:
    "border-white/10 bg-white/5 text-slate-200 hover:border-cyan-400/30 hover:bg-white/10 hover:text-white",
  ghost:
    "border-transparent bg-transparent text-slate-300 hover:bg-white/5 hover:text-white",
  danger:
    "border-rose-500/25 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20",
  success:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20",
};

export function Button({ className, children, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
