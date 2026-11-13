import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, hashPassword, logAudit } from "@/lib/auth";
import { db } from "@/lib/db";
import { canAccessHrModule, getHrModule, getHrLookups, getHrRows, getUserPermissions } from "@/lib/hr";

type RouteContext = { params: Promise<{ module: string }> };

function responseError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getAccess(context: RouteContext) {
  const user = await getCurrentUser();
  if (!user || user.status !== "active") return { error: responseError("Sign in to continue.", 401) } as const;
  const { module: key } = await context.params;
  const hrModule = getHrModule(key);
  if (!hrModule) return { error: responseError("HR module not found.", 404) } as const;
  const permissions = getUserPermissions(user.id);
  if (!canAccessHrModule(hrModule, permissions)) return { error: responseError("You do not have access to this module.", 403) } as const;
  return { user, hrModule, canManage: !hrModule.permission || permissions.includes(hrModule.permission) } as const;
}

function readInput<T extends z.ZodType>(schema: T, value: unknown) {
  const result = schema.safeParse(value);
  if (!result.success) {
    return { error: responseError(result.error.issues[0]?.message ?? "Invalid input.", 400) } as const;
  }
  return { data: result.data } as const;
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

const employeeInput = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30),
  password: z.string().min(12).max(128),
  departmentId: z.coerce.number().int().positive(),
  designation: z.string().trim().min(2).max(120),
  joiningDate: z.string().refine(isValidDate, "Enter a valid joining date."),
});

const attendanceAction = z.object({
  action: z.enum(["check-in", "check-out"]),
  mode: z.enum(["present", "late", "wfh"]).optional(),
});
const leaveInput = z.object({
  leaveType: z.enum(["casual", "sick", "earned", "emergency", "other"]),
  startDate: z.string().refine(isValidDate, "Enter a valid start date."),
  endDate: z.string().refine(isValidDate, "Enter a valid end date."),
  reason: z.string().trim().min(5).max(2000),
});
const taskInput = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(4000).optional().default(""),
  userId: z.coerce.number().int().positive().optional(),
  priority: z.enum(["low", "medium", "high"]),
  deadline: z.string().optional().default(""),
});
const projectInput = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(4000).optional().default(""),
  userId: z.coerce.number().int().positive().optional(),
  priority: z.enum(["low", "medium", "high"]),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  budget: z.string().trim().max(80).optional().default(""),
});
const vacancyInput = z.object({
  title: z.string().trim().min(2).max(200),
  departmentId: z.coerce.number().int().positive(),
  description: z.string().trim().min(10).max(5000),
  requiredSkills: z.string().trim().max(1000).optional().default(""),
  experience: z.string().trim().max(100).optional().default(""),
  employmentType: z.enum(["full_time", "part_time", "contract", "internship"]).optional().default("full_time"),
  applicationDeadline: z.string().optional().default(""),
});
const applicationInput = z.object({
  vacancyId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(7).max(30),
  resumeUrl: z.string().trim().max(2000).optional().default(""),
});
const onboardingInput = z.object({
  userId: z.coerce.number().int().positive(),
  departmentAssigned: z.string().trim().max(120).optional().default(""),
  managerAssigned: z.string().trim().max(120).optional().default(""),
  joiningConfirmation: z.string().optional().default(""),
  initialTasks: z.string().trim().max(4000).optional().default(""),
});
const offboardingInput = z.object({
  userId: z.coerce.number().int().positive(),
  resignationDate: z.string().optional().default(""),
  exitInterview: z.string().trim().max(4000).optional().default(""),
  pendingTasks: z.string().trim().max(4000).optional().default(""),
  assetReturnStatus: z.enum(["pending", "in_progress", "returned"]).optional().default("pending"),
});
const feedbackInput = z.object({
  category: z.enum(["workplace", "culture", "wellbeing", "suggestion", "other"]).optional().default("other"),
  message: z.string().trim().min(5).max(4000),
  isAnonymous: z.enum(["yes", "no"]).optional().default("no"),
});

function isActiveUser(userId: number) {
  return Boolean(db.prepare("SELECT id FROM users WHERE id = ? AND status = 'active'").get(userId));
}

