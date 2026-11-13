"use client";

import Link from "next/link";
import Image from "next/image";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, Building2, CircleArrowRight, Landmark, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";

const ease = [0.22, 1, 0.36, 1] as const;

const services = [
  { icon: BriefcaseBusiness, title: "HR Operations", description: "Smart workforce management, attendance, onboarding, and compliance workflows." },
  { icon: Users, title: "Talent Experience", description: "From hiring to performance tracking, we help teams stay engaged and focused." },
  { icon: Building2, title: "Business Planning", description: "Executive dashboards, reporting, and strategic portfolio planning built to scale." },
];

const expertise = [
  "Modern talent systems",
  "Secure role-based access",
  "Corporate analytics and insights",
  "Employee lifecycle automation",
];

const team = [
  { name: "Joel Kirubainathan", role: "Chief Executive Officer", image: "/team/joel-kirubainathan.jpeg" },
  { name: "Poovarasan", role: "Chief Technology Officer", image: "/team/poovarasan.jpeg" },
  { name: "Dharun", role: "Chief Operating Officer", image: "/team/dharun.jpeg" },
  { name: "Sugasini", role: "Chief Strategy Officer", image: "/team/sugasini.jpeg" },
  { name: "Sri Abinaya", role: "Chief Marketing Officer", image: "/team/sri-abinaya.jpeg" },
];

const jobs = [
  { title: "Senior Frontend Engineer", department: "Engineering" },
  { title: "People Operations Manager", department: "Human Resources" },
  { title: "Business Analyst", department: "Strategy" },
];

const nav = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#team", label: "Our Team" },
  { href: "#careers", label: "Careers" },
  { href: "#contact", label: "Contact" },
];

function CountUp({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(reduce ? value : 0);
  const text = useTransform(motionValue, (current) => {
    const shown = decimals ? current.toFixed(decimals) : Math.round(current).toLocaleString();
    return `${shown}${suffix}`;
  });

  useEffect(() => {
    if (reduce) return;
    const controls = animate(motionValue, value, { duration: 1.5, ease, delay: 0.35 });
    return () => controls.stop();
  }, [motionValue, reduce, value]);

  return <motion.span>{text}</motion.span>;
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="mb-10 max-w-2xl"
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.7, ease }}
    >
      <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">{title}</h2>
    </motion.div>
  );
}

