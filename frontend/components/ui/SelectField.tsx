"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

interface SelectFieldProps {
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onValueChange: (value: string) => void;
  hint?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
}

export function SelectField({
  label,
  options,
  value,
  onValueChange,
  hint,
  className = "",
  disabled = false,
  name
}: SelectFieldProps) {
  const id = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`relative grid gap-2 ${className}`} ref={wrapperRef}>
      <span className="text-sm font-medium text-slate-200" id={id}>
        {label}
      </span>
      {name ? <input name={name} type="hidden" value={value} /> : null}
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby={id}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-left text-sm text-slate-100 outline-none transition hover:border-slate-600 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="truncate">{selectedOption?.label ?? "Select"}</span>
        <Icon className={`h-4 w-4 shrink-0 text-slate-500 transition ${isOpen ? "rotate-180 text-emerald-300" : ""}`} name="chevron" />
      </button>
      {isOpen ? (
        <div
          aria-labelledby={id}
          className="absolute left-0 right-0 top-[4.75rem] z-30 max-h-64 overflow-auto rounded-2xl border border-slate-700 bg-slate-950 p-1 shadow-2xl shadow-black/35"
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                aria-selected={isSelected}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-400/20 ${
                  isSelected ? "bg-emerald-400/10 text-emerald-200" : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
                key={option.value}
                onClick={() => {
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
                role="option"
                type="button"
              >
                <span>{option.label}</span>
                {isSelected ? <span className="h-2 w-2 rounded-full bg-emerald-300" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </div>
  );
}
