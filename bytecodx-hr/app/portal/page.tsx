import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Briefcase, CheckCheck, ClipboardCheck, FolderKanban, Users, Workflow } from "lucide-react";
import { DashboardNavigation } from "@/components/DashboardNavigation";
import { PortalAnalytics } from "@/components/PortalAnalytics";
import { PortalHeader } from "@/components/PortalHeader";
import { getCurrentUser, getDashboardStats, seedExecutives } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserPermissions } from "@/lib/hr";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  seedExecutives();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const permissions = getUserPermissions(user.id);
  const stats = getDashboardStats(user.id);
  const profileAvatar = db.prepare("SELECT avatar_url FROM employee_profiles WHERE user_id = ?").get(user.id) as { avatar_url: string | null } | undefined;
  const attendance = db.prepare(`
    SELECT strftime('%d', check_in, 'localtime') AS date, COUNT(DISTINCT user_id) AS count
    FROM attendance
    WHERE date(check_in, 'localtime') >= date('now', 'localtime', 'start of month')
    GROUP BY date(check_in, 'localtime')
    ORDER BY date(check_in, 'localtime')
  `).all() as { date: string; count: number }[];
  const taskStatuses = db.prepare(`
    SELECT status, COUNT(*) AS count FROM tasks ${permissions.includes("task.manage") ? "" : "WHERE assignee_id = ?"} GROUP BY status ORDER BY status
  `).all(...(permissions.includes("task.manage") ? [] : [user.id])) as { status: string; count: number }[];

  const tasks = db
    .prepare(`SELECT title, status, priority, deadline FROM tasks ${permissions.includes("task.manage") ? "" : "WHERE assignee_id = ?"} ORDER BY deadline LIMIT 5`)
    .all(...(permissions.includes("task.manage") ? [] : [user.id])) as { title: string; status: string; priority: string; deadline: string | null }[];

  const projects = db
    .prepare(`SELECT name, status, priority, budget FROM projects ${permissions.includes("project.manage") ? "" : "WHERE manager_id = ? OR id IN (SELECT project_id FROM project_members WHERE user_id = ?)"} ORDER BY created_at DESC LIMIT 4`)
    .all(...(permissions.includes("project.manage") ? [] : [user.id, user.id])) as { name: string; status: string; priority: string; budget: string | null }[];

  const notifications = db
    .prepare("SELECT title, message, type, created_at FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 4")
    .all(user.id) as { title: string; message: string; type: string; created_at: string }[];
  const activities = db.prepare(`
    SELECT coalesce(u.name, 'System') AS actor, al.action, al.entity_type, al.created_at
    FROM audit_logs al LEFT JOIN users u ON u.id = al.user_id
    ${permissions.includes("settings.manage") ? "" : "WHERE al.user_id = ?"}
    ORDER BY al.created_at DESC LIMIT 4
  `).all(...(permissions.includes("settings.manage") ? [] : [user.id])) as { actor: string; action: string; entity_type: string | null; created_at: string }[];
  const pendingApprovals = permissions.includes("leave.manage")
    ? db.prepare(`
        SELECT u.name AS employee, lr.start_date, lr.end_date
        FROM leave_requests lr JOIN users u ON u.id = lr.user_id
        WHERE lr.status = 'pending' ORDER BY lr.created_at LIMIT 4
      `).all() as { employee: string; start_date: string; end_date: string }[]
    : [];
  const upcomingEvents = db.prepare(`
    SELECT title, event_date, event_type FROM (
      SELECT pm.title, pm.due_date AS event_date, 'Milestone' AS event_type
      FROM project_milestones pm WHERE pm.due_date >= date('now', 'localtime')
      UNION ALL
      SELECT title, deadline AS event_date, 'Task deadline' AS event_type
      FROM tasks WHERE deadline >= date('now', 'localtime')
    )
    ORDER BY event_date LIMIT 4
  `).all() as { title: string; event_date: string; event_type: string }[];

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen bg-[#03010E] p-4 text-white md:p-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:gap-5">
        <DashboardNavigation active="dashboard" permissions={permissions} userName={user.name} userAvatarUrl={profileAvatar?.avatar_url ?? null} userRole={user.role} badges={{ notifications: stats.unreadNotifications, "leave-management": stats.pendingLeaves, applications: stats.pendingApplications }} />

        <div className="min-w-0 flex-1 rounded-[30px] border border-white/10 bg-[#0b1220]/80 p-4 md:p-6">
          <PortalHeader name={user.name} avatarUrl={profileAvatar?.avatar_url ?? null} role={user.role} unread={stats.unreadNotifications} notifications={notifications} searchTarget={permissions.includes("employee.manage") ? "/portal/employees" : "/portal/tasks"} dateLabel={currentDate} />

          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Active Employees", value: stats.totalEmployees.toString(), icon: Users },
              { label: "Present Today", value: stats.presentToday.toString(), icon: CheckCheck },
              { label: "Attendance Rate", value: `${stats.attendanceRate}%`, icon: ClipboardCheck },
              { label: "Pending Leave", value: stats.pendingLeaves.toString(), icon: AlertCircle },
              { label: "Open Tasks", value: stats.pendingTasks.toString(), icon: Workflow },
              { label: "Active Projects", value: stats.activeProjects.toString(), icon: Briefcase },
              { label: "Open Positions", value: stats.openVacancies.toString(), icon: FolderKanban },
              { label: "Unread Alerts", value: stats.unreadNotifications.toString(), icon: AlertCircle },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-[24px] border border-white/10 bg-gradient-to-br from-[#111827] to-[#0b1220] p-4 shadow-[0_20px_50px_rgba(2,6,23,0.38)]">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">{label}</div>
                  <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-200"><Icon size={18} /></div>
                </div>
                <div className="mt-4 font-number text-3xl font-bold text-white">{value}</div>
              </div>
            ))}
          </section>

          <PortalAnalytics attendance={attendance} taskStatuses={taskStatuses} />

          <section className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[26px] border border-white/10 bg-[#111827]/70 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Task overview</div>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-white">Priority queue</h2>
                </div>
                <Link href="/portal/tasks" className="interactive-button interactive-button--outline interactive-button--arrow rounded-full px-3 py-1.5 text-xs font-medium text-slate-200">View all</Link>
              </div>

              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b1220] p-3">
                    <div>
                      <div className="font-medium text-white">{task.title}</div>
                      <div className="mt-1 text-xs text-slate-400">{task.status} • {task.deadline ?? "No deadline"}</div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${task.priority === "high" ? "bg-rose-500/15 text-rose-200" : task.priority === "medium" ? "bg-amber-500/15 text-amber-200" : "bg-emerald-500/15 text-emerald-200"}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-[#111827]/70 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Projects</div>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-white">Portfolio status</h2>
                </div>
              </div>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.name} className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium text-white">{project.name}</div>
                        <div className="mt-1 text-xs text-slate-400">{project.status}</div>
                      </div>
                      <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-cyan-200">{project.priority}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>Budget</span>
                      <span>{project.budget ?? "N/A"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[26px] border border-white/10 bg-[#111827]/70 p-5">
              <div className="mb-5 text-sm uppercase tracking-[0.2em] text-slate-400">Recent activities</div>
              <div className="space-y-3">
                {activities.length ? activities.map((activity, index) => (
                  <div key={`${activity.action}-${activity.created_at}-${index}`} className="flex gap-3 rounded-2xl border border-white/10 bg-[#0b1220] p-3 text-sm text-slate-300">
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-r from-[#087BFF] to-[#00E879]" />
                    <span><strong className="font-medium text-white">{activity.actor}</strong> {activity.action.replaceAll(".", " ").replaceAll("_", " ")}{activity.entity_type ? ` · ${activity.entity_type.replaceAll("_", " ")}` : ""}</span>
                  </div>
                )) : <p className="rounded-2xl border border-white/10 bg-[#0b1220] p-3 text-sm text-slate-400">No recent activity to show.</p>}
              </div>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-[#111827]/70 p-5">
              <div className="mb-5 flex items-center justify-between"><div><div className="text-sm uppercase tracking-[0.2em] text-slate-400">Upcoming</div><h2 className="mt-2 font-display text-2xl font-semibold text-white">Events & approvals</h2></div></div>
              <div className="space-y-3">
                {pendingApprovals.map((item, index) => <div key={`${item.employee}-${item.start_date}-${index}`} className="rounded-2xl border border-amber-400/15 bg-amber-500/[0.04] p-3"><div className="text-sm font-medium text-white">Leave approval · {item.employee}</div><div className="mt-1 text-xs text-amber-100/70">{item.start_date} – {item.end_date}</div></div>)}
                {upcomingEvents.map((item, index) => <div key={`${item.title}-${item.event_date}-${index}`} className="rounded-2xl border border-white/10 bg-[#0b1220] p-3"><div className="text-sm font-medium text-white">{item.title}</div><div className="mt-1 text-xs text-slate-400">{item.event_type} · {item.event_date}</div></div>)}
                {!pendingApprovals.length && !upcomingEvents.length ? <p className="rounded-2xl border border-white/10 bg-[#0b1220] p-3 text-sm text-slate-400">No upcoming events or approvals.</p> : null}
                <Link href="/portal/notifications" className="interactive-button interactive-button--outline interactive-button--arrow inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-slate-200">Open notification center <CheckCheck size={14} /></Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
