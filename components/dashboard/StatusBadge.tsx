"use client";

import { ReactNode } from "react";

type Tone = "green" | "amber" | "red" | "gray" | "blue" | "purple";

const TONE_CLASS: Record<Tone, string> = {
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  gray: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  blue: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  purple: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

const STATUS_TONE: Record<string, Tone> = {
  PAID: "green",
  PENDING: "amber",
  FAILED: "red",
  EXPIRED: "gray",
  OPEN: "blue",
  RESOLVED: "green",
  CLOSED: "gray",
  APPROVED: "green",
  REJECTED: "red",
  CREATE: "green",
  UPDATE: "amber",
  DELETE: "red",
};

export function toneForStatus(status: string): Tone {
  return STATUS_TONE[status?.toUpperCase()] ?? "gray";
}

export default function StatusBadge({
  status,
  tone,
  icon,
}: {
  status: string;
  tone?: Tone;
  icon?: ReactNode;
}) {
  const resolved = tone ?? toneForStatus(status);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${TONE_CLASS[resolved]}`}
    >
      {icon}
      {status}
    </span>
  );
}
