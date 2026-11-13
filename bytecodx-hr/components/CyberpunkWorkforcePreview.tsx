"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Activity, ShieldCheck } from "lucide-react";
import { useRef, type PointerEvent } from "react";

const activity = [32, 54, 43, 74, 58, 88, 68, 96];

export function CyberpunkWorkforcePreview() {
  const reduce = useReducedMotion();
  const sceneRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ["start end", "end start"] });
  const sceneY = useTransform(scrollYProgress, [0, 1], [17, -17]);
  const rotateX = useSpring(0, { stiffness: 160, damping: 22 });
  const rotateY = useSpring(0, { stiffness: 160, damping: 22 });
  const glowX = useSpring(-240, { stiffness: 120, damping: 24 });
  const glowY = useSpring(-240, { stiffness: 120, damping: 24 });
  const glowOpacity = useSpring(0, { stiffness: 120, damping: 24 });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    rotateX.set(((y / bounds.height) - 0.5) * -8);
    rotateY.set(((x / bounds.width) - 0.5) * 8);
    glowX.set(x - 120);
    glowY.set(y - 120);
    glowOpacity.set(1);
  };

  const handlePointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glowOpacity.set(0);
  };

  return (
    <div ref={sceneRef} className="relative [perspective:1200px]">
      <div aria-hidden="true" className="hero-scene-orbit hero-scene-orbit--outer" />
      <div aria-hidden="true" className="hero-scene-orbit hero-scene-orbit--inner" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-7 left-1/4 right-1/4 h-10 rounded-[50%] bg-cyan-400/25 blur-2xl" />
      <motion.div
        className="relative z-10"
        style={{ y: reduce ? 0 : sceneY, transformStyle: "preserve-3d" }}
      >
        <motion.div
          className="relative"
          animate={reduce ? undefined : { y: [0, -7, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{ rotateX, rotateY, transformPerspective: 1200, transformStyle: "preserve-3d" }}
        >
        <motion.div
          aria-hidden="true"
          className="hero-scene-cursor-glow"
          style={{ x: glowX, y: glowY, opacity: glowOpacity }}
        />
        <div className="glass-card noise relative rounded-[28px] p-3 md:p-5">
      <div className="relative isolate overflow-hidden rounded-[24px] border border-cyan-300/15 bg-[#050a13]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-20">
          <div className="grid-pattern absolute inset-0" />
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-[90px]" />
          <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-emerald-400/15 blur-[90px]" />
        </div>

        <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            <span className="h-2 w-2 rounded-full bg-amber-300" />
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="ml-2 text-xs text-slate-400">ByteCodX workforce overview</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] text-emerald-200">
            <motion.span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-emerald-300"
              animate={reduce ? undefined : { opacity: [0.45, 1, 0.45], scale: [0.85, 1.15, 0.85] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            LIVE PREVIEW
          </span>
        </div>

        <div className="relative p-4 sm:p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/70">Team pulse / 01</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-white">People, in sync.</h2>
            </div>
            <div className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[10px] text-slate-400 sm:flex">
              <Activity size={13} className="text-cyan-200" />
              SYSTEMS NOMINAL
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1.05fr_0.95fr]">
            <div className="relative flex min-h-44 items-center justify-center overflow-hidden rounded-2xl border border-cyan-200/10 bg-[#07101b]/90 p-4">
              <div aria-hidden="true" className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(103,232,249,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.12)_1px,transparent_1px)] [background-size:22px_22px]" />
              <motion.div
                aria-hidden="true"
                className="absolute h-36 w-36 rounded-full border border-cyan-300/15"
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
              >
                <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
              </motion.div>
              <motion.div
                aria-hidden="true"
                className="absolute h-28 w-28 rounded-full border border-dashed border-emerald-300/20"
                animate={reduce ? undefined : { rotate: -360 }}
                transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
              />
              <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full border border-cyan-200/20 bg-[#07101b]/90 shadow-[0_0_35px_rgba(8,145,178,0.16)]">
                <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="2" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="url(#workforce-gauge)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={reduce ? { pathLength: 0.948 } : { pathLength: 0 }}
                    animate={{ pathLength: 0.948 }}
                    transition={{ duration: 1.5, delay: 0.25, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="workforce-gauge" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="font-number text-2xl font-bold text-white">94.8%</span>
                <span className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-slate-400">Attendance</span>
              </div>
              <span className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.16em] text-cyan-100/45">Workforce / active</span>
            </div>

            <div className="grid grid-rows-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">Open work items</p>
                  <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-2 py-0.5 text-[9px] text-emerald-200">+12.6%</span>
                </div>
                <p className="mt-3 font-number text-3xl font-semibold text-white">24</p>
                <p className="mt-1 text-[10px] text-slate-500">Across active teams</p>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-cyan-200/10 bg-gradient-to-br from-cyan-300/[0.08] to-emerald-300/[0.035] p-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Security status</p>
                  <p className="mt-2 text-sm font-medium text-white">Access protected</p>
                </div>
                <motion.div
                  animate={reduce ? undefined : { scale: [1, 1.08, 1], filter: ["drop-shadow(0 0 0px rgba(52,211,153,0))", "drop-shadow(0 0 9px rgba(52,211,153,0.6))", "drop-shadow(0 0 0px rgba(52,211,153,0))"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ShieldCheck className="text-emerald-200" size={24} />
                </motion.div>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-[#07101b]/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">Delivery rhythm</p>
                <p className="mt-1 text-xs text-slate-300">Operations signals, connected.</p>
              </div>
              <span className="font-number text-[10px] text-cyan-100/70">LAST 8 WEEKS</span>
            </div>
            <div className="flex h-12 items-end gap-2">
              {activity.map((height, index) => (
                <motion.span
                  key={index}
                  aria-hidden="true"
                  className="relative flex-1 overflow-hidden rounded-t-sm bg-gradient-to-t from-blue-500/45 via-cyan-300/80 to-emerald-200"
                  initial={reduce ? { height: `${height}%` } : { height: "8%" }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.75, delay: 0.2 + index * 0.07, ease: "easeOut" }}
                >
                  <span className="absolute inset-x-0 top-0 h-px bg-white/70" />
                </motion.span>
              ))}
            </div>
          </div>
          <p className="mt-3 text-[10px] text-slate-500">Illustrative interface preview—not live company data.</p>
        </div>
      </div>
        </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
