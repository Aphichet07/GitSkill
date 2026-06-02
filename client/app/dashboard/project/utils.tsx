export function getBarColor(score: number, max: number): string {
  const pct = (score / max) * 100;
    if (pct >= 80) return "bg-emerald-500";
    if (pct >= 60) return "bg-blue-500";
    if (pct >= 40) return "bg-amber-400";
    return "bg-red-400";
}

export function getCodeStatStyle(value: number, warnAt: number, badAt: number): string {
    if (value === 0) return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (value <= warnAt) return "bg-amber-50 text-amber-700 border-amber-100";
    if (value <= badAt) return "bg-orange-50 text-orange-700 border-orange-100";
    return "bg-red-50 text-red-700 border-red-100";
}