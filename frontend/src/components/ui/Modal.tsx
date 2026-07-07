import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.65)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <Button variant="ghost" className="h-9 w-9 p-0" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
