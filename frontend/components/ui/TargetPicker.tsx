"use client";

import { Button } from "@/components/ui/Button";

interface TargetPickerProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  hint?: string;
  quickValues?: number[];
  min?: number;
  max?: number;
}

export function TargetPicker({
  label,
  value,
  onValueChange,
  hint,
  quickValues = [1, 3, 5, 7],
  min = 1,
  max = 10000
}: TargetPickerProps) {
  const parsedValue = Number(value);
  const numericValue = Number.isInteger(parsedValue) && parsedValue >= min ? parsedValue : min;
  const isAboveMax = Number.isInteger(parsedValue) && parsedValue > max;

  function updateValue(nextValue: number) {
    onValueChange(String(Math.min(max, Math.max(min, nextValue))));
  }

  function handleInputChange(nextValue: string) {
    const digitsOnly = nextValue.replace(/[^\d]/g, "");
    if (!digitsOnly) {
      onValueChange("");
      return;
    }

    updateValue(Number(digitsOnly));
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-3">
        <div className="flex items-center gap-3">
          <button
            aria-label="Decrease weekly target"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-900 text-lg font-semibold text-slate-200 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/25"
            disabled={numericValue <= min}
            onClick={() => updateValue(numericValue - 1)}
            type="button"
          >
            -
          </button>
          <input
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-center text-lg font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/15"
            inputMode="numeric"
            onChange={(event) => handleInputChange(event.target.value)}
            pattern="[0-9]*"
            value={value}
          />
          <button
            aria-label="Increase weekly target"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-lg font-semibold text-emerald-200 transition hover:bg-emerald-400/15 focus:outline-none focus:ring-2 focus:ring-emerald-400/25"
            disabled={numericValue >= max}
            onClick={() => updateValue(numericValue + 1)}
            type="button"
          >
            +
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickValues.filter((quickValue) => quickValue <= max).map((quickValue) => (
            <Button
              className="min-h-9 px-3 py-1.5 text-xs"
              key={quickValue}
              onClick={() => updateValue(quickValue)}
              type="button"
              variant={String(quickValue) === value ? "primary" : "ghost"}
            >
              {quickValue}
            </Button>
          ))}
        </div>
      </div>
      {hint ? <span className="text-xs leading-5 text-slate-500">{hint} Maximum: {max}.</span> : null}
      {isAboveMax ? <span className="text-xs leading-5 text-rose-300">Target cannot be above {max}.</span> : null}
    </div>
  );
}
