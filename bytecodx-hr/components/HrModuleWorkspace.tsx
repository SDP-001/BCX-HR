"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Printer, Search, X } from "lucide-react";
import type { HrColumn, HrField, HrModuleKey } from "@/lib/hr";

type Row = Record<string, string | number | null>;
type Lookup = { value: number; label: string };
type EmployeeDraft = {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  departmentId: number;
  designation: string;
  role: string;
};
type Props = {
  moduleKey: HrModuleKey;
  title: string;
  description: string;
  fields: HrField[];
  columns: HrColumn[];
  statuses?: string[];
  rows: Row[];
  lookups: Record<string, Lookup[]>;
  canManage: boolean;
  currentUserId: number;
  currentUserRole: string;
  initialQuery?: string;
};

function displayValue(value: Row[string]) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") return value.toLocaleString();
  return value.replaceAll("_", " ");
}

function safeHttpUrl(value: Row[string]) {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function HrModuleWorkspace({
  moduleKey,
  title,
  description,
  fields,
  columns,
  statuses = [],
  rows,
  lookups,
  canManage,
  currentUserId,
  currentUserRole,
  initialQuery = "",
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyRow, setBusyRow] = useState<number | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeDraft | null>(null);
  const [replyFeedbackId, setReplyFeedbackId] = useState<number | null>(null);
  const [feedbackReply, setFeedbackReply] = useState("");
  const [attendanceMode, setAttendanceMode] = useState("present");
  const [taskView, setTaskView] = useState<"list" | "board">("list");
  const isCEO = currentUserRole === "CEO";

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery = !term || Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(term));
      const matchesDepartment = moduleKey !== "employees" || departmentFilter === "all" || row.department === departmentFilter;
      const matchesRole = moduleKey !== "employees" || roleFilter === "all" || row.role === roleFilter;
      const matchesStatus = moduleKey !== "employees" || employeeStatusFilter === "all" || row.employment_status === employeeStatusFilter;
      return matchesQuery && matchesDepartment && matchesRole && matchesStatus;
    });
  }, [departmentFilter, employeeStatusFilter, moduleKey, query, roleFilter, rows]);

  const departmentOptions = useMemo(() => [...new Set(rows.map((row) => String(row.department ?? "")).filter(Boolean))].sort(), [rows]);
  const roleOptions = useMemo(() => [...new Set(rows.map((row) => String(row.role ?? "")).filter(Boolean))].sort(), [rows]);

  async function send(method: "POST" | "PATCH", body: Record<string, string | number>) {
    const response = await fetch(`/api/hr/${moduleKey}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "The request could not be completed.");
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const values: Record<string, string> = {};
    for (const field of fields) {
      const value = formData.get(field.name)?.toString() ?? "";
      if (value !== "" || field.required) values[field.name] = value;
    }
    try {
      await send("POST", values as Record<string, string>);
      event.currentTarget.reset();
      setMessage("Saved successfully.");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The record could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function updateRow(row: Row, status?: string, action?: string) {
    const id = Number(row.id ?? row.user_id);
    setBusyRow(id);
    setError("");
    setMessage("");
    try {
      await send("PATCH", { id, ...(status ? { status } : {}), ...(action ? { action } : {}) });
      setMessage("Updated successfully.");
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "The record could not be updated.");
    } finally {
      setBusyRow(null);
    }
  }

  async function saveEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingEmployee) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await send("PATCH", editingEmployee);
      setEditingEmployee(null);
      setMessage("Employee profile updated.");
      router.refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "The employee profile could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  async function saveFeedbackReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (replyFeedbackId === null) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await send("PATCH", { id: replyFeedbackId, managementResponse: feedbackReply });
      setReplyFeedbackId(null);
      setFeedbackReply("");
      setMessage("Feedback response saved.");
      router.refresh();
    } catch (replyError) {
      setError(replyError instanceof Error ? replyError.message : "The feedback response could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  function downloadCsv() {
    const escape = (value: string) => {
      const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
      return `"${safe.replaceAll('"', '""')}"`;
    };
    const lines = [
      columns.map(({ label }) => escape(label)).join(","),
      ...filteredRows.map((row) => columns.map(({ key }) => escape(String(row[key] ?? ""))).join(",")),
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${moduleKey}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const canUpdateTask = moduleKey === "task-management";
  const hasReadAction = moduleKey === "notifications";
  const hasCreateForm = fields.length > 0 && (moduleKey !== "employees" || isCEO);
  const hasRowActions = (statuses.length > 0 && (moduleKey === "employees" ? isCEO : canManage || canUpdateTask)) || hasReadAction;
  const checklistActions = moduleKey === "onboarding"
    ? [
        ["document_verified", "Verify docs"],
        ["account_created", "Create account"],
        ["hardware_ready", "Set up hardware"],
        ["email_setup", "Set up email"],
        ["orientation_complete", "Complete orientation"],
        ["manager_intro_complete", "Complete manager 1:1"],
      ]
    : moduleKey === "offboarding"
      ? [
          ["knowledge_transfer_complete", "Complete handover"],
          ["exit_interview_complete", "Complete exit interview"],
        ]
      : [];

  return (
    <div className="space-y-5">
      <header className="rounded-[26px] border border-white/10 bg-[#111827]/70 p-5 md:p-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">People operations</div>
            <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {moduleKey === "attendance" ? (
              <>
                <label className="sr-only" htmlFor="attendance-mode">Check-in status</label>
                <select id="attendance-mode" value={attendanceMode} onChange={(event) => setAttendanceMode(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-sm text-slate-200">
                  <option value="present">On site</option>
                  <option value="wfh">Work from home</option>
                  <option value="late">Late arrival</option>
                </select>
                <button disabled={busy} onClick={() => void (async () => {
                  setBusy(true);
                  setError("");
                  try {
                    await send("POST", { action: "check-in", mode: attendanceMode });
                    setMessage("Checked in successfully.");
                    router.refresh();
                  } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Check-in failed.");
                  } finally {
                    setBusy(false);
                  }
                })()} className="interactive-button interactive-button--primary rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50">
                  Check in
                </button>
                <button disabled={busy} onClick={() => void (async () => {
                  setBusy(true);
                  setError("");
                  try {
                    await send("POST", { action: "check-out" });
                    setMessage("Checked out successfully.");
                    router.refresh();
                  } catch (requestError) {
                    setError(requestError instanceof Error ? requestError.message : "Check-out failed.");
                  } finally {
                    setBusy(false);
                  }
                })()} className="interactive-button interactive-button--glass rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  Check out
                </button>
              </>
            ) : null}
            {moduleKey === "reports" ? (
              <>
                <button onClick={downloadCsv} className="interactive-button interactive-button--glass inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
                  <Download size={16} /> Export CSV
                </button>
                <button onClick={() => window.print()} className="interactive-button interactive-button--outline inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
                  <Printer size={16} /> Print
                </button>
              </>
            ) : null}
          </div>
        </div>
      </header>

      {error ? <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div> : null}
      {message ? <div role="status" className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div> : null}

      {hasCreateForm ? (
        <form onSubmit={handleCreate} className="rounded-[26px] border border-white/10 bg-[#111827]/70 p-5">
          <div className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-white">
            <Plus size={19} className="text-cyan-300" /> Add {title.replace(/s$/, "")}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {fields.map((field) => {
              const controlClass = "w-full rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400/50";
              const options = field.lookup ? lookups[field.lookup] ?? [] : (field.options ?? []).map((label) => ({ value: label, label: label.replaceAll("_", " ") }));
              return (
                <label key={field.name} className={`space-y-1.5 text-xs font-medium text-slate-300 ${field.type === "textarea" ? "md:col-span-2" : ""}`}>
                  <span>{field.label}</span>
                  {field.type === "textarea" ? (
                    <textarea name={field.name} required={field.required} rows={3} className={controlClass} />
                  ) : field.type === "select" ? (
                    <select name={field.name} required={field.required} className={controlClass} defaultValue="">
                      <option value="" disabled>Select…</option>
                      {options.map((option) => (
                        <option key={String(option.value)} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={field.name}
                      type={field.type}
                      required={field.required}
                      minLength={field.type === "password" ? 12 : undefined}
                      className={controlClass}
                    />
                  )}
                </label>
              );
            })}
          </div>
          <div className="mt-4 flex justify-end">
            <button disabled={busy} type="submit" className="interactive-button interactive-button--primary rounded-xl px-5 py-2.5 text-sm font-bold disabled:opacity-50">
              {busy ? "Saving…" : "Save record"}
            </button>
          </div>
        </form>
      ) : null}
      {moduleKey === "employees" && !isCEO ? (
        <p className="rounded-xl border border-cyan-400/15 bg-cyan-500/5 px-4 py-3 text-sm text-slate-300">Employee account creation, role changes, and deactivation are managed by the CEO.</p>
      ) : null}

      <section className="overflow-hidden rounded-[26px] border border-white/10 bg-[#111827]/70">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-white">Records</h2>
            <p className="mt-1 text-xs text-slate-500">{filteredRows.length} record{filteredRows.length === 1 ? "" : "s"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {moduleKey === "task-management" ? (
              <div className="flex rounded-xl border border-white/10 bg-[#0b1220] p-1">
                {(["list", "board"] as const).map((view) => <button key={view} type="button" aria-pressed={taskView === view} onClick={() => setTaskView(view)} className={`rounded-lg px-3 py-1.5 text-xs capitalize ${taskView === view ? "bg-cyan-400/15 text-cyan-100" : "text-slate-400"}`}>{view}</button>)}
              </div>
            ) : null}
            {moduleKey === "employees" ? (
              <>
                <select aria-label="Filter by department" value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-slate-200">
                  <option value="all">All departments</option>
                  {departmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <select aria-label="Filter by role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-slate-200">
                  <option value="all">All roles</option>
                  {roleOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <select aria-label="Filter by employment status" value={employeeStatusFilter} onChange={(event) => setEmployeeStatusFilter(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-sm text-slate-200">
                  <option value="all">All statuses</option>
                  {statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                </select>
              </>
            ) : null}
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0b1220] px-3 py-2 text-slate-400">
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" aria-label="Search records" className="w-full bg-transparent text-sm text-white outline-none sm:w-44" />
              {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="interactive-button interactive-button--icon rounded-md p-1"><X size={14} /></button> : null}
            </label>
          </div>
        </div>
        {moduleKey === "task-management" && taskView === "board" ? (
          <div className="grid gap-4 p-4 xl:grid-cols-3">
            {["not_started", "in_progress", "completed"].map((status) => (
              <section key={status} className="min-h-48 rounded-2xl border border-white/10 bg-[#0b1220]/70 p-3">
                <h3 className="mb-3 flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"><span>{status.replaceAll("_", " ")}</span><span className="font-number text-cyan-100">{filteredRows.filter((row) => row.status === status).length}</span></h3>
                <div className="space-y-2">
                  {filteredRows.filter((row) => row.status === status).map((row, index) => {
                    const rowId = Number(row.id ?? index);
                    return <article key={rowId} className="rounded-xl border border-white/10 bg-[#111827] p-3"><p className="font-medium text-white">{displayValue(row.title)}</p><p className="mt-1 text-xs text-slate-400">{displayValue(row.assignee)} · {displayValue(row.deadline)}</p><span className={`mt-3 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${row.priority === "high" ? "bg-rose-500/15 text-rose-200" : row.priority === "medium" ? "bg-amber-500/15 text-amber-200" : "bg-emerald-500/15 text-emerald-200"}`}>{displayValue(row.priority)}</span><label className="mt-3 block"><span className="sr-only">Update status for {String(row.title)}</span><select value={String(row.status)} disabled={busyRow === rowId || (!canManage && Number(row.assignee_id) !== currentUserId)} onChange={(event) => void updateRow(row, event.target.value)} className="w-full rounded-lg border border-white/10 bg-[#0b1220] px-2 py-1.5 text-xs text-slate-200">{statuses.map((nextStatus) => <option key={nextStatus} value={nextStatus}>{nextStatus.replaceAll("_", " ")}</option>)}</select></label></article>;
                  })}
                  {!filteredRows.some((row) => row.status === status) ? <p className="px-2 py-6 text-center text-xs text-slate-500">No tasks</p> : null}
                </div>
              </section>
            ))}
          </div>
        ) : <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.14em] text-slate-500">
              <tr>
                {columns.map((column) => <th key={column.key} className="px-4 py-3 font-semibold">{column.label}</th>)}
                {hasRowActions ? <th className="px-4 py-3 font-semibold">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredRows.map((row, index) => {
                const rowId = Number(row.id ?? row.user_id ?? index);
                const rowStatuses = moduleKey === "leave-management"
                  ? currentUserRole === "CEO"
                    ? row.status === "manager_approved" ? ["approved", "rejected"] : row.status === "pending" ? ["rejected"] : []
                    : row.status === "pending" ? ["manager_approved", "rejected"] : []
                  : statuses;
                const editable = rowStatuses.length > 0 && (moduleKey === "employees" ? isCEO : canManage || canUpdateTask);
                const currentStatus = String(row.status ?? row.employment_status ?? row.final_status ?? "");
                return (
                  <tr key={String(row.id ?? row.employee_id ?? index)} className="align-top text-slate-300 transition hover:bg-white/[0.025]">
                    {columns.map((column) => (
                      <td key={column.key} className="max-w-[360px] whitespace-pre-wrap px-4 py-3.5">
                        {column.key === "message" || column.key === "reason" || column.key === "description" || column.key === "management_response" ? (
                          <span className="line-clamp-3">{displayValue(row[column.key])}</span>
                        ) : column.key === "resume_url" ? (
                          safeHttpUrl(row[column.key]) ? <a href={safeHttpUrl(row[column.key]) ?? undefined} target="_blank" rel="noreferrer" className="text-cyan-200 underline hover:text-white">Open resume</a> : <span className="text-slate-500">—</span>
                        ) : (
                          <span className={column.key === "name" || column.key === "title" || column.key === "employee" ? "font-medium text-white" : ""}>
                            {column.key === "is_read" ? (row.is_read === 1 ? "Read" : "Unread") : displayValue(row[column.key])}
                          </span>
                        )}
                      </td>
                    ))}
                    {hasRowActions ? (
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {editable ? (
                            <select
                              aria-label={`Update status for record ${rowId}`}
                              value={currentStatus}
                              disabled={busyRow === rowId}
                              onChange={(event) => void updateRow(row, event.target.value)}
                              className="max-w-40 rounded-lg border border-white/10 bg-[#0b1220] px-2 py-1.5 text-xs text-slate-200"
                            >
                              {!rowStatuses.includes(currentStatus) ? <option value={currentStatus}>{displayValue(currentStatus)}</option> : null}
                              {rowStatuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                            </select>
                          ) : null}
                          {moduleKey === "employees" && isCEO ? (
                            <button
                              onClick={() => setEditingEmployee({
                                id: Number(row.user_id),
                                employeeId: String(row.employee_id ?? ""),
                                name: String(row.name ?? ""),
                                email: String(row.email ?? ""),
                                phone: String(row.phone ?? ""),
                                departmentId: Number(row.department_id ?? 0),
                                designation: String(row.designation ?? ""),
                                role: String(row.role ?? "Employee"),
                              })}
                              className="interactive-button interactive-button--outline rounded-lg px-2.5 py-1.5 text-xs font-medium text-cyan-100"
                            >
                              Edit profile
                            </button>
                          ) : null}
                          {moduleKey === "feedback" && canManage ? (
                            <button onClick={() => { setReplyFeedbackId(rowId); setFeedbackReply(String(row.management_response ?? "")); }} className="interactive-button interactive-button--outline rounded-lg px-2.5 py-1.5 text-xs font-medium text-cyan-100">
                              {row.management_response ? "Edit reply" : "Reply"}
                            </button>
                          ) : null}
                          {checklistActions.map(([field, label]) => row[field] === "Pending" ? (
                            <button key={field} onClick={() => void updateRow(row, undefined, field)} disabled={busyRow === rowId} className="interactive-button interactive-button--outline rounded-lg px-2.5 py-1.5 text-xs font-medium text-cyan-100 disabled:opacity-50">
                              {label}
                            </button>
                          ) : null)}
                          {hasReadAction && row.is_read === 0 ? (
                            <button onClick={() => void updateRow(row, undefined, "mark-read")} disabled={busyRow === rowId} className="interactive-button interactive-button--outline rounded-lg px-2.5 py-1.5 text-xs font-medium text-cyan-100 disabled:opacity-50">
                              Mark read
                            </button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })}
              {filteredRows.length === 0 ? (
                <tr><td colSpan={columns.length + (hasRowActions ? 1 : 0)} className="px-4 py-12 text-center text-sm text-slate-500">
                  {query ? "No records match your search." : "Nothing here yet. Create a record to get started."}
                </td></tr>
              ) : null}
            </tbody>
          </table>
        </div>}
      </section>
      {editingEmployee ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-4" role="dialog" aria-modal="true" aria-labelledby="employee-edit-title">
          <form onSubmit={saveEmployee} className="my-auto w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#0b1220] p-5 shadow-2xl md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs uppercase tracking-[0.18em] text-cyan-300">CEO governance</p><h2 id="employee-edit-title" className="mt-2 font-display text-2xl font-semibold">Edit employee profile</h2></div>
              <button type="button" onClick={() => setEditingEmployee(null)} aria-label="Close employee editor" className="interactive-button interactive-button--icon rounded-lg p-2"><X size={18} /></button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {([
                ["employeeId", "Employee ID", "text"],
                ["name", "Full name", "text"],
                ["email", "Work email", "email"],
                ["phone", "Phone", "tel"],
                ["designation", "Designation", "text"],
              ] as const).map(([field, label, type]) => (
                <label key={field} className="space-y-1.5 text-xs text-slate-300">{label}<input required type={type} value={editingEmployee[field]} onChange={(event) => setEditingEmployee((current) => current ? { ...current, [field]: event.target.value } : current)} className="w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50" /></label>
              ))}
              <label className="space-y-1.5 text-xs text-slate-300">Department<select required value={editingEmployee.departmentId} onChange={(event) => setEditingEmployee((current) => current ? { ...current, departmentId: Number(event.target.value) } : current)} className="w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50">{lookups.departments?.map((department) => <option key={department.value} value={department.value}>{department.label}</option>)}</select></label>
              <label className="space-y-1.5 text-xs text-slate-300">Role<select required value={editingEmployee.role} onChange={(event) => setEditingEmployee((current) => current ? { ...current, role: event.target.value } : current)} className="w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50">{["CEO", "CTO", "COO", "CSO", "CMO", "Employee"].map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditingEmployee(null)} className="interactive-button interactive-button--glass rounded-xl px-4 py-2.5 text-sm text-white">Cancel</button>
              <button disabled={busy} className="interactive-button interactive-button--primary rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50">{busy ? "Saving…" : "Save changes"}</button>
            </div>
          </form>
        </div>
      ) : null}
      {replyFeedbackId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-labelledby="feedback-reply-title">
          <form onSubmit={saveFeedbackReply} className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[#0b1220] p-5 shadow-2xl md:p-7">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Employee voice</p><h2 id="feedback-reply-title" className="mt-2 font-display text-2xl font-semibold">Management response</h2></div><button type="button" onClick={() => setReplyFeedbackId(null)} aria-label="Close feedback response" className="interactive-button interactive-button--icon rounded-lg p-2"><X size={18} /></button></div>
            <label className="mt-5 block space-y-2 text-sm text-slate-300">Response<textarea required minLength={3} maxLength={2000} rows={5} value={feedbackReply} onChange={(event) => setFeedbackReply(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50" /></label>
            <div className="mt-5 flex justify-end"><button disabled={busy} className="interactive-button interactive-button--primary rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50">{busy ? "Saving…" : "Save response"}</button></div>
          </form>
        </div>
      ) : null}
      <div className="sr-only">Signed in as {currentUserId}</div>
    </div>
  );
}
