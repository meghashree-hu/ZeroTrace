import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "./utils";

type FieldProps = {
  label?: string;
  error?: string;
  icon?: ReactNode;
  className?: string;
};

export const Input = forwardRef<HTMLInputElement, FieldProps & InputHTMLAttributes<HTMLInputElement>>(
  function Input({ label, error, icon, className, ...props }, ref) {
  return (
    <div className={className}>
      {label && <label className="mb-2 block text-sm font-medium text-slate-300">{label}</label>}
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-300 transition focus-within:border-cyan-400/50 focus-within:ring-2 focus-within:ring-cyan-400/15">
        {icon}
        <input
          ref={ref}
          className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
          {...props}
        />
      </div>
      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
    </div>
  );
});

export function Select({ label, error, className, children, ...props }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={className}>
      {label && <label className="mb-2 block text-sm font-medium text-slate-300">{label}</label>}
      <select
        className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/15"
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-2 text-sm text-rose-300">{error}</p>}
    </div>
  );
}

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/50 p-4 text-left transition hover:border-cyan-400/30 hover:bg-white/5"
    >
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <span className={cn("relative h-7 w-12 rounded-full transition", checked ? "bg-cyan-500" : "bg-slate-700")}>
        <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition", checked ? "left-6" : "left-1")} />
      </span>
    </button>
  );
}
