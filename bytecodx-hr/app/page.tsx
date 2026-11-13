import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Boxes, BrainCircuit, CloudCog, ShieldCheck, Sparkles } from "lucide-react";
import { FaqAccordion } from "@/components/FaqAccordion";
import { CyberpunkWorkforcePreview } from "@/components/CyberpunkWorkforcePreview";
import { ThreeHeroScene } from "@/components/ThreeHeroScene";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { PublicPage } from "@/components/PublicChrome";
import { ROICalculator } from "@/components/ROICalculator";
import { TechStackMarquee } from "@/components/TechStackMarquee";

const services = [
  { icon: BrainCircuit, title: "Placement intelligence", text: "Connect talent needs, role requirements, and a more coordinated recruitment pipeline.", span: "md:col-span-2" },
  { icon: Boxes, title: "Enterprise SaaS", text: "Build useful digital products around the way real teams work.", span: "" },
  { icon: ShieldCheck, title: "Zero-trust cloud & security", text: "Design access and workflows with accountability and protection in mind.", span: "" },
  { icon: CloudCog, title: "Digital modernization", text: "Bring people, data, and processes together with clear, maintainable systems.", span: "md:col-span-2" },
];

const leaders = [
  { name: "Joel Kirubainathan", role: "CEO", image: "/team/joel-kirubainathan.jpeg" },
  { name: "Poovarasan", role: "CTO", image: "/team/poovarasan.jpeg" },
  { name: "Sugasini", role: "CSO", image: "/team/sugasini.jpeg" },
  { name: "Dharun", role: "COO", image: "/team/dharun.jpeg" },
  { name: "Sri Abinaya", role: "CMO", image: "/team/sri-abinaya.jpeg" },
];

const metrics = [
  { value: "50+", label: "Enterprise clients" },
  { value: "120+", label: "Products shipped" },
  { value: "45+", label: "Engineers" },
  { value: "99.98%", label: "Uptime" },
];

export default function HomePage() {
  return (
    <PublicPage>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 grid-pattern opacity-25" />
        <ThreeHeroScene />
        <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-blue-500/15 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]" />
        <div className="relative mx-auto grid max-w-7xl items-start gap-12 px-5 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
          <Reveal delay={0.08}>
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100 sm:text-xs">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> BYTECODX ENTERPRISE v2.0 <span className="text-slate-500">|</span> PEOPLE OPERATIONS
            </div>
            <h1 className="max-w-3xl font-display text-5xl font-black leading-[0.98] tracking-[-0.06em] md:text-7xl">
              Building <span className="gradient-text gradient-text-animated">Intelligent</span> Digital Experiences.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Thoughtful digital products and people operations systems that help ambitious teams work with clarity, security, and momentum.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/contact" className="interactive-button interactive-button--primary interactive-button--arrow button-magnetic inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold">Start a conversation <ArrowRight size={17} /></Link>
              <Link href="/login" className="interactive-button interactive-button--outline inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white">Open HR portal <ArrowUpRight size={16} /></Link>
            </div>
          </div>
          </Reveal>

          <CyberpunkWorkforcePreview />

          <a href="#company-metrics" className="hero-scroll-cue col-span-full mx-auto mt-1 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 transition-colors hover:text-cyan-100">
            Scroll to explore
            <span aria-hidden="true" className="hero-scroll-cue__line"><span /></span>
          </a>
        </div>
      </section>

      <section id="company-metrics" aria-label="Company metrics" className="border-b border-white/10 bg-white/[0.02]">
        <Stagger className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-5 py-8 md:grid-cols-4 lg:px-8">
          {metrics.map((metric) => <StaggerItem key={metric.label} className="text-center"><div className="font-number text-3xl font-bold text-white md:text-4xl">{metric.value}</div><div className="mt-1 text-xs text-slate-400 md:text-sm">{metric.label}</div></StaggerItem>)}
        </Stagger>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-24">
        <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Core services</p><h2 className="mt-3 max-w-2xl font-display text-4xl font-bold md:text-5xl">Technology for how work really happens.</h2></div>
          <Link href="/services" className="interactive-button interactive-button--outline interactive-button--arrow inline-flex w-fit items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold">All services <ArrowRight size={15} /></Link>
        </div>
        <Stagger className="grid gap-4 md:grid-cols-3">
          {services.map(({ icon: Icon, title, text, span }, index) => <StaggerItem key={title} className={span}><article className={`glass-card h-full rounded-[26px] p-6 ${index === 0 ? "bg-gradient-to-br from-blue-500/10 to-transparent" : ""}`}><div className="inline-flex rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-3 text-cyan-100"><Icon size={22} /></div><h3 className="mt-5 font-display text-2xl font-semibold">{title}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">{text}</p></article></StaggerItem>)}
        </Stagger>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02] py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Leadership</p><h2 className="mt-3 font-display text-4xl font-bold">People behind the platform.</h2></div>
            <Link href="/team" className="interactive-button interactive-button--outline inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">Meet the team <ArrowUpRight size={15} /></Link>
          </div>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {leaders.map((member) => <StaggerItem key={member.name}><article className="group glass-card h-full overflow-hidden rounded-[22px]"><Image src={member.image} alt={`${member.name}, ${member.role}`} width={480} height={480} className="aspect-square w-full object-cover object-top transition duration-500 group-hover:scale-105" /><div className="p-4"><h3 className="font-display text-lg font-semibold">{member.name}</h3><p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-cyan-100">{member.role}</p></div></article></StaggerItem>)}
          </Stagger>
        </div>
      </section>

      <section className="py-12"><div className="mx-auto max-w-7xl px-5 lg:px-8"><p className="mb-5 text-center text-xs uppercase tracking-[0.2em] text-slate-500">Technology and capabilities</p><TechStackMarquee /></div></section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20"><ROICalculator /></section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div><p className="text-xs uppercase tracking-[0.22em] text-cyan-300">FAQ</p><h2 className="mt-3 font-display text-4xl font-bold">A few things teams ask.</h2><p className="mt-4 text-sm leading-6 text-slate-400">Want to discuss a specific workflow? Our team can help.</p></div>
          <FaqAccordion />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <Reveal className="relative overflow-hidden rounded-[32px] border border-cyan-300/15 bg-gradient-to-br from-blue-500/15 via-[#0b1220] to-emerald-500/10 p-8 md:p-12">
          <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-[90px]" />
          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center"><div><div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cyan-200"><Sparkles size={14} /> Make your next move</div><h2 className="mt-3 max-w-2xl font-display text-4xl font-bold md:text-5xl">Let’s build a more connected workplace.</h2><p className="mt-4 max-w-xl text-slate-300">Start a conversation about the tools and workflows your team needs.</p></div><Link href="/contact" className="interactive-button interactive-button--primary interactive-button--arrow inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-6 py-3 font-semibold">Contact ByteCodX <ArrowRight size={17} /></Link></div>
        </Reveal>
      </section>
    </PublicPage>
  );
}
