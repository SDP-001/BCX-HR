"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type AttendanceEntry = {
  work_date: string;
  status: string;
  employee: string;
  working_hours: number;
};

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AttendanceCalendar({ rows }: { rows: AttendanceEntry[] }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const leadingBlanks = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
    return [...Array.from({ length: leadingBlanks }, () => null), ...Array.from({ length: daysInMonth }, (_, day) => day + 1)];
  }, [month]);
  const entriesByDay = useMemo(() => {
    const grouped = new Map<number, AttendanceEntry[]>();
    for (const entry of rows) {
      if (!entry.work_date.startsWith(`${monthKey}-`)) continue;
      const day = Number(entry.work_date.slice(-2));
      grouped.set(day, [...(grouped.get(day) ?? []), entry]);
    }
    return grouped;
  }, [monthKey, rows]);
  const monthlyCheckIns = [...entriesByDay.values()].reduce((total, entries) => total + entries.length, 0);

  function changeMonth(offset: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <section className="rounded-[26px] border border-white/10 bg-[#111827]/70 p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Attendance overview</p>
          <h2 className="mt-2 font-display text-xl font-semibold">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-1 hidden text-xs text-slate-400 sm:inline">{monthlyCheckIns} check-ins</span>
          <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month" className="interactive-button interactive-button--icon rounded-lg p-2"><ChevronLeft size={17} /></button>
          <button type="button" onClick={() => changeMonth(1)} aria-label="Next month" className="interactive-button interactive-button--icon rounded-lg p-2"><ChevronRight size={17} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {weekdays.map((day) => <div key={day} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">{day}</div>)}
        {calendarDays.map((day, index) => {
          const entries = typeof day === "number" ? entriesByDay.get(day) ?? [] : [];
          return (
            <div key={day ?? `blank-${index}`} className={`min-h-[64px] rounded-xl border p-1.5 sm:min-h-[82px] sm:p-2 ${day ? "border-white/[0.07] bg-[#0b1220]/70" : "border-transparent"}`}>
              {typeof day === "number" ? (
                <>
                  <span className="text-xs text-slate-400">{day}</span>
                  {entries.length ? <div className="mt-1.5 space-y-1">
                    <span className="inline-flex max-w-full rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-200 sm:px-2 sm:text-[10px]">{entries.length} check-in{entries.length === 1 ? "" : "s"}</span>
                    <p className="hidden truncate text-[10px] text-slate-500 sm:block">{entries.map((entry) => entry.employee).join(", ")}</p>
                  </div> : null}
                </>
              ) : null}
            </div>
          );
        })}
      </div>
      {rows.length === 0 ? <p className="mt-4 text-center text-xs text-slate-500">No attendance records are available yet.</p> : null}
    </section>
  );
}
