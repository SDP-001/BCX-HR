"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DepartmentPoint = { department: string; count: number };
type AttendancePoint = { status: string; count: number };
type TaskPoint = { status: string; count: number };

const colors = ["#087BFF", "#00B9E8", "#00E879", "#F59E0B", "#EF4444"];

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-[24px] border border-white/10 bg-[#111827]/70 p-5"><h2 className="mb-4 font-display text-xl font-semibold">{title}</h2><div className="h-56 w-full">{children}</div></section>;
}

export function ReportsAnalytics({ departments, attendance, tasks }: { departments: DepartmentPoint[]; attendance: AttendancePoint[]; tasks: TaskPoint[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <ChartPanel title="Employees by department">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={departments} margin={{ left: -20, right: 8 }}><CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} /><XAxis dataKey="department" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(148,163,184,.2)", borderRadius: 12, color: "#fff" }} /><Bar dataKey="count" name="Employees" fill="#00B9E8" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
      </ChartPanel>
      <ChartPanel title="Attendance today">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={attendance} margin={{ left: -20, right: 8 }}><CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} /><XAxis dataKey="status" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(148,163,184,.2)", borderRadius: 12, color: "#fff" }} /><Bar dataKey="count" name="People" fill="#00E879" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
      </ChartPanel>
      <ChartPanel title="Task status mix">
        {tasks.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={tasks} dataKey="count" nameKey="status" innerRadius={45} outerRadius={80} paddingAngle={3} stroke="none">{tasks.map((task, index) => <Cell key={task.status} fill={colors[index % colors.length]} />)}</Pie><Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(148,163,184,.2)", borderRadius: 12, color: "#fff" }} /></PieChart></ResponsiveContainer> : <p className="pt-20 text-center text-sm text-slate-400">No task data yet.</p>}
      </ChartPanel>
    </div>
  );
}
