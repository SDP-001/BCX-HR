"use client";

import { useState } from "react";

export function ROICalculator() {
  const [employees, setEmployees] = useState(50);
  const [hours, setHours] = useState(4);
  const [efficiency, setEfficiency] = useState(25);
  const monthlyHours = Math.round(employees * hours * efficiency / 100 * 4.33);

  return (
    <section className="glass-card rounded-[30px] p-6 md:p-9">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Efficiency calculator</p>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Estimate the time your team could get back.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">Adjust the assumptions to create an illustrative estimate. Actual results vary by workflow and adoption.</p>
          <div className="mt-7 space-y-6">
            <label className="block text-sm text-slate-200">Team size <span className="float-right font-number text-cyan-100">{employees} people</span><input aria-label="Team size" type="range" min="5" max="500" step="5" value={employees} onChange={(event) => setEmployees(Number(event.target.value))} className="mt-3 w-full accent-cyan-400" /></label>
            <label className="block text-sm text-slate-200">Admin hours per person each week <span className="float-right font-number text-cyan-100">{hours} hrs</span><input aria-label="Admin hours per person each week" type="range" min="1" max="12" value={hours} onChange={(event) => setHours(Number(event.target.value))} className="mt-3 w-full accent-cyan-400" /></label>
            <label className="block text-sm text-slate-200">Potential efficiency improvement <span className="float-right font-number text-cyan-100">{efficiency}%</span><input aria-label="Potential efficiency improvement" type="range" min="5" max="60" step="5" value={efficiency} onChange={(event) => setEfficiency(Number(event.target.value))} className="mt-3 w-full accent-cyan-400" /></label>
          </div>
        </div>
        <div className="rounded-[26px] border border-cyan-400/15 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-emerald-500/10 p-7 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Illustrative monthly time reclaimed</p>
          <p aria-live="polite" className="mt-4 font-number text-6xl font-bold text-white">{monthlyHours.toLocaleString()}<span className="ml-2 text-2xl text-cyan-200">hrs</span></p>
          <p className="mt-3 text-sm text-slate-300">Based on your selected team size, admin time, and improvement assumption.</p>
        </div>
      </div>
    </section>
  );
}
