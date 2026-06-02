import React from "react";
import { getBarColor } from "../project/utils";

interface ScoreBarProps {
  label: string;
  score: number;
  max: number;
  icon: React.ComponentType<{ className?: string }>;
}

export default function ScoreBar({ label, score, max, icon: Icon }: ScoreBarProps) {
  const pct = max > 0 ? Math.min(100, (score / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-700 font-medium">{label}</span>
          <span className="text-sm font-bold text-slate-800 ml-2 shrink-0">
            {score}
            <span className="text-xs text-gray-400 font-normal">/{max}</span>
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${getBarColor(score, max)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}