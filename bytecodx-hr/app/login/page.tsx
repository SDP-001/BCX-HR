"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, MailCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { BrandLogo } from "@/components/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ emailOrPhone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const demoExecutives = [
    { role: "CEO", email: "ceo@bytecodx.com" },
    { role: "CTO", email: "cto@bytecodx.com" },
    { role: "COO", email: "coo@bytecodx.com" },
    { role: "CSO", email: "cso@bytecodx.com" },
    { role: "CMO", email: "cmo@bytecodx.com" },
  ];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rememberMe }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Login failed.");

      router.push("/portal");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#03010E] px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0a0f1c]/80 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(8,123,255,0.28),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(0,184,232,0.24),_transparent_25%),linear-gradient(135deg,#03010E_0%,#0b1222_100%)] p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center justify-between">
            <BrandLogo compact />
          </div>
          <div className="max-w-md">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-200">Secure access</div>
            <h1 className="font-display text-5xl font-black tracking-[-0.06em] text-white">Welcome back to ByteCodX.</h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">Manage your workforce, attendance, projects, and leadership insights from a single secure platform.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-400">Executive accounts</div>
              <div className="mt-3 font-number text-3xl font-bold text-white">05</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-400">Live HR modules</div>
              <div className="mt-3 font-number text-3xl font-bold text-white">13</div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Login</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-white">Secure access</h2>
            </div>
            <Link href="/" className="interactive-button interactive-button--glass rounded-full px-3 py-2 text-sm text-slate-300">Back home</Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="emailOrPhone" className="text-sm font-medium text-slate-200">Email Address / Phone Number</label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1527] px-4 py-3">
                <MailCheck className="text-slate-400" size={18} />
                <input
                  id="emailOrPhone"
                  value={form.emailOrPhone}
                  onChange={(event) => {
                    setError("");
                    setForm((current) => ({ ...current, emailOrPhone: event.target.value }));
                  }}
                  className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                  placeholder="ceo@bytecodx.com"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-200">Password</label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0d1527] px-4 py-3">
                <LockKeyhole className="text-slate-400" size={18} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => {
                    setError("");
                    setForm((current) => ({ ...current, password: event.target.value }));
                  }}
                  className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="interactive-button interactive-button--icon rounded-lg p-2 text-slate-400 transition hover:text-white" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-300">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-[#0d1527]"
                /> Remember me
              </label>
              <Link href="/forgot-password" className="text-cyan-300 transition hover:text-cyan-200">Forgot password?</Link>
            </div>

            {error ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="interactive-button interactive-button--primary button-magnetic flex w-full items-center justify-center rounded-2xl px-4 py-3 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Login securely"}
            </button>
          </form>

          {process.env.NODE_ENV !== "production" ? (
            <div className="mt-8 rounded-2xl border border-cyan-400/15 bg-cyan-500/5 p-4 text-sm text-slate-300">
              <div className="font-semibold text-cyan-200">Quick executive access</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {demoExecutives.map(({ role, email }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setError("");
                      setForm({ emailOrPhone: email, password: "ByteCodx@2025!" });
                    }}
                    className="interactive-button interactive-button--glass rounded-full px-3 py-1.5 text-xs font-semibold text-slate-100"
                  >
                    {role}
                  </button>
                ))}
              </div>
              <div className="mt-3 text-xs text-slate-400">Demo password: <span className="font-mono text-cyan-200">ByteCodx@2025!</span></div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
