"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const ThreeHeroSceneCanvas = dynamic(
  () => import("@/components/ThreeHeroSceneCanvas"),
  { ssr: false },
);

export function ThreeHeroScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  const handleWebglUnavailable = useCallback(() => {
    setWebglUnavailable(true);
  }, []);

  useEffect(() => {
    if (reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scene = sceneRef.current;
    if (!scene) return;

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(scene);

    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <div ref={sceneRef} aria-hidden="true" className="three-hero-scene pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="three-hero-scene__fallback absolute inset-0 overflow-hidden">
        <span className="three-hero-scene__fallback-orb" />
        <span className="three-hero-scene__fallback-ring three-hero-scene__fallback-ring--one" />
        <span className="three-hero-scene__fallback-ring three-hero-scene__fallback-ring--two" />
      </div>
      {isNearViewport && !reduceMotion && !webglUnavailable ? (
        <ThreeHeroSceneCanvas onUnavailable={handleWebglUnavailable} />
      ) : null}
    </div>
  );
}
