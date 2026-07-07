import type { ReactNode } from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon?: ReactNode;
  actions?: ReactNode;
  tone?: "cyan" | "emerald" | "amber" | "rose" | "slate";
};

export function PageHeader({ eyebrow, title, description, icon, actions, tone = "cyan" }: PageHeaderProps) {
  return (
    <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(14,165,233,0.14),rgba(15,23,42,0.86))] p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge tone={tone}>{icon}{eyebrow}</Badge>
          <h1 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
        </div>
        {actions && <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div>}
      </div>
    </Card>
  );
}
