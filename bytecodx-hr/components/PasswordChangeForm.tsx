"use client";

import { useState, type FormEvent } from "react";

export function PasswordChangeForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("currentPassword") ?? "");
    const newPassword = String(data.get("newPassword") ?? "");
    if (newPassword !== String(data.get("confirmPassword") ?? "")) {
      setError("New passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Password could not be changed.");
      form.reset();
      setMessage("Password updated. Your other sessions have been invalidated.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Password could not be changed.");
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50";
  return (
    <form onSubmit={submit} className="rounded-[26px] border border-white/10 bg-[#111827]/70 p-5 md:p-6">
      <h2 className="font-display text-xl font-semibold text-white">Change password</h2>
      <p className="mt-1 text-sm text-slate-400">Use at least 12 characters. Updating your password signs out other active sessions.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <label className="space-y-1.5 text-xs text-slate-300">Current password<input name="currentPassword" type="password" autoComplete="current-password" required className={input} /></label>
        <label className="space-y-1.5 text-xs text-slate-300">New password<input name="newPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required className={input} /></label>
        <label className="space-y-1.5 text-xs text-slate-300">Confirm new password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required className={input} /></label>
      </div>
      {error ? <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p> : null}
      {message ? <p role="status" className="mt-3 text-sm text-emerald-300">{message}</p> : null}
      <button disabled={busy} className="interactive-button interactive-button--primary mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50">{busy ? "Updating…" : "Update password"}</button>
    </form>
  );
}
