"use client";

import { ReactNode } from "react";

export default function StatCard({
  label,
  value,
  icon,
  accent = "text-(--color-1)",
  hint,
  loading = false,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: string;
  hint?: string;
  loading?: boolean;
}) {
  return (
    <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-5 flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        {loading ? (
          <div className="h-7 w-24 mt-2 rounded bg-white/5 animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-white mt-1 truncate">{value}</p>
        )}
        {hint && !loading && (
          <p className="text-xs text-gray-500 mt-1">{hint}</p>
        )}
      </div>
      {icon && (
        <div className={`shrink-0 text-2xl ${accent}`}>{icon}</div>
      )}
    </div>
  );
}
