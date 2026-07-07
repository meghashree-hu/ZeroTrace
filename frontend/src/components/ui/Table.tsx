import type { TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, ReactNode } from "react";
import { cn } from "./utils";

export function Table({ className, children, ...props }: TableHTMLAttributes<HTMLTableElement> & { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full min-w-[760px] text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function Th({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) {
  return (
    <th className={cn("px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500", className)} {...props}>
      {children}
    </th>
  );
}

export function Td({ className, children, ...props }: TdHTMLAttributes<HTMLTableCellElement> & { children: ReactNode }) {
  return (
    <td className={cn("px-5 py-4 align-top text-slate-400", className)} {...props}>
      {children}
    </td>
  );
}
