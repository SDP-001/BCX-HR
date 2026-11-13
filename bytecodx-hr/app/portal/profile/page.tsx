import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { DashboardNavigation } from "@/components/DashboardNavigation";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";
import { PortalHeader } from "@/components/PortalHeader";
import { ProfileAvatarUpload } from "@/components/ProfileAvatarUpload";
import { getCurrentUser, getDashboardStats, seedExecutives } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserPermissions } from "@/lib/hr";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  seedExecutives();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const permissions = getUserPermissions(user.id);
  const stats = getDashboardStats(user.id);
  const notifications = db.prepare(`
    SELECT title, message, created_at FROM notifications
    WHERE (user_id = ? OR user_id IS NULL) AND is_read = 0
    ORDER BY created_at DESC LIMIT 4
  `).all(user.id) as { title: string; message: string; created_at: string }[];
  const profile = db.prepare("SELECT avatar_url FROM employee_profiles WHERE user_id = ?").get(user.id) as { avatar_url: string | null } | undefined;

  return (
    <main className="min-h-screen bg-[#03010E] p-3 text-white md:p-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 lg:flex-row lg:gap-5">
        <DashboardNavigation active="profile" permissions={permissions} userName={user.name} userAvatarUrl={profile?.avatar_url ?? null} userRole={user.role} badges={{ notifications: stats.unreadNotifications, "leave-management": stats.pendingLeaves, applications: stats.pendingApplications }} />
        <div className="min-w-0 flex-1 space-y-4 rounded-[30px] border border-white/10 bg-[#0b1220]/80 p-4 md:p-6">
          <PortalHeader name={user.name} avatarUrl={profile?.avatar_url ?? null} role={user.role} unread={stats.unreadNotifications} notifications={notifications} searchTarget={permissions.includes("employee.manage") ? "/portal/employees" : "/portal/tasks"} dateLabel={new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })} />
          <section><p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Account</p><h1 className="mt-2 font-display text-3xl font-bold">Profile settings</h1><p className="mt-2 text-sm text-slate-400">Manage your account photo and sign-in security.</p></section>
          <ProfileAvatarUpload initialUrl={profile?.avatar_url ?? null} name={user.name} />
          <PasswordChangeForm />
          <section className="rounded-[26px] border border-white/10 bg-[#111827]/70 p-5">
            <h2 className="font-display text-xl font-semibold">Active session</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Your current sign-in uses a signed, HTTP-only session cookie. Password changes and account deactivation invalidate prior sessions.</p>
            <p className="mt-3 text-xs text-slate-500">A list of individual devices is not available because sessions are not stored as device records.</p>
            <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-400">Finished using the portal? Sign out of this account.</p>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="interactive-button interactive-button--glass inline-flex items-center gap-2 rounded-xl border border-rose-300/20 px-4 py-2.5 text-sm font-semibold text-rose-100 hover:border-rose-300/40">
                  <LogOut size={16} /> Sign out
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
