"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type AttendancePoint = { date: string; count: number };
type TaskStatusPoint = { status: string; count: number };

const chartColors = ["#087BFF", "#00B9E8", "#00E879", "#F59E0B", "#EF4444"];

export function PortalAnalytics({ attendance, taskStatuses }: { attendance: AttendancePoint[]; taskStatuses: TaskStatusPoint[] }) {
  return (
    <section className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
      <div className="rounded-[26px] border border-white/10 bg-[#111827]/70 p-5">
        <div className="mb-5">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Attendance</div>
          <h2 className="mt-2 font-display text-2xl font-semibold text-white">Daily check-ins this month</h2>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendance} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00B9E8" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#00B9E8" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(148,163,184,.2)", borderRadius: 12, color: "#fff" }} />
              <Area type="monotone" dataKey="count" name="Check-ins" stroke="#00B9E8" strokeWidth={2.5} fill="url(#attendanceFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-[26px] border border-white/10 bg-[#111827]/70 p-5">
        <div className="mb-3">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Workload</div>
          <h2 className="mt-2 font-display text-2xl font-semibold text-white">Task status</h2>
        </div>
        {taskStatuses.length ? (
          <>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={taskStatuses} dataKey="count" nameKey="status" innerRadius={48} outerRadius={76} paddingAngle={3} stroke="none">
                    {taskStatuses.map((entry, index) => <Cell key={entry.status} fill={chartColors[index % chartColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(148,163,184,.2)", borderRadius: 12, color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {taskStatuses.map((item, index) => (
                <div key={item.status} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-300"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />{item.status.replaceAll("_", " ")}</span>
                  <span className="font-number text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </>
        ) : <p className="py-16 text-center text-sm text-slate-400">No task records yet.</p>}
      </div>
    </section>
  );
}
