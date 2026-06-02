import React from "react";

export default function LanguageBar({ languages }: { languages: Record<string, number> }) {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  const COLORS = [
    "bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-400",
    "bg-red-400", "bg-pink-500", "bg-cyan-500", "bg-indigo-400",
  ];

  const sorted = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([lang, bytes], i) => ({
      lang,
      pct: (bytes / total) * 100,
      color: COLORS[i % COLORS.length],
    }));

  return (
    <div className="space-y-3">
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {sorted.map(({ lang, pct, color }) => (
          <div key={lang} className={`${color} h-full`} style={{ width: `${pct}%` }} title={`${lang}: ${pct.toFixed(1)}%`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {sorted.map(({ lang, pct, color }) => (
          <div key={lang} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-xs font-medium text-gray-700">{lang}</span>
            <span className="text-xs text-gray-400">{pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}