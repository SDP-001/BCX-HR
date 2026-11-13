"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ScrollRevealMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const targets = document.querySelectorAll<HTMLElement>("main section, main article, main form");
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          if (typeof entry.target.animate === "function") {
            entry.target.animate(
              [
                { transform: "translateY(20px)", filter: "blur(2px)" },
                { transform: "translateY(0)", filter: "blur(0)" },
              ],
              { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
            );
          }
          currentObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.01 },
    );
    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
