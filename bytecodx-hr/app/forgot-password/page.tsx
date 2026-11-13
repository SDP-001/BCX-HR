import Link from "next/link";
import { PublicPage } from "@/components/PublicChrome";
import { ForgotPasswordForm } from "@/components/PasswordRecoveryForms";

export default function ForgotPasswordPage() {
  return (
    <PublicPage>
      <section className="mx-auto max-w-xl px-5 py-20">
        <div className="glass-card rounded-[28px] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Account recovery</p>
          <h1 className="mt-3 font-display text-3xl font-bold">Forgot your password?</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Enter your account email. If it matches an active account, we’ll send a secure recovery link.</p>
          <div className="mt-6"><ForgotPasswordForm /></div>
          <Link href="/login" className="mt-5 inline-block text-sm text-slate-400 transition hover:text-white">Return to sign in</Link>
        </div>
      </section>
    </PublicPage>
  );
}
