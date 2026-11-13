"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const fieldClass = "w-full rounded-xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50";

export function ForgotPasswordForm() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    setMessage("");
    setResetUrl("");
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: new FormData(form).get("email") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Password recovery is unavailable.");
      setMessage(result.message);
      setResetUrl(result.resetUrl ?? "");
      form.reset();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Password recovery is unavailable.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block space-y-2 text-sm text-slate-300">Account email<input name="email" type="email" autoComplete="email" required maxLength={254} className={fieldClass} /></label>
      {error ? <p role="alert" className="text-sm text-rose-300">{error}</p> : null}
      {message ? <p role="status" className="text-sm text-emerald-300">{message}</p> : null}
      {resetUrl ? <Link className="block break-all text-sm text-cyan-200 underline" href={resetUrl}>Continue to password reset</Link> : null}
      <button disabled={busy} className="interactive-button interactive-button--primary w-full rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-60">{busy ? "Sending…" : "Send recovery instructions"}</button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const password = String(values.get("password") ?? "");
    if (password !== String(values.get("confirmPassword") ?? "")) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Password could not be reset.");
      setMessage("Password updated. You can now sign in with your new password.");
      form.reset();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Password could not be reset.");
    } finally {
      setBusy(false);
    }
  }

  if (!token) return <p role="alert" className="text-sm text-rose-300">This password reset link is invalid or expired. Request a new link to continue.</p>;
  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block space-y-2 text-sm text-slate-300">New password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required className={fieldClass} /></label>
      <label className="block space-y-2 text-sm text-slate-300">Confirm new password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required className={fieldClass} /></label>
      {error ? <p role="alert" className="text-sm text-rose-300">{error}</p> : null}
      {message ? <p role="status" className="text-sm text-emerald-300">{message}</p> : null}
      <button disabled={busy || Boolean(message)} className="interactive-button interactive-button--primary w-full rounded-xl px-5 py-3 text-sm font-semibold disabled:opacity-60">{busy ? "Updating…" : "Update password"}</button>
    </form>
  );
}
