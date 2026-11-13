"use client";

import { gsap } from "gsap";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function CinematicScrollMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("main").forEach((main) => {
        gsap.fromTo(
          main,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.68,
            ease: "power3.out",
            clearProps: "opacity,transform",
          },
        );
      });
    });

    if (typeof IntersectionObserver === "undefined") {
      return () => context.revert();
    }

    const headings = document.querySelectorAll<HTMLElement>("main section h1, main section h2");
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          if (typeof entry.target.animate === "function") {
            entry.target.animate(
              [
                { clipPath: "inset(0 0 100% 0)", opacity: 0, transform: "translateY(28px)" },
                { clipPath: "inset(0 0 0% 0)", opacity: 1, transform: "translateY(0)" },
              ],
              { duration: 900, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
            );
          }
          currentObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.01 },
    );
    headings.forEach((heading) => observer.observe(heading));

    return () => {
      observer.disconnect();
      context.revert();
    };
  }, [pathname]);

  return null;
}
