import React from "react";


interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

export default function StatCard({ title, value, subtitle, icon: Icon, colorClass }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
      <div className={`w-10 h-10 sm:w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-500 leading-tight truncate">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5 leading-tight truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}