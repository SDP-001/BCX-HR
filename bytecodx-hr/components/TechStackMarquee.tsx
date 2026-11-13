const technologies = ["Next.js", "TypeScript", "React", "SQLite", "Tailwind CSS", "Node.js", "Role-based access", "People analytics"];

export function TechStackMarquee() {
  return (
    <div className="overflow-hidden border-y border-white/10 py-5" aria-label="Technology capabilities">
      <div className="tech-marquee-track flex w-max items-center gap-4">
        {[...technologies, ...technologies].map((technology, index) => <span key={`${technology}-${index}`} className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm text-slate-300">{technology}</span>)}
      </div>
    </div>
  );
}
