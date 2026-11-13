import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Motion";
import { PublicPage } from "@/components/PublicChrome";

export default function ContactPage() {
  return (
    <PublicPage>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Contact</p>
          <h1 className="mt-3 font-display text-5xl font-black tracking-tight md:text-6xl">Let’s make work flow better.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">Tell us what your team needs. Our team will follow up to learn more and help you find the right next step.</p>
          <div className="mt-9 space-y-4 text-sm text-slate-300">
            <p className="flex items-center gap-3"><Mail size={17} className="text-cyan-200" /> hello@bytecodx.com</p>
            <p className="flex items-center gap-3"><Phone size={17} className="text-cyan-200" /> +91 44 4200 2025</p>
            <p className="flex items-center gap-3"><MapPin size={17} className="text-cyan-200" /> Chennai, India</p>
          </div>
          <div className="mt-8 border-t border-white/10 pt-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Executive channels</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>Leadership <a className="text-cyan-200 hover:text-white" href="mailto:ceo@bytecodx.com">ceo@bytecodx.com</a></p>
              <p>Technology <a className="text-cyan-200 hover:text-white" href="mailto:cto@bytecodx.com">cto@bytecodx.com</a></p>
              <p>Marketing <a className="text-cyan-200 hover:text-white" href="mailto:cmo@bytecodx.com">cmo@bytecodx.com</a></p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.12}><ContactForm /></Reveal>
      </section>
    </PublicPage>
  );
}
