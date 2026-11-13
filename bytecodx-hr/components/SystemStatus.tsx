"use client";

import { useEffect, useState } from "react";

export function SystemStatus() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    async function check() {
      try {
        const response = await fetch("/api/health", { cache: "no-store" });
        const result = await response.json();
        if (active) setOnline(response.ok && result.status === "operational");
      } catch {
        if (active) setOnline(false);
      }
    }
    void check();
    const intervalId = window.setInterval(() => void check(), 30000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return <p className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400"><span className={`h-2 w-2 rounded-full ${online === null ? "bg-amber-300" : online ? "animate-pulse bg-emerald-400" : "bg-rose-400"}`} />{online === null ? "Checking system status" : online ? "Systems operational" : "System status unavailable"}</p>;
}
