const leaveTypes = [
  { key: "casual", label: "Casual", allowance: 12 },
  { key: "sick", label: "Sick", allowance: 10 },
  { key: "earned", label: "Earned", allowance: 8 },
  { key: "emergency", label: "Emergency", allowance: 4 },
  { key: "other", label: "Other", allowance: 2 },
] as const;

export function LeaveBalanceCard({ balance }: { balance: Record<string, number> }) {
  return (
    <section className="rounded-[26px] border border-white/10 bg-[#111827]/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Time off</p><h2 className="mt-2 font-display text-xl font-semibold">Your leave balance</h2></div>
        <span className="text-xs text-slate-500">Days remaining</span>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {leaveTypes.map(({ key, label, allowance }) => {
          const remaining = Math.max(0, Math.min(allowance, balance[key] ?? 0));
          return (
            <div key={key} className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
              <div className="flex items-center justify-between"><span className="text-sm text-slate-300">{label}</span><span className="font-number text-lg font-semibold text-white">{remaining}<span className="ml-1 text-[10px] text-slate-500">/ {allowance}</span></span></div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400" style={{ width: `${(remaining / allowance) * 100}%` }} /></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
