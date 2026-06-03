"use client";

interface NumberStepperProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  hint?: string;
  min?: number;
  quickValues?: number[];
  placeholder?: string;
}

export function NumberStepper({
  label,
  value,
  onValueChange,
  hint,
  min = 1,
  quickValues = [1, 2, 3, 5],
  placeholder
}: NumberStepperProps) {
  const parsedValue = Number(value);
  const numericValue = Number.isInteger(parsedValue) && parsedValue >= min ? parsedValue : min;

  function updateValue(nextValue: number) {
    onValueChange(String(Math.max(min, nextValue)));
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-3">
        <div className="flex items-center gap-3">
          <button
            aria-label={`Decrease ${label}`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-900 text-lg font-semibold text-slate-200 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/25"
            onClick={() => updateValue(numericValue - 1)}
            type="button"
          >
            -
          </button>
          <input
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-center text-lg font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/15"
            inputMode="numeric"
            onChange={(event) => onValueChange(event.target.value.replace(/[^\d]/g, ""))}
            pattern="[0-9]*"
            placeholder={placeholder}
            value={value}
          />
          <button
            aria-label={`Increase ${label}`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-lg font-semibold text-emerald-200 transition hover:bg-emerald-400/15 focus:outline-none focus:ring-2 focus:ring-emerald-400/25"
            onClick={() => updateValue(numericValue + 1)}
            type="button"
          >
            +
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickValues.map((quickValue) => (
            <button
              className={`min-h-8 rounded-xl px-3 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400/25 ${
                String(quickValue) === value
                  ? "bg-emerald-400 text-slate-950"
                  : "text-slate-300 hover:bg-slate-800/80"
              }`}
              key={quickValue}
              onClick={() => updateValue(quickValue)}
              type="button"
            >
              {quickValue}
            </button>
          ))}
        </div>
      </div>
      {hint ? <span className="text-xs leading-5 text-slate-500">{hint}</span> : null}
    </div>
  );
}
