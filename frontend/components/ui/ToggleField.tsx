"use client";

interface ToggleFieldProps {
  checked: boolean;
  label: string;
  hint?: string;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function ToggleField({ checked, label, hint, disabled = false, onCheckedChange }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-3">
      <span>
        <span className="block text-sm font-medium text-slate-100">{label}</span>
        {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
      </span>
      <button
        aria-checked={checked}
        aria-label={label}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60 ${
          checked ? "border-emerald-400/40 bg-emerald-400/25" : "border-slate-700 bg-slate-900"
        }`}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        role="switch"
        type="button"
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full transition ${
            checked ? "left-6 bg-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.45)]" : "left-1 bg-slate-500"
          }`}
        />
      </button>
    </div>
  );
}