export async function GET(_request: Request, context: RouteContext) {
  const access = await getAccess(context);
  if ("error" in access) return access.error;
  const rows = getHrRows(access.hrModule.key, access.user, access.canManage);
  return NextResponse.json({
    rows,
    lookups: getHrLookups(access.canManage && Boolean(access.hrModule.permission)),
    canManage: access.canManage,
  });
}

export async function POST(request: Request, context: RouteContext) {
  const access = await getAccess(context);
  if ("error" in access) return access.error;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return responseError("Request body must be valid JSON.", 400);
  }

  const { user, hrModule: { key }, canManage } = access;
  try {
    switch (key) {
      case "employees": {
        if (!canManage) return responseError("Employee management permission is required.", 403);
        if (user.role !== "CEO") return responseError("Only the CEO can create employee accounts.", 403);
        const parsed = readInput(employeeInput, payload);
        if ("error" in parsed) return parsed.error;
        if (!db.prepare("SELECT id FROM departments WHERE id = ?").get(parsed.data.departmentId)) {
          return responseError("Select a valid department.", 400);
        }
        const role = db.prepare("SELECT id FROM roles WHERE name = 'Employee'").get() as { id: number } | undefined;
        if (!role) return responseError("Employee role is not configured.", 500);
        const create = db.transaction(() => {
          const userId = Number(db.prepare(`
            INSERT INTO users (name, email, phone, password_hash, role_id, status)
            VALUES (?, ?, ?, ?, ?, 'active')
          `).run(
            parsed.data.name,
            parsed.data.email.toLowerCase(),
            parsed.data.phone,
            hashPassword(parsed.data.password),
            role.id,
          ).lastInsertRowid);
          const employeeId = `BCX-${String(userId).padStart(4, "0")}`;
          db.prepare(`
            INSERT INTO employee_profiles (user_id, employee_id, department_id, designation, joining_date, employment_status)
            VALUES (?, ?, ?, ?, ?, 'active')
          `).run(userId, employeeId, parsed.data.departmentId, parsed.data.designation, parsed.data.joiningDate);
          db.prepare("INSERT INTO leave_balances (user_id) VALUES (?)").run(userId);
          logAudit("employee.created", user.id, "employee", userId, `Created employee profile ${employeeId}.`);
        });
        create();
        return NextResponse.json({ success: true }, { status: 201 });
      }
      case "attendance": {
        const parsed = readInput(attendanceAction, payload);
        if ("error" in parsed) return parsed.error;
        const now = new Date().toISOString();
        if (parsed.data.action === "check-in") {
          const existing = db.prepare(`
            SELECT id FROM attendance
            WHERE user_id = ? AND date(check_in, 'localtime') = date('now', 'localtime')
          `).get(user.id);
          if (existing) return responseError("You have already checked in today.", 409);
          db.prepare("INSERT INTO attendance (user_id, check_in, status) VALUES (?, ?, ?)").run(user.id, now, parsed.data.mode ?? "present");
          logAudit("attendance.check_in", user.id, "attendance");
        } else {
          const openRecord = db.prepare(`
            SELECT id, check_in FROM attendance
            WHERE user_id = ? AND check_out IS NULL
            ORDER BY check_in DESC LIMIT 1
          `).get(user.id) as { id: number; check_in: string | null } | undefined;
          if (!openRecord?.check_in) return responseError("There is no open check-in to close.", 409);
          const hours = Math.max(0, (Date.now() - Date.parse(openRecord.check_in)) / 3600000);
          db.prepare(`
            UPDATE attendance SET check_out = ?, working_hours = ?,
              status = CASE WHEN ? < 4 AND status = 'present' THEN 'half_day' ELSE status END
            WHERE id = ?
          `).run(now, Number(hours.toFixed(2)), hours, openRecord.id);
          logAudit("attendance.check_out", user.id, "attendance", openRecord.id);
        }
        return NextResponse.json({ success: true });
      }
      case "leave-management": {
        const parsed = readInput(leaveInput, payload);
        if ("error" in parsed) return parsed.error;
        const { startDate, endDate } = parsed.data;
        if (startDate > endDate) return responseError("End date must be on or after the start date.", 400);
        const overlap = db.prepare(`
          SELECT id FROM leave_requests
          WHERE user_id = ? AND status IN ('pending', 'approved')
            AND start_date <= ? AND end_date >= ?
        `).get(user.id, endDate, startDate);
        if (overlap) return responseError("This request overlaps an existing pending or approved leave.", 409);
        const id = Number(db.prepare(`
          INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, manager_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(user.id, parsed.data.leaveType, startDate, endDate, parsed.data.reason, canManage ? user.id : null).lastInsertRowid);
        logAudit("leave.requested", user.id, "leave_request", id);
        return NextResponse.json({ success: true }, { status: 201 });
      }
      case "task-management": {
        if (!canManage) return responseError("Task management permission is required.", 403);
        const parsed = readInput(taskInput, payload);
        if ("error" in parsed) return parsed.error;
        if (parsed.data.userId && !isActiveUser(parsed.data.userId)) return responseError("Select an active assignee.", 400);
        if (parsed.data.deadline && !isValidDate(parsed.data.deadline)) return responseError("Enter a valid task deadline.", 400);
        const id = Number(db.prepare(`
          INSERT INTO tasks (title, description, assignee_id, priority, deadline)
          VALUES (?, ?, ?, ?, ?)
        `).run(parsed.data.title, parsed.data.description, parsed.data.userId ?? null, parsed.data.priority, parsed.data.deadline || null).lastInsertRowid);
        logAudit("task.created", user.id, "task", id);
        return NextResponse.json({ success: true }, { status: 201 });
      }
      case "project-management": {
        if (!canManage) return responseError("Project management permission is required.", 403);
        const parsed = readInput(projectInput, payload);
        if ("error" in parsed) return parsed.error;
        const managerId = parsed.data.userId ?? user.id;
        if (!isActiveUser(managerId)) return responseError("Select an active project manager.", 400);
        for (const date of [parsed.data.startDate, parsed.data.endDate]) {
          if (date && !isValidDate(date)) return responseError("Enter valid project dates.", 400);
        }
        if (parsed.data.startDate && parsed.data.endDate && parsed.data.startDate > parsed.data.endDate) {
          return responseError("Project end date must be on or after the start date.", 400);
        }
        const projectId = `BCX-P-${Date.now().toString(36).toUpperCase()}`;
        const id = Number(db.prepare(`
          INSERT INTO projects (project_id, name, description, manager_id, priority, start_date, end_date, budget)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          projectId,
          parsed.data.name,
          parsed.data.description,
          managerId,
          parsed.data.priority,
          parsed.data.startDate || null,
          parsed.data.endDate || null,
          parsed.data.budget || null,
        ).lastInsertRowid);
        db.prepare("INSERT OR IGNORE INTO project_members (project_id, user_id, role_name) VALUES (?, ?, 'Manager')").run(id, managerId);
        logAudit("project.created", user.id, "project", id);
        return NextResponse.json({ success: true }, { status: 201 });
      }
      case "recruitment": {
        if (!canManage) return responseError("Recruitment permission is required.", 403);
        const parsed = readInput(vacancyInput, payload);
        if ("error" in parsed) return parsed.error;
        const department = db.prepare("SELECT name FROM departments WHERE id = ?").get(parsed.data.departmentId) as { name: string } | undefined;
        if (!department) return responseError("Select a valid department.", 400);
        if (parsed.data.applicationDeadline && !isValidDate(parsed.data.applicationDeadline)) return responseError("Enter a valid application deadline.", 400);
        const id = Number(db.prepare(`
          INSERT INTO job_vacancies (title, department, description, required_skills, experience, employment_type, application_deadline)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          parsed.data.title,
          department.name,
          parsed.data.description,
          parsed.data.requiredSkills,
          parsed.data.experience,
          parsed.data.employmentType,
          parsed.data.applicationDeadline || null,
        ).lastInsertRowid);
        logAudit("vacancy.created", user.id, "job_vacancy", id);
        return NextResponse.json({ success: true }, { status: 201 });
      }
      case "applications": {
        if (!canManage) return responseError("Recruitment permission is required.", 403);
        const parsed = readInput(applicationInput, payload);
        if ("error" in parsed) return parsed.error;
        const vacancy = db.prepare("SELECT id FROM job_vacancies WHERE id = ? AND status = 'open'").get(parsed.data.vacancyId);
        if (!vacancy) return responseError("Select an open position.", 400);
        const id = Number(db.prepare(`
          INSERT INTO job_applications (vacancy_id, name, email, phone, resume_url, applied_position)
          VALUES (?, ?, ?, ?, ?, (SELECT title FROM job_vacancies WHERE id = ?))
        `).run(
          parsed.data.vacancyId,
          parsed.data.name,
          parsed.data.email.toLowerCase(),
          parsed.data.phone,
          parsed.data.resumeUrl || null,
          parsed.data.vacancyId,
        ).lastInsertRowid);
        logAudit("application.created", user.id, "job_application", id);
        return NextResponse.json({ success: true }, { status: 201 });
      }
      case "onboarding": {
        if (!canManage) return responseError("Employee management permission is required.", 403);
        const parsed = readInput(onboardingInput, payload);
        if ("error" in parsed) return parsed.error;
        if (!isActiveUser(parsed.data.userId)) return responseError("Select an active employee.", 400);
        if (parsed.data.joiningConfirmation && !isValidDate(parsed.data.joiningConfirmation)) return responseError("Enter a valid confirmation date.", 400);
        const id = Number(db.prepare(`
          INSERT INTO onboarding_records (user_id, department_assigned, manager_assigned, joining_confirmation, initial_tasks)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          parsed.data.userId,
          parsed.data.departmentAssigned,
          parsed.data.managerAssigned,
          parsed.data.joiningConfirmation || null,
          parsed.data.initialTasks,
        ).lastInsertRowid);
        logAudit("onboarding.created", user.id, "onboarding", id);
        return NextResponse.json({ success: true }, { status: 201 });
      }
      case "offboarding": {
        if (!canManage) return responseError("Employee management permission is required.", 403);
        const parsed = readInput(offboardingInput, payload);
        if ("error" in parsed) return parsed.error;
        if (!isActiveUser(parsed.data.userId)) return responseError("Select an active employee.", 400);
        if (parsed.data.userId === user.id) return responseError("You cannot offboard your own account.", 400);
        if (parsed.data.resignationDate && !isValidDate(parsed.data.resignationDate)) return responseError("Enter a valid resignation date.", 400);
        const id = Number(db.prepare(`
          INSERT INTO offboarding_records (user_id, resignation_date, exit_interview, pending_tasks, asset_return_status)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          parsed.data.userId,
          parsed.data.resignationDate || null,
          parsed.data.exitInterview,
          parsed.data.pendingTasks,
          parsed.data.assetReturnStatus,
        ).lastInsertRowid);
        logAudit("offboarding.created", user.id, "offboarding", id);
        return NextResponse.json({ success: true }, { status: 201 });
      }
      case "feedback": {
        const parsed = readInput(feedbackInput, payload);
        if ("error" in parsed) return parsed.error;
        const anonymous = parsed.data.isAnonymous === "yes";
        const id = Number(db.prepare(`
          INSERT INTO employee_feedback (submitter_id, category, message, is_anonymous)
          VALUES (?, ?, ?, ?)
        `).run(anonymous ? null : user.id, parsed.data.category, parsed.data.message, anonymous ? 1 : 0).lastInsertRowid);
        logAudit("feedback.submitted", anonymous ? null : user.id, "feedback", id);
        return NextResponse.json({ success: true }, { status: 201 });
      }
      default:
        return responseError("This module does not accept new records.", 405);
    }
  } catch (error) {
    if (error instanceof Error && /UNIQUE constraint failed/.test(error.message)) {
      return responseError("A record with the same unique value already exists.", 409);
    }
    console.error("HR record creation failed", error);
    return responseError("Unable to save this record.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const access = await getAccess(context);
  if ("error" in access) return access.error;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return responseError("Request body must be valid JSON.", 400);
  }
  const parsed = readInput(z.object({
    id: z.coerce.number().int().positive(),
    status: z.string().optional(),
    action: z.enum([
      "mark-read",
      "document_verified",
      "account_created",
      "hardware_ready",
      "email_setup",
      "orientation_complete",
      "manager_intro_complete",
      "knowledge_transfer_complete",
      "exit_interview_complete",
    ]).optional(),
    employeeId: z.string().trim().min(2).max(40).optional(),
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().email().max(254).optional(),
    phone: z.string().trim().min(7).max(30).optional(),
    departmentId: z.coerce.number().int().positive().optional(),
    designation: z.string().trim().min(2).max(120).optional(),
    role: z.enum(["CEO", "CTO", "COO", "CSO", "CMO", "Employee"]).optional(),
    managementResponse: z.string().trim().min(3).max(2000).optional(),
  }).refine((value) => Boolean(
    value.status || value.action || value.employeeId || value.name || value.email ||
    value.phone || value.departmentId || value.designation || value.role || value.managementResponse
  ), "Provide an update."), payload);
  if ("error" in parsed) return parsed.error;

  const { user, hrModule: { key }, canManage } = access;
  const { id, status, action } = parsed.data;
  try {
    switch (key) {
      case "employees": {
        if (!canManage) return responseError("Employee management permission is required.", 403);
        if (user.role !== "CEO") return responseError("Only the CEO can update employee accounts.", 403);
        const employee = db.prepare("SELECT user_id FROM employee_profiles WHERE user_id = ?").get(id);
        if (!employee) return responseError("Employee not found.", 404);
        const hasProfileFields = Boolean(
          parsed.data.employeeId || parsed.data.name || parsed.data.email || parsed.data.phone ||
          parsed.data.departmentId || parsed.data.designation || parsed.data.role
        );
        if (status && hasProfileFields) return responseError("Update employee details or status in separate requests.", 400);
        if (status) {
          if (!["active", "on_leave", "terminated"].includes(status)) return responseError("Invalid employment status.", 400);
          if (id === user.id && status === "terminated") return responseError("You cannot deactivate your own account.", 400);
          const updateStatus = db.transaction(() => {
            db.prepare("UPDATE employee_profiles SET employment_status = ? WHERE user_id = ?").run(status, id);
            db.prepare("UPDATE users SET status = ?, session_version = session_version + 1 WHERE id = ?")
              .run(status === "terminated" ? "inactive" : "active", id);
            logAudit("employee.status_updated", user.id, "employee", id, `Employment status changed to ${status}.`);
          });
          updateStatus();
          break;
        }
        const { employeeId, name, email, phone, departmentId, designation, role } = parsed.data;
        if (!employeeId || !name || !email || !phone || !departmentId || !designation || !role) {
          return responseError("Provide employee ID, name, email, phone, department, designation, and role.", 400);
        }
        if (id === user.id && role !== "CEO") return responseError("You cannot remove your own CEO access.", 400);
        if (!db.prepare("SELECT id FROM departments WHERE id = ?").get(departmentId)) {
          return responseError("Select a valid department.", 400);
        }
        const roleId = db.prepare("SELECT id FROM roles WHERE name = ?").get(role) as { id: number } | undefined;
        if (!roleId) return responseError("Select a valid role.", 400);
        const updateProfile = db.transaction(() => {
          db.prepare("UPDATE users SET name = ?, email = ?, phone = ?, role_id = ?, session_version = session_version + 1 WHERE id = ?")
            .run(name, email.toLowerCase(), phone, roleId.id, id);
          db.prepare(`
            UPDATE employee_profiles
            SET employee_id = ?, department_id = ?, designation = ?
            WHERE user_id = ?
          `).run(employeeId, departmentId, designation, id);
          logAudit("employee.updated", user.id, "employee", id, `Role changed to ${role}; profile details updated.`);
        });
        updateProfile();
        break;
      }
      case "leave-management": {
        if (!canManage) return responseError("Only a leave manager can approve or reject requests.", 403);
        if (!["manager_approved", "approved", "rejected"].includes(status ?? "")) return responseError("Invalid leave decision.", 400);
        const decide = db.transaction(() => {
          const requestRow = db.prepare("SELECT * FROM leave_requests WHERE id = ?").get(id) as {
            id: number; user_id: number; leave_type: string; start_date: string; end_date: string;
            status: string; manager_approved_by: number | null;
          } | undefined;
          if (!requestRow) throw new Error("NOT_FOUND");
          if (requestRow.status === "pending" && status === "manager_approved") {
            db.prepare(`
              UPDATE leave_requests
              SET status = 'manager_approved', manager_id = ?, manager_approved_by = ?, manager_approved_at = ?
              WHERE id = ? AND status = 'pending'
            `).run(user.id, user.id, new Date().toISOString(), id);
            db.prepare(`
              INSERT INTO notifications (user_id, title, message, type)
              VALUES (?, 'Leave request needs final approval', ?, 'info')
            `).run(requestRow.user_id, `Your ${requestRow.leave_type} leave request is awaiting CEO review.`);
            db.prepare(`
              INSERT INTO notifications (user_id, title, message, type)
              SELECT u.id, 'Leave request needs final approval', ?, 'info'
              FROM users u JOIN roles r ON r.id = u.role_id
              WHERE r.name = 'CEO' AND u.status = 'active' AND u.id != ?
            `).run(`Leave request #${id} is manager-approved and awaits your decision.`, user.id);
            logAudit("leave.manager_approved", user.id, "leave_request", id);
            return;
          }
          if (requestRow.status === "manager_approved" && status === "approved") {
            if (user.role !== "CEO") throw new Error("CEO_REQUIRED");
            const balanceColumn: Record<string, string> = {
              casual: "casual", sick: "sick", earned: "earned", emergency: "emergency", other: "other",
            };
            const column = balanceColumn[requestRow.leave_type];
            if (!column) throw new Error("INVALID_LEAVE_TYPE");
            db.prepare("INSERT OR IGNORE INTO leave_balances (user_id) VALUES (?)").run(requestRow.user_id);
            const balance = db.prepare(`SELECT ${column} AS remaining FROM leave_balances WHERE user_id = ?`).get(requestRow.user_id) as { remaining: number };
            const days = Math.floor((Date.parse(`${requestRow.end_date}T00:00:00Z`) - Date.parse(`${requestRow.start_date}T00:00:00Z`)) / 86400000) + 1;
            if (days < 1 || balance.remaining < days) throw new Error("INSUFFICIENT_BALANCE");
            db.prepare(`UPDATE leave_balances SET ${column} = ${column} - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`).run(days, requestRow.user_id);
            db.prepare(`
              UPDATE leave_requests
              SET status = 'approved', ceo_approved_by = ?, ceo_approved_at = ?
              WHERE id = ? AND status = 'manager_approved'
            `).run(user.id, new Date().toISOString(), id);
            db.prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Leave approved', ?, 'success')")
              .run(requestRow.user_id, `Your ${requestRow.leave_type} leave request was approved.`);
            logAudit("leave.approved", user.id, "leave_request", id);
            return;
          }
          if (status === "rejected" && ["pending", "manager_approved"].includes(requestRow.status)) {
            if (requestRow.status === "manager_approved" && user.role !== "CEO") throw new Error("CEO_REQUIRED");
            db.prepare(`
              UPDATE leave_requests SET status = 'rejected',
                manager_id = coalesce(manager_id, ?),
                ceo_approved_by = CASE WHEN ? = 'CEO' THEN ? ELSE ceo_approved_by END,
                ceo_approved_at = CASE WHEN ? = 'CEO' THEN ? ELSE ceo_approved_at END
              WHERE id = ?
            `).run(user.id, user.role, user.id, user.role, new Date().toISOString(), id);
            db.prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Leave request declined', ?, 'warning')")
              .run(requestRow.user_id, `Your ${requestRow.leave_type} leave request was declined.`);
            logAudit("leave.rejected", user.id, "leave_request", id);
            return;
          }
          throw new Error("ALREADY_DECIDED");
        });
        try {
          decide();
        } catch (error) {
          if (error instanceof Error && error.message === "NOT_FOUND") return responseError("Leave request not found.", 404);
          if (error instanceof Error && error.message === "ALREADY_DECIDED") return responseError("This leave request has already been reviewed.", 409);
          if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") return responseError("The employee does not have enough leave balance.", 409);
          if (error instanceof Error && error.message === "CEO_REQUIRED") return responseError("Only the CEO can give final approval after manager review.", 403);
          throw error;
        }
        break;
      }
      case "task-management": {
        if (!["not_started", "in_progress", "completed"].includes(status ?? "")) return responseError("Invalid task status.", 400);
        const task = db.prepare("SELECT assignee_id FROM tasks WHERE id = ?").get(id) as { assignee_id: number | null } | undefined;
        if (!task) return responseError("Task not found.", 404);
        if (!canManage && task.assignee_id !== user.id) return responseError("You can only update tasks assigned to you.", 403);
        db.prepare("UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, id);
        logAudit("task.status_updated", user.id, "task", id, `Task status changed to ${status}.`);
        break;
      }
      case "project-management": {
        if (!canManage) return responseError("Project management permission is required.", 403);
        if (!["active", "in_progress", "on_hold", "completed"].includes(status ?? "")) return responseError("Invalid project status.", 400);
        const result = db.prepare("UPDATE projects SET status = ? WHERE id = ?").run(status, id);
        if (result.changes === 0) return responseError("Project not found.", 404);
        logAudit("project.status_updated", user.id, "project", id, `Project status changed to ${status}.`);
        break;
      }
      case "recruitment": {
        if (!canManage) return responseError("Recruitment permission is required.", 403);
        if (!["open", "paused", "closed"].includes(status ?? "")) return responseError("Invalid vacancy status.", 400);
        const result = db.prepare("UPDATE job_vacancies SET status = ? WHERE id = ?").run(status, id);
        if (result.changes === 0) return responseError("Position not found.", 404);
        logAudit("vacancy.status_updated", user.id, "job_vacancy", id);
        break;
      }
      case "applications": {
        if (!canManage) return responseError("Recruitment permission is required.", 403);
        if (!["applied", "resume_screening", "shortlisted", "interview", "offered", "hired", "rejected"].includes(status ?? "")) return responseError("Invalid application stage.", 400);
        const result = db.prepare("UPDATE job_applications SET status = ? WHERE id = ?").run(status, id);
        if (result.changes === 0) return responseError("Application not found.", 404);
        logAudit("application.stage_updated", user.id, "job_application", id, `Application moved to ${status}.`);
        break;
      }
      case "onboarding": {
        if (!canManage) return responseError("Employee management permission is required.", 403);
        const checklistColumns: Record<string, string> = {
          document_verified: "document_verified",
          account_created: "account_created",
          hardware_ready: "hardware_ready",
          email_setup: "email_setup",
          orientation_complete: "orientation_complete",
          manager_intro_complete: "manager_intro_complete",
        };
        if (action) {
          const column = checklistColumns[action];
          if (!column) return responseError("Invalid onboarding checklist action.", 400);
          const result = db.prepare(`UPDATE onboarding_records SET ${column} = 1 WHERE id = ?`).run(id);
          if (result.changes === 0) return responseError("Onboarding record not found.", 404);
          logAudit("onboarding.checklist_updated", user.id, "onboarding", id, `${column} marked complete.`);
          break;
        }
        if (!["in_progress", "completed", "on_hold"].includes(status ?? "")) return responseError("Invalid onboarding status.", 400);
        if (status === "completed") {
          const checklist = db.prepare(`
            SELECT document_verified, account_created, hardware_ready, email_setup, orientation_complete, manager_intro_complete
            FROM onboarding_records WHERE id = ?
          `).get(id) as Record<string, number> | undefined;
          if (!checklist) return responseError("Onboarding record not found.", 404);
          if (Object.values(checklist).some((value) => value !== 1)) {
            return responseError("Complete every onboarding checklist item before closing this record.", 409);
          }
        }
        const result = db.prepare("UPDATE onboarding_records SET status = ? WHERE id = ?").run(status, id);
        if (result.changes === 0) return responseError("Onboarding record not found.", 404);
        logAudit("onboarding.status_updated", user.id, "onboarding", id);
        break;
      }
      case "offboarding": {
        if (!canManage) return responseError("Employee management permission is required.", 403);
        if (action) {
          const checklistColumns: Record<string, string> = {
            knowledge_transfer_complete: "knowledge_transfer_complete",
            exit_interview_complete: "exit_interview_complete",
          };
          const column = checklistColumns[action];
          if (!column) return responseError("Invalid offboarding checklist action.", 400);
          const result = db.prepare(`UPDATE offboarding_records SET ${column} = 1 WHERE id = ?`).run(id);
          if (result.changes === 0) return responseError("Offboarding record not found.", 404);
          logAudit("offboarding.checklist_updated", user.id, "offboarding", id, `${column} marked complete.`);
          break;
        }
        if (!["pending", "in_progress", "completed"].includes(status ?? "")) return responseError("Invalid offboarding status.", 400);
        if (status === "completed" && user.role !== "CEO") return responseError("Only the CEO can complete offboarding and deactivate an account.", 403);
        const update = db.transaction(() => {
          const record = db.prepare(`
            SELECT user_id, asset_return_status, knowledge_transfer_complete, exit_interview_complete
            FROM offboarding_records WHERE id = ?
          `).get(id) as { user_id: number; asset_return_status: string; knowledge_transfer_complete: number; exit_interview_complete: number } | undefined;
          if (!record) return false;
          if (record.user_id === user.id && status === "completed") throw new Error("SELF_OFFBOARDING");
          if (status === "completed" && (
            record.asset_return_status !== "returned" ||
            record.knowledge_transfer_complete !== 1 ||
            record.exit_interview_complete !== 1
          )) throw new Error("CHECKLIST_INCOMPLETE");
          db.prepare(`
            UPDATE offboarding_records SET final_status = ?,
              account_deactivated = CASE WHEN ? = 'completed' THEN 1 ELSE account_deactivated END
            WHERE id = ?
          `).run(status, status, id);
          if (status === "completed") {
            db.prepare("UPDATE users SET status = 'inactive', session_version = session_version + 1 WHERE id = ?").run(record.user_id);
            db.prepare("UPDATE employee_profiles SET employment_status = 'terminated' WHERE user_id = ?").run(record.user_id);
          }
          logAudit("offboarding.status_updated", user.id, "offboarding", id, `Offboarding status changed to ${status}.`);
          return true;
        });
        try {
          if (!update()) return responseError("Offboarding record not found.", 404);
        } catch (error) {
          if (error instanceof Error && error.message === "SELF_OFFBOARDING") return responseError("You cannot complete your own offboarding.", 400);
          if (error instanceof Error && error.message === "CHECKLIST_INCOMPLETE") return responseError("Return assets and complete knowledge transfer and the exit interview before offboarding.", 409);
          throw error;
        }
        break;
      }
      case "feedback": {
        if (!canManage) return responseError("Feedback management permission is required.", 403);
        if (parsed.data.managementResponse) {
          const record = db.prepare("SELECT submitter_id FROM employee_feedback WHERE id = ?").get(id) as { submitter_id: number | null } | undefined;
          if (!record) return responseError("Feedback record not found.", 404);
          const responseStatus = status ?? "in_review";
          if (!["new", "in_review", "resolved"].includes(responseStatus)) return responseError("Invalid feedback status.", 400);
          db.prepare("UPDATE employee_feedback SET management_response = ?, status = ? WHERE id = ?")
            .run(parsed.data.managementResponse, responseStatus, id);
          if (record.submitter_id !== null) {
            db.prepare("INSERT INTO notifications (user_id, title, message, type) VALUES (?, 'Management replied to your feedback', ?, 'info')")
              .run(record.submitter_id, `Your feedback has a response and is now ${responseStatus.replaceAll("_", " ")}.`);
          }
          logAudit("feedback.responded", user.id, "feedback", id);
          break;
        }
        if (!["new", "in_review", "resolved"].includes(status ?? "")) return responseError("Invalid feedback status.", 400);
        const result = db.prepare("UPDATE employee_feedback SET status = ? WHERE id = ?").run(status, id);
        if (result.changes === 0) return responseError("Feedback not found.", 404);
        logAudit("feedback.status_updated", user.id, "feedback", id);
        break;
      }
      case "notifications": {
        if (action !== "mark-read") return responseError("Invalid notification action.", 400);
        const result = db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND (user_id = ? OR user_id IS NULL)").run(id, user.id);
        if (result.changes === 0) return responseError("Notification not found.", 404);
        break;
      }
      default:
        return responseError("This module does not support updates.", 405);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("HR record update failed", error);
    return responseError("Unable to update this record.", 500);
  }
}
