"use client";

import { useEffect, useState } from "react";
import SkeletonLoad from "./Skeleton";

export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <SkeletonLoad />;

  return <>{children}</>;
}