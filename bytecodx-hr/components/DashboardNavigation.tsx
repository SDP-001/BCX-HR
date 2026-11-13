import Link from "next/link";
import {
  Activity,
  Bell,
  Briefcase,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  FolderKanban,
  LayoutDashboard,
  MessageSquareText,
  UserRoundMinus,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { UserAvatar } from "@/components/UserAvatar";
import { hrModules } from "@/lib/hr";

const icons = {
  employees: Users,
  attendance: Activity,
  "leave-management": ClipboardCheck,
  "task-management": ClipboardList,
  "project-management": FolderKanban,
  recruitment: Briefcase,
  applications: UserRoundPlus,
  onboarding: UserRoundPlus,
  offboarding: UserRoundMinus,
  feedback: MessageSquareText,
  reports: FileBarChart,
  notifications: Bell,
  settings: ClipboardList,
} as const;

const modulePath: Partial<Record<(typeof hrModules)[number]["key"], string>> = {
  "leave-management": "leaves",
  "task-management": "tasks",
  "project-management": "projects",
};

function moduleHref(key: (typeof hrModules)[number]["key"]) {
  return `/portal/${modulePath[key] ?? key}`;
}

type Props = {
  active: string;
  permissions: string[];
  userName: string;
  userAvatarUrl?: string | null;
  userRole: string;
  badges?: Record<string, number>;
};

export function DashboardNavigation({ active, permissions, userName, userAvatarUrl, userRole, badges = {} }: Props) {
  const visibleModules = hrModules.filter(
    (module) => !module.permission || permissions.includes(module.permission) || module.selfService,
  );
  const linkClass = (isActive: boolean) =>
    `interactive-button flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-gradient-to-r from-[#087BFF]/20 to-[#00E879]/10 text-white ring-1 ring-cyan-400/25"
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <>
      <aside className="hidden w-[260px] shrink-0 rounded-[28px] border border-white/10 bg-[#0b1220]/90 p-4 lg:block">
        <div className="mb-8 px-2 pt-2"><BrandLogo compact /></div>
        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</div>
        <nav className="space-y-1">
          <Link href="/portal" className={linkClass(active === "dashboard")}>
            <LayoutDashboard size={17} /> Dashboard
          </Link>
          {visibleModules.map((module) => {
            const Icon = icons[module.key];
            const badge = badges[module.key] ?? 0;
            return (
              <Link key={module.key} href={moduleHref(module.key)} className={linkClass(active === module.key)}>
                <Icon size={17} /> <span className="min-w-0 flex-1">{module.title}</span>
                {badge > 0 ? <span className="rounded-full bg-cyan-400/15 px-1.5 py-0.5 text-[10px] font-bold text-cyan-100">{badge > 99 ? "99+" : badge}</span> : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-2">
            <UserAvatar name={userName} src={userAvatarUrl} size="medium" />
            <span className="min-w-0"><span className="block truncate text-sm font-medium text-white">{userName}</span><span className="block text-xs text-slate-500">{userRole}</span></span>
          </div>
          <form action="/api/auth/logout" method="POST" className="mt-3">
            <button type="submit" className="interactive-button interactive-button--glass w-full rounded-xl px-3 py-2 text-left text-xs text-slate-300">Sign out</button>
          </form>
        </div>
      </aside>
      <nav aria-label="HR modules" className="mb-4 flex gap-2 overflow-x-auto pb-2 lg:hidden">
        <Link href="/portal" className={linkClass(active === "dashboard")}>
          <LayoutDashboard size={17} /> Dashboard
        </Link>
        {visibleModules.map((module) => {
          const Icon = icons[module.key];
          const badge = badges[module.key] ?? 0;
          return (
            <Link key={module.key} href={moduleHref(module.key)} className={linkClass(active === module.key)}>
              <Icon size={17} /> {module.title}
              {badge > 0 ? <span className="rounded-full bg-cyan-400/15 px-1.5 py-0.5 text-[10px] font-bold text-cyan-100">{badge > 99 ? "99+" : badge}</span> : null}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
