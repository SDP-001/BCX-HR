import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { SystemStatus } from "@/components/SystemStatus";

const links = [
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/services", label: "Services" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#03010E]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link href="/" aria-label="ByteCodX home"><BrandLogo compact /></Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
          {links.map(({ href, label }) => <Link key={href} href={href} className="transition hover:text-cyan-200">{label}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="interactive-button interactive-button--primary interactive-button--arrow inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold">HR Portal <ArrowRight size={15} /></Link>
        </div>
      </div>
      <nav aria-label="Mobile navigation" className="flex gap-2 overflow-x-auto px-5 pb-3 text-xs text-slate-300 md:hidden">
        {links.map(({ href, label }) => <Link key={href} href={href} className="shrink-0 rounded-full border border-white/10 px-3 py-1.5">{label}</Link>)}
      </nav>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050914]">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1fr_auto_auto] md:items-start lg:px-8">
        <div>
          <Link href="/"><BrandLogo compact /></Link>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">People operations and workforce tools designed to help teams work with clarity and confidence.</p>
          <SystemStatus />
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-slate-300">
          {links.map(({ href, label }) => <Link key={href} href={href} className="hover:text-cyan-200">{label}</Link>)}
        </div>
        <p className="text-sm text-slate-500">Chennai, India<br />hello@bytecodx.com</p>
      </div>
    </footer>
  );
}

export function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#03010E] text-white">
      <PublicHeader />
      {children}
      <PublicFooter />
    </main>
  );
}
