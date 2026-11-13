import Image from "next/image";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  const name = "ByteCodX";

  return (
    <div className="flex items-center gap-3">
      <div className="brand-mark relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_30px_rgba(8,123,255,0.25)] backdrop-blur-sm">
        <Image src="/bytecodx-logo.png" alt="ByteCodX logo" width={compact ? 36 : 48} height={compact ? 36 : 48} className="object-contain" style={{ width: compact ? 36 : 48, height: compact ? 36 : 48 }} priority />
      </div>
      <div className="leading-none">
        <div className="brand-wordmark bg-gradient-to-r from-[#087BFF] via-[#00B9E8] to-[#00E879] bg-clip-text text-2xl font-black tracking-[-0.08em] text-transparent md:text-3xl">
          <span className="sr-only">{name}</span>
          <span aria-hidden="true" className="inline-flex">{[...name].map((letter, index) => <span key={`${letter}-${index}`} className="brand-wordmark-letter" style={{ animationDelay: `${index * 65}ms` }}>{letter}</span>)}</span>
        </div>
      </div>
    </div>
  );
}
