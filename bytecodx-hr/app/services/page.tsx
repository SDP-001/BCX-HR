import { Activity, ArrowRight, BriefcaseBusiness, ChartNoAxesCombined, Compass, ShieldCheck, UsersRound } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { PublicPage } from "@/components/PublicChrome";

const services = [
  { icon: UsersRound, title: "Employee lifecycle", text: "Organize employee records, onboarding, offboarding, and access in a consistent workflow." },
  { icon: Activity, title: "Time and attendance", text: "Give employees and managers practical attendance records and work-hour visibility." },
  { icon: BriefcaseBusiness, title: "Talent acquisition", text: "Coordinate open roles, candidate applications, and hiring pipeline updates." },
  { icon: Compass, title: "Team operations", text: "Manage leave, task ownership, projects, and day-to-day team coordination." },
  { icon: ChartNoAxesCombined, title: "Workforce insights", text: "Bring operational information together for reports and more informed planning." },
  { icon: ShieldCheck, title: "Governance and access", text: "Support responsible people-data handling with role-based access and audit trails." },
];

export default function ServicesPage() {
  return (
    <PublicPage>
      <section className="mx-auto max-w-7xl px-5 py-20 md:py-24 lg:px-8">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Services</p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl font-black tracking-tight md:text-6xl">A connected system for the work behind great teams.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Practical tools for the moments that shape the employee experience—from the first application to ongoing growth.</p>
        </Reveal>
        <Stagger className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map(({ icon: Icon, title, text }) => <StaggerItem key={title}><article className="glass-card h-full rounded-[26px] p-6"><div className="inline-flex rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 p-3 text-cyan-100"><Icon size={22} /></div><h2 className="mt-5 font-display text-2xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-300">{text}</p></article></StaggerItem>)}
        </Stagger>
        <Reveal delay={0.1} className="mt-14 rounded-[28px] border border-white/10 bg-[#0b1220]/80 p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div><p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Delivery approach</p><h2 className="mt-3 font-display text-3xl font-bold">From clear needs to connected outcomes.</h2><p className="mt-3 text-sm leading-6 text-slate-400">A practical delivery rhythm keeps people, product, and platform decisions aligned.</p></div>
            <div className="grid gap-3 sm:grid-cols-4">
              {["Discover", "Design", "Deliver", "Improve"].map((stage, index) => <div key={stage} className="flex items-center gap-2"><div className="min-w-0 flex-1 rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4"><span className="font-number text-xs text-cyan-200">0{index + 1}</span><p className="mt-2 text-sm font-semibold text-white">{stage}</p></div>{index < 3 ? <ArrowRight size={14} className="hidden shrink-0 text-cyan-200 sm:block" /> : null}</div>)}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">{["Product engineering", "People operations", "Cloud & security", "Workforce analytics", "Recruitment workflows"].map((tag) => <span key={tag} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300">{tag}</span>)}</div>
        </Reveal>
      </section>
    </PublicPage>
  );
}
