export function VisitasChart({
  meses,
}: {
  meses: { key: string; label: string; count: number }[];
}) {
  const max = Math.max(1, ...meses.map((m) => m.count));

  return (
    <div className="flex items-end justify-between gap-2 h-36 pt-2">
      {meses.map((m) => {
        const heightPct = (m.count / max) * 100;
        return (
          <div key={m.key} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <span className="text-xs font-semibold tabular-nums">{m.count}</span>
            <div
              className="w-full max-w-10 rounded-t-md bg-primary/80 min-h-1 transition-all"
              style={{ height: `${Math.max(heightPct, 3)}%` }}
              aria-label={`${m.count} visitas em ${m.label}`}
            />
            <span className="text-xs text-muted-foreground capitalize">{m.label}</span>
          </div>
        );
      })}
    </div>
  );
}
