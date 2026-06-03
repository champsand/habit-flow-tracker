export function LoadingState() {
  return (
    <div className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
      {[0, 1, 2].map((item) => (
        <div className="h-16 animate-pulse rounded-2xl bg-slate-800/70" key={item} />
      ))}
    </div>
  );
}
