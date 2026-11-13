import { redirect, notFound } from "next/navigation";
import { DashboardNavigation } from "@/components/DashboardNavigation";
import { AttendanceCalendar } from "@/components/AttendanceCalendar";
import { HrModuleWorkspace } from "@/components/HrModuleWorkspace";
import { LeaveBalanceCard } from "@/components/LeaveBalanceCard";
import { PortalHeader } from "@/components/PortalHeader";
import { ReportsAnalytics } from "@/components/ReportsAnalytics";
import { getCurrentUser, getDashboardStats, seedExecutives } from "@/lib/auth";
import { db } from "@/lib/db";
import { getHrLookups, getHrModule, getHrRows, getUserPermissions } from "@/lib/hr";

export const dynamic = "force-dynamic";

export default async function HrModulePage({ params, searchParams }: { params: Promise<{ module: string }>; searchParams: Promise<{ query?: string }> }) {
  seedExecutives();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { module: key } = await params;
  const hrModule = getHrModule(key);
  if (!hrModule) notFound();

  const permissions = getUserPermissions(user.id);
  const stats = getDashboardStats(user.id);
  const profileAvatar = db.prepare("SELECT avatar_url FROM employee_profiles WHERE user_id = ?").get(user.id) as { avatar_url: string | null } | undefined;
  const canManage = !hrModule.permission || permissions.includes(hrModule.permission);
  if (!canManage && !hrModule.selfService) redirect("/portal");

  const rows = getHrRows(hrModule.key, user, canManage) as Record<string, string | number | null>[];
  const lookups = getHrLookups(canManage && Boolean(hrModule.permission));
  const { query } = await searchParams;
  const notifications = db.prepare(`
    SELECT title, message, created_at FROM notifications
    WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0
    ORDER BY created_at DESC LIMIT 4
  `).all(user.id) as { title: string; message: string; created_at: string }[];
  const reportCharts = hrModule.key === "reports"
    ? {
        departments: db.prepare(`
          SELECT d.name AS department, COUNT(u.id) AS count
          FROM departments d
          LEFT JOIN employee_profiles ep ON ep.department_id = d.id AND ep.employment_status = 'active'
          LEFT JOIN users u ON u.id = ep.user_id AND u.status = 'active'
          GROUP BY d.id, d.name ORDER BY COUNT(u.id) DESC
        `).all() as { department: string; count: number }[],
        attendance: db.prepare(`
          SELECT status, COUNT(DISTINCT user_id) AS count FROM attendance
          WHERE date(check_in, 'localtime') = date('now', 'localtime') GROUP BY status ORDER BY status
        `).all() as { status: string; count: number }[],
        tasks: db.prepare("SELECT status, COUNT(*) AS count FROM tasks GROUP BY status ORDER BY status")
          .all() as { status: string; count: number }[],
      }
    : null;
  const attendanceCalendarRows = hrModule.key === "attendance"
    ? rows as { work_date: string; status: string; employee: string; working_hours: number }[]
    : null;
  let leaveBalance: Record<string, number> | null = null;
  if (hrModule.key === "leave-management") {
    db.prepare("INSERT OR IGNORE INTO leave_balances (user_id) VALUES (?)").run(user.id);
    leaveBalance = db.prepare(`
      SELECT casual, sick, earned, emergency, other FROM leave_balances WHERE user_id = ?
    `).get(user.id) as Record<string, number>;
  }
  const moduleStatuses = hrModule.key === "leave-management"
    ? user.role === "CEO" ? ["approved", "rejected"] : ["manager_approved", "rejected"]
    : hrModule.statuses;

  return (
    <main className="min-h-screen bg-[#03010E] p-3 text-white md:p-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:gap-5">
        <DashboardNavigation active={hrModule.key} permissions={permissions} userName={user.name} userAvatarUrl={profileAvatar?.avatar_url ?? null} userRole={user.role} badges={{ notifications: stats.unreadNotifications, "leave-management": stats.pendingLeaves, applications: stats.pendingApplications }} />
        <div className="min-w-0 flex-1 space-y-4 rounded-[30px] border border-white/10 bg-[#0b1220]/80 p-4 md:p-6">
          <PortalHeader name={user.name} avatarUrl={profileAvatar?.avatar_url ?? null} role={user.role} unread={stats.unreadNotifications} notifications={notifications} searchTarget={permissions.includes("employee.manage") ? "/portal/employees" : "/portal/tasks"} dateLabel={new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })} />
          {leaveBalance ? <LeaveBalanceCard balance={leaveBalance} /> : null}
          {attendanceCalendarRows ? <AttendanceCalendar rows={attendanceCalendarRows} /> : null}
          {reportCharts ? <ReportsAnalytics {...reportCharts} /> : null}
          <HrModuleWorkspace
            moduleKey={hrModule.key}
            title={hrModule.title}
            description={hrModule.description}
            fields={hrModule.fields}
            columns={hrModule.columns}
            statuses={moduleStatuses}
            rows={rows}
            lookups={lookups}
            canManage={canManage}
            currentUserId={user.id}
            currentUserRole={user.role}
            initialQuery={query ?? ""}
          />
        </div>
      </div>
    </main>
  );
}
