import { ArrowRight, Compass, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { PublicPage } from "@/components/PublicChrome";

const principles = [
  { icon: Compass, title: "Clarity", text: "Give every team a shared view of priorities, ownership, and progress." },
  { icon: HeartHandshake, title: "People first", text: "Make the employee experience thoughtful across the entire work lifecycle." },
  { icon: ShieldCheck, title: "Trust by design", text: "Protect sensitive people data with clear access controls and accountable workflows." },
];

export default function AboutPage() {
  return (
    <PublicPage>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 grid-pattern opacity-15" />
        <Reveal className="relative mx-auto max-w-7xl px-5 py-20 md:py-28 lg:px-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100"><Sparkles size={13} /> About ByteCodX</div>
          <h1 className="max-w-4xl font-display text-5xl font-black leading-[1.02] tracking-tight md:text-7xl">Better work starts with <span className="gradient-text">better operations.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">We bring people, processes, and useful workforce insights into one connected experience—so growing teams can spend less time chasing information and more time moving forward.</p>
        </Reveal>
      </section>
      <Stagger className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-2 md:py-24 lg:px-8">
        <StaggerItem><article className="glass-card h-full rounded-[28px] p-7 md:p-9"><p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Our mission</p><h2 className="mt-4 font-display text-3xl font-bold">Make people operations feel effortless.</h2><p className="mt-4 leading-7 text-slate-300">ByteCodX helps organizations connect everyday HR work—from hiring and onboarding to attendance, leave, and team planning—in a secure, clear, and practical workspace.</p></article></StaggerItem>
        <StaggerItem><article className="glass-card h-full rounded-[28px] p-7 md:p-9"><p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Our vision</p><h2 className="mt-4 font-display text-3xl font-bold">Workplaces where people can do their best work.</h2><p className="mt-4 leading-7 text-slate-300">We believe technology should remove friction, support good decisions, and give every person a more transparent experience at work.</p></article></StaggerItem>
      </Stagger>
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">What guides us</p>
        <h2 className="mt-3 font-display text-4xl font-bold">Principles that shape the platform.</h2>
        <Stagger className="mt-8 grid gap-5 md:grid-cols-3">
          {principles.map(({ icon: Icon, title, text }) => <StaggerItem key={title}><article className="glass-card h-full rounded-[24px] p-6"><Icon className="text-cyan-200" size={24} /><h3 className="mt-5 font-display text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{text}</p></article></StaggerItem>)}
        </Stagger>
        <Link href="/services" className="interactive-button interactive-button--outline interactive-button--arrow mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">Explore our services <ArrowRight size={16} /></Link>
      </section>
      <section className="border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Our journey</p>
          <h2 className="mt-3 font-display text-4xl font-bold">From people needs to connected systems.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Understand", "Start with the people, teams, and workflows behind the work."],
              ["Connect", "Bring useful tools and information into a clearer operating picture."],
              ["Improve", "Use feedback and visibility to keep making the experience better."],
            ].map(([title, text], index) => <article key={title} className="rounded-2xl border border-white/10 bg-[#0b1220] p-5"><span className="font-number text-xs text-cyan-200">0{index + 1}</span><h3 className="mt-3 font-display text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></article>)}
          </div>
        </div>
      </section>
    </PublicPage>
  );
}
