"use client";

import { useEffect } from "react";
import { usePublicSettingsStore } from "@/store/publicSettings";

export default function PublicSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const fetchSettings = usePublicSettingsStore((s) => s.fetchSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return <>{children}</>;
}