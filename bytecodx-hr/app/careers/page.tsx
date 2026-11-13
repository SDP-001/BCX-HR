import { Reveal } from "@/components/Motion";
import { PublicPage } from "@/components/PublicChrome";
import { CareersBoard } from "@/components/CareersBoard";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type Vacancy = {
  id: number;
  title: string;
  department: string;
  description: string;
  required_skills: string | null;
  experience: string | null;
  employment_type: string | null;
  application_deadline: string | null;
};

export default function CareersPage() {
  const vacancies = db.prepare(`
    SELECT id, title, department, description, required_skills, experience, employment_type, application_deadline
    FROM job_vacancies
    WHERE status = 'open' AND (application_deadline IS NULL OR application_deadline = '' OR date(application_deadline) >= date('now', 'localtime'))
    ORDER BY created_at DESC
  `).all() as Vacancy[];

  return (
    <PublicPage>
      <section className="mx-auto max-w-7xl px-5 py-20 md:py-24 lg:px-8">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Careers at ByteCodX</p>
          <h1 className="mt-3 max-w-4xl font-display text-5xl font-black tracking-tight md:text-6xl">Build tools that make work better.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Explore current openings and tell us how you would help teams thrive.</p>
        </Reveal>
        <Reveal className="mt-10" delay={0.12}><CareersBoard vacancies={vacancies} /></Reveal>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            ["Meaningful work", "Help shape practical products and people experiences for growing teams."],
            ["Room to grow", "Build your craft with opportunities to learn, contribute, and take ownership."],
            ["Thoughtful collaboration", "Work across disciplines with respect, curiosity, and clear communication."],
          ].map(([title, description]) => <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"><h2 className="font-display text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p></article>)}
        </div>
      </section>
    </PublicPage>
  );
}
