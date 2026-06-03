"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface ConfirmDialogProps {
  confirmLabel?: string;
  description: string;
  isBusy?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export function ConfirmDialog({
  confirmLabel = "Delete",
  description,
  isBusy = false,
  isOpen,
  onClose,
  onConfirm,
  title
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isBusy) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isBusy, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center px-4 py-6" role="dialog">
      <button
        aria-label="Close confirmation"
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
        disabled={isBusy}
        onClick={onClose}
        type="button"
      />
      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl shadow-black/50">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/25 to-transparent" />
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-rose-400/20 bg-rose-400/10 text-rose-300">
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
              <path d="M12 8v5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              <path d="M12 16.5h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.8" />
              <path
                d="M10.3 4.8 3.6 17.1A2 2 0 0 0 5.4 20h13.2a2 2 0 0 0 1.8-2.9L13.7 4.8a1.95 1.95 0 0 0-3.4 0Z"
                stroke="currentColor"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button className="sm:min-w-28" disabled={isBusy} onClick={onClose} type="button" variant="ghost">
            Cancel
          </Button>
          <Button className="sm:min-w-28" disabled={isBusy} onClick={onConfirm} type="button" variant="danger">
            {isBusy ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
