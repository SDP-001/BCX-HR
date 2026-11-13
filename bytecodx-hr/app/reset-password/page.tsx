import Link from "next/link";
import { PublicPage } from "@/components/PublicChrome";
import { ResetPasswordForm } from "@/components/PasswordRecoveryForms";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <PublicPage>
      <section className="mx-auto max-w-xl px-5 py-20">
        <div className="glass-card rounded-[28px] p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Secure account recovery</p>
          <h1 className="mt-3 font-display text-3xl font-bold">Choose a new password</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">Use at least 12 characters. Reset links expire after 30 minutes and can only be used once.</p>
          <div className="mt-6"><ResetPasswordForm token={token ?? ""} /></div>
          <Link href="/forgot-password" className="mt-5 inline-block text-sm text-slate-400 transition hover:text-white">Request another link</Link>
        </div>
      </section>
    </PublicPage>
  );
}
