"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TopUpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-(--color-1) border-t-transparent" />
        <p className="text-sm">Redirecting to Top Up...</p>
      </div>
    </div>
  );
}
