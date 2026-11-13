"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Bell, ChevronDown, LogOut, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/UserAvatar";

type Notification = { title: string; message: string; created_at: string };

export function PortalHeader({
  name,
  avatarUrl,
  role,
  unread,
  notifications,
  searchTarget,
  dateLabel,
}: {
  name: string;
  avatarUrl?: string | null;
  role: string;
  unread: number;
  notifications: Notification[];
  searchTarget: string;
  dateLabel: string;
}) {
  const router = useRouter();
  const [clock, setClock] = useState("--:--:--");
  const [greeting, setGreeting] = useState("Welcome");
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now));
      const hour = now.getHours();
      setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
    };
    updateTime();
    const intervalId = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    router.push(`${searchTarget}?query=${encodeURIComponent(query)}`);
  }

  return (
    <header className="border-b border-white/10 pb-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-300">{greeting}, {name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">{role}</span>
            <span className="text-xs text-slate-400">{dateLabel}</span>
            <span className="font-number text-xs tabular-nums text-emerald-200">{clock}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={submitSearch} role="search" className="flex min-w-[180px] flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300 sm:flex-none">
            <Search size={16} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search workspace" placeholder="Search workspace" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500 sm:w-40" />
          </form>

          <div className="relative">
            <button type="button" onClick={() => { setNotificationsOpen((open) => !open); setProfileOpen(false); }} aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} aria-expanded={notificationsOpen} className="interactive-button interactive-button--neon relative rounded-xl p-2.5 text-slate-200">
              <Bell size={18} />
              {unread > 0 ? <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-[#087BFF] to-[#00E879] px-1 text-[10px] font-bold text-black">{unread > 99 ? "99+" : unread}</span> : null}
            </button>
            {notificationsOpen ? (
              <div className="absolute right-0 top-full z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#0b1220] p-3 shadow-2xl">
                <div className="flex items-center justify-between px-2 py-1"><span className="font-semibold text-white">Notifications</span><Link href="/portal/notifications" onClick={() => setNotificationsOpen(false)} className="text-xs text-cyan-200">View all</Link></div>
                {notifications.length ? notifications.map((item, index) => <div key={`${item.title}-${item.created_at}-${index}`} className="mt-2 rounded-xl bg-white/[0.04] p-3"><p className="text-sm font-medium text-white">{item.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{item.message}</p><time className="mt-2 block text-[10px] text-slate-500">{item.created_at}</time></div>) : <p className="px-2 py-5 text-sm text-slate-400">You’re all caught up.</p>}
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button type="button" onClick={() => { setProfileOpen((open) => !open); setNotificationsOpen(false); }} aria-label={`${name} profile menu`} aria-expanded={profileOpen} className="interactive-button interactive-button--glass inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-200">
              <UserAvatar name={name} src={avatarUrl} />
              <span className="hidden max-w-36 truncate font-medium sm:block">{name}</span>
              <ChevronDown size={14} />
            </button>
            {profileOpen ? (
              <div className="absolute right-0 top-full z-40 mt-2 w-56 rounded-2xl border border-white/10 bg-[#0b1220] p-2 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/10 px-3 py-3">
                  <UserAvatar name={name} src={avatarUrl} size="medium" />
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{name}</p><p className="mt-0.5 text-xs text-slate-400">{role}</p></div>
                </div>
                <Link href="/portal/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/5"><Settings size={15} /> Profile settings</Link>
                <form action="/api/auth/logout" method="POST"><button type="submit" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"><LogOut size={15} /> Sign out</button></form>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
