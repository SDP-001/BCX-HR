"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch("/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Your message could not be sent.");
      form.reset();
      setMessage("Thanks for reaching out. Our team will be in touch.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Your message could not be sent.");
    } finally {
      setBusy(false);
    }
  }

  const control = "w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50";
  return (
    <form onSubmit={submit} className="space-y-4 rounded-[28px] border border-white/10 bg-[#111827]/70 p-5 md:p-7">
      <label className="block space-y-2 text-sm text-slate-300">Name<input className={control} name="name" autoComplete="name" minLength={2} maxLength={120} required /></label>
      <label className="block space-y-2 text-sm text-slate-300">Work email<input className={control} name="email" type="email" autoComplete="email" maxLength={254} required /></label>
      <label className="block space-y-2 text-sm text-slate-300">Company <span className="text-slate-500">(optional)</span><input className={control} name="company" autoComplete="organization" maxLength={120} /></label>
      <label className="block space-y-2 text-sm text-slate-300">How can we help?<textarea className={control} name="message" rows={5} minLength={10} maxLength={4000} required /></label>
      {error ? <p role="alert" className="text-sm text-rose-300">{error}</p> : null}
      {message ? <p role="status" className="text-sm text-emerald-300">{message}</p> : null}
      <button disabled={busy} className="interactive-button interactive-button--primary rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-60">{busy ? "Sending…" : "Send message"}</button>
    </form>
  );
}
