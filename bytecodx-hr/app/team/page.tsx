import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";
import { PublicPage } from "@/components/PublicChrome";

const leaders = [
  { name: "Joel Kirubainathan", role: "Chief Executive Officer", image: "/team/joel-kirubainathan.jpeg", focus: "Company vision and governance" },
  { name: "Poovarasan", role: "Chief Technology Officer", image: "/team/poovarasan.jpeg", focus: "Technology and product" },
  { name: "Sugasini", role: "Chief Strategy Officer", image: "/team/sugasini.jpeg", focus: "Strategy and planning" },
  { name: "Dharun", role: "Chief Operating Officer", image: "/team/dharun.jpeg", focus: "Operations and delivery" },
  { name: "Sri Abinaya", role: "Chief Marketing Officer", image: "/team/sri-abinaya.jpeg", focus: "Marketing and brand strategy" },
];

export default function TeamPage() {
  return (
    <PublicPage>
      <section className="mx-auto max-w-7xl px-5 py-20 md:py-24 lg:px-8">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Our team</p>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-black tracking-tight md:text-6xl">Leadership with people and progress in mind.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Meet the team guiding ByteCodX across company strategy, technology, operations, and people experience.</p>
        </Reveal>
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {leaders.map((member) => (
            <StaggerItem key={member.name}><article className="glass-card h-full overflow-hidden rounded-[26px]">
              <Image src={member.image} alt={`${member.name}, ${member.role}`} width={640} height={640} className="aspect-[4/3] w-full object-cover object-top" />
              <div className="p-5">
                <h2 className="font-display text-2xl font-semibold">{member.name}</h2>
                <p className="mt-1 text-sm text-cyan-100">{member.role}</p>
                <p className="mt-4 border-t border-white/10 pt-4 text-sm text-slate-400">{member.focus}</p>
              </div>
            </article></StaggerItem>
          ))}
        </Stagger>
      </section>
    </PublicPage>
  );
}