export function HomeExperience() {
  const reduce = useReducedMotion();
  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 26 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease },
        };

  return (
    <main className="min-h-screen bg-[#03010E] text-white">
      <motion.header
        className="sticky top-0 z-40 border-b border-white/10 bg-[#03010E]/80 backdrop-blur-xl"
        initial={reduce ? false : { y: -16, opacity: 0 }}
        animate={reduce ? undefined : { y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <BrandLogo compact />
          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-cyan-200">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="interactive-button interactive-button--glass rounded-full px-4 py-2 text-sm font-medium text-white">Login</Link>
            <Link href="/portal" className="interactive-button interactive-button--primary interactive-button--arrow button-magnetic inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold">Book a demo <ArrowRight size={16} /></Link>
          </div>
        </div>
      </motion.header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern grid-drift opacity-20" />
        <motion.div
          className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#087BFF]/30 blur-3xl"
          animate={reduce ? undefined : { x: [0, 40, 0], y: [0, 24, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-[#00E879]/20 blur-3xl"
          animate={reduce ? undefined : { x: [0, -30, 0], y: [0, 36, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-28">
          <div>
            <motion.div {...rise(0.05)} className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <motion.span animate={reduce ? undefined : { rotate: [0, 12, -8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
                <Sparkles size={12} />
              </motion.span>
              Enterprise HR Platform
            </motion.div>
            <motion.h1 {...rise(0.16)} className="max-w-xl font-display text-5xl font-black leading-[0.96] tracking-[-0.06em] text-white md:text-7xl">
              Human operations, reimagined for growth.
            </motion.h1>
            <motion.p {...rise(0.28)} className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              ByteCodX helps modern businesses simplify hiring, people operations, attendance, payroll intelligence, and executive visibility with secure, premium SaaS workflows.
            </motion.p>
            <motion.div {...rise(0.4)} className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/portal" className="interactive-button interactive-button--primary interactive-button--arrow button-magnetic inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold">Launch dashboard <CircleArrowRight size={18} /></Link>
              <Link href="#about" className="interactive-button interactive-button--outline rounded-full px-6 py-3 font-medium text-white">Learn more</Link>
            </motion.div>
            <motion.div {...rise(0.52)} className="mt-10 flex flex-wrap gap-6 text-sm text-slate-300">
              <div><span className="font-number text-2xl font-bold text-white"><CountUp value={1200} suffix="+" /></span><div className="mt-1">Employees managed</div></div>
              <div><span className="font-number text-2xl font-bold text-white"><CountUp value={96} suffix="%" /></span><div className="mt-1">Retention uplift</div></div>
              <div><span className="font-number text-2xl font-bold text-white">24/7</span><div className="mt-1">Operational visibility</div></div>
            </motion.div>
          </div>

          <motion.div
            className="relative"
            initial={reduce ? false : { opacity: 0, y: 36, rotate: 1.5 }}
            animate={reduce ? undefined : { opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.85, delay: 0.25, ease }}
          >
          <motion.div
            className="glass-card noise relative overflow-hidden rounded-[28px] p-5"
            animate={reduce ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <div className="rounded-[24px] border border-white/10 bg-[#090d1a]/90 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.45)]">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Executive summary</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-white">Company pulse</h2>
                </div>
                <motion.div
                  className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300"
                  animate={reduce ? undefined : { boxShadow: ["0 0 0 rgba(16,185,129,0)", "0 0 18px rgba(16,185,129,0.45)", "0 0 0 rgba(16,185,129,0)"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  +18.4% QoQ
                </motion.div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-300"><span>Employee health</span><span className="font-number text-xl text-white"><CountUp value={92} suffix="%" /></span></div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#087BFF] via-[#00B9E8] to-[#00E879]"
                      initial={reduce ? { width: "92%" } : { width: "0%" }}
                      animate={{ width: "92%" }}
                      transition={{ duration: 1.3, delay: 0.7, ease }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-4">
                    <div className="text-sm text-slate-400">Present today</div>
                    <div className="mt-3 font-number text-3xl font-bold text-white"><CountUp value={1148} /></div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-[#0d1222] p-4">
                    <div className="text-sm text-slate-400">Attendance rate</div>
                    <div className="mt-3 font-number text-3xl font-bold text-white"><CountUp value={96.8} suffix="%" decimals={1} /></div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-300">Leadership mobile sync</p>
                      <p className="mt-2 font-number text-3xl font-bold text-white"><CountUp value={34} /> alerts</p>
                    </div>
                    <motion.div animate={reduce ? undefined : { scale: [1, 1.08, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
                      <ShieldCheck className="text-emerald-300" size={28} />
                    </motion.div>
                  </div>
                </div>
                <div className="flex h-16 items-end gap-2 px-1">
                  {[42, 58, 48, 72, 64, 88, 76, 94].map((height, index) => (
                    <motion.div
                      key={height}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-[#087BFF] to-[#00E879]"
                      initial={reduce ? { height: `${height}%` } : { height: "8%" }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.7, delay: 0.85 + index * 0.06, ease }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <SectionHeading eyebrow="About us" title="Built for ambitious companies." />
        <CardGrid>
          {expertise.map((item) => (
            <HoverCard key={item} className="glass-card rounded-2xl p-5 text-slate-200">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 text-cyan-200"><Landmark size={18} /></div>
              <p className="font-medium text-white">{item}</p>
            </HoverCard>
          ))}
        </CardGrid>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
        <SectionHeading eyebrow="Services" title="Enterprise-grade people systems." />
        <CardGrid className="md:grid-cols-3">
          {services.map(({ icon: Icon, title, description }) => (
            <HoverCard key={title} className="glass-card h-full rounded-[24px] p-6">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#087BFF] to-[#00B9E8] text-white"><Icon size={22} /></div>
              <h3 className="font-display text-2xl font-semibold text-white">{title}</h3>
              <p className="mt-3 text-slate-300">{description}</p>
            </HoverCard>
          ))}
        </CardGrid>
      </section>

      <section id="team" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <SectionHeading eyebrow="Our team" title="Leadership for a digital-first company." />
        <CardGrid className="md:grid-cols-2 xl:grid-cols-5">
          {team.map((member) => (
            <HoverCard key={member.name} className="glass-card h-full overflow-hidden rounded-[24px] p-5">
              <motion.div className="mb-4 overflow-hidden rounded-2xl" whileHover={reduce ? undefined : { scale: 1.03 }} transition={{ duration: 0.35 }}>
                <Image src={member.image} alt={`${member.name}, ${member.role}`} width={320} height={320} className="aspect-square w-full object-cover object-top" />
              </motion.div>
              <div className="font-display text-xl font-semibold text-white">{member.name}</div>
              <div className="mt-2 text-sm text-slate-300">{member.role}</div>
            </HoverCard>
          ))}
        </CardGrid>
      </section>

      <section id="careers" className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <motion.div
          className="glass-card rounded-[30px] p-8 md:p-10"
          initial={reduce ? false : { opacity: 0, y: 28 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Careers</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-white md:text-5xl">Join the ByteCodX team.</h2>
            </div>
            <Link href="/login" className="interactive-button interactive-button--glass interactive-button--arrow inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white">Explore openings <ArrowRight size={16} /></Link>
          </div>
          <CardGrid className="mt-8 md:grid-cols-3">
            {jobs.map((job) => (
              <HoverCard key={job.title} className="h-full rounded-2xl border border-white/10 bg-[#0b1020] p-5">
                <div className="inline-flex items-center rounded-full border border-cyan-400/15 bg-cyan-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-200">{job.department}</div>
                <h3 className="mt-4 font-display text-2xl font-semibold text-white">{job.title}</h3>
                <div className="mt-5 flex items-center justify-between text-sm text-slate-300"><span>Full-time</span><span>Remote friendly</span></div>
              </HoverCard>
            ))}
          </CardGrid>
        </motion.div>
      </section>

      <footer id="contact" className="border-t border-white/10 bg-[#050914]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
          <div>
            <BrandLogo compact />
            <p className="mt-5 max-w-md text-slate-300">A premium HR platform designed to modernize the employee lifecycle, leadership oversight, and operational decision-making.</p>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-white">Company</h3>
            <ul className="mt-4 space-y-3 text-slate-300">
              <li><Link href="#about" className="transition hover:text-cyan-200">About us</Link></li>
              <li><Link href="#services" className="transition hover:text-cyan-200">Services</Link></li>
              <li><Link href="#team" className="transition hover:text-cyan-200">Our team</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-3 text-slate-300">
              <li>hello@bytecodx.com</li>
              <li>+91 44 4200 2025</li>
              <li>Chennai, India</li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}

function CardGrid({ children, className = "md:grid-cols-2 lg:grid-cols-4" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={`grid gap-6 ${className}`}>{children}</div>;

  return (
    <motion.div
      className={`grid gap-6 ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
    >
      {children}
    </motion.div>
  );
}

function HoverCard({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 28 },
        show: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
      }}
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
    >
      {children}
    </motion.div>
  );
}
