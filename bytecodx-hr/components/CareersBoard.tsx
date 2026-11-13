"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, X } from "lucide-react";

type Vacancy = {
  id: number;
  title: string;
  department: string;
  description: string;
  required_skills: string | null;
  experience: string | null;
  employment_type: string | null;
  application_deadline: string | null;
};

export function CareersBoard({ vacancies }: { vacancies: Vacancy[] }) {
  const [selected, setSelected] = useState<Vacancy | null>(null);
  const [department, setDepartment] = useState("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    setMessage("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/public/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, vacancyId: selected.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Your application could not be submitted.");
      setMessage("Application received. Thank you for your interest.");
      form.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Your application could not be submitted.");
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50";
  const departments = [...new Set(vacancies.map((job) => job.department))].sort();
  const filteredVacancies = vacancies.filter((job) =>
    (department === "all" || job.department === department) &&
    `${job.title} ${job.department} ${job.description} ${job.required_skills ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    <>
      {vacancies.length ? (
        <>
        <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="sr-only" htmlFor="careers-search">Search open roles</label>
          <input id="careers-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles or skills" className={input} />
          <label className="sr-only" htmlFor="careers-department">Filter by department</label>
          <select id="careers-department" value={department} onChange={(event) => setDepartment(event.target.value)} className={`${input} sm:min-w-48`}>
            <option value="all">All departments</option>
            {departments.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        {filteredVacancies.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredVacancies.map((job) => (
            <article key={job.id} className="glass-card rounded-[24px] p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100">{job.department}</span>
                <span className="text-xs text-slate-400">{(job.employment_type ?? "full_time").replaceAll("_", " ")}</span>
              </div>
              <h2 className="mt-5 font-display text-2xl font-semibold">{job.title}</h2>
              <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-300">{job.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.experience ? <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">{job.experience}</span> : null}
                {job.application_deadline ? <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">Apply by {job.application_deadline}</span> : null}
              </div>
              {job.required_skills ? <p className="mt-4 text-xs leading-5 text-slate-400"><span className="text-slate-300">Skills:</span> {job.required_skills}</p> : null}
              <button onClick={() => { setSelected(job); setError(""); setMessage(""); }} className="interactive-button interactive-button--outline interactive-button--arrow mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white">
                Apply for this role <ArrowUpRight size={15} />
              </button>
            </article>
          ))}
        </div>
        ) : <p className="rounded-2xl border border-white/10 p-6 text-center text-sm text-slate-400">No open roles match those filters.</p>}
        </>
      ) : (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="font-display text-xl font-semibold">No open roles right now</p>
          <p className="mt-2 text-sm text-slate-400">Please check back soon for future opportunities.</p>
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4" role="dialog" aria-modal="true" aria-labelledby="apply-title">
          <div className="my-auto w-full max-w-xl rounded-[28px] border border-white/10 bg-[#0b1220] p-5 shadow-2xl md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Job application</p><h2 id="apply-title" className="mt-2 font-display text-2xl font-semibold">{selected.title}</h2></div>
              <button onClick={() => setSelected(null)} aria-label="Close application" className="interactive-button interactive-button--icon rounded-lg p-2"><X size={18} /></button>
            </div>
            <form onSubmit={apply} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs text-slate-300">Full name<input name="name" autoComplete="name" required minLength={2} maxLength={120} className={input} /></label>
              <label className="space-y-1.5 text-xs text-slate-300">Email<input name="email" type="email" autoComplete="email" required maxLength={254} className={input} /></label>
              <label className="space-y-1.5 text-xs text-slate-300">Phone<input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={30} className={input} /></label>
              <label className="space-y-1.5 text-xs text-slate-300">Resume link <span className="text-slate-500">(optional)</span><input name="resumeUrl" type="url" maxLength={2000} placeholder="https://" className={input} /></label>
              <div className="space-y-3 sm:col-span-2">
                {error ? <p role="alert" className="text-sm text-rose-300">{error}</p> : null}
                {message ? <p role="status" className="text-sm text-emerald-300">{message}</p> : null}
                <button disabled={busy} className="interactive-button interactive-button--primary rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-60">{busy ? "Submitting…" : "Submit application"}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
