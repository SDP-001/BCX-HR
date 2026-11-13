import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";

export type HrModuleKey =
  | "employees"
  | "attendance"
  | "leave-management"
  | "task-management"
  | "project-management"
  | "recruitment"
  | "applications"
  | "onboarding"
  | "offboarding"
  | "feedback"
  | "reports"
  | "notifications"
  | "settings";

export type HrField = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "password" | "date" | "number" | "textarea" | "select";
  required?: boolean;
  options?: string[];
  lookup?: "employees" | "departments" | "projects" | "vacancies";
};

export type HrColumn = { key: string; label: string };

export type HrModuleDefinition = {
  key: HrModuleKey;
  title: string;
  description: string;
  permission?: string;
  selfService?: boolean;
  fields: HrField[];
  columns: HrColumn[];
  statuses?: string[];
};

const employeeLookup: HrField = {
  name: "userId",
  label: "Employee",
  type: "select",
  required: true,
  lookup: "employees",
};

export const hrModules: HrModuleDefinition[] = [
  {
    key: "employees",
    title: "Employees",
    description: "Maintain employee accounts, roles, and profile details.",
    permission: "employee.manage",
    fields: [
      { name: "name", label: "Full name", type: "text", required: true },
      { name: "email", label: "Work email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel", required: true },
      { name: "password", label: "Temporary password (12+ characters)", type: "password", required: true },
      { name: "departmentId", label: "Department", type: "select", required: true, lookup: "departments" },
      { name: "designation", label: "Designation", type: "text", required: true },
      { name: "joiningDate", label: "Joining date", type: "date", required: true },
    ],
    columns: [
      { key: "employee_id", label: "ID" },
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "department", label: "Department" },
      { key: "designation", label: "Designation" },
      { key: "role", label: "Role" },
      { key: "employment_status", label: "Status" },
    ],
    statuses: ["active", "on_leave", "terminated"],
  },
  {
    key: "attendance",
    title: "Attendance",
    description: "Record today's attendance or review employee check-in and work-hour history.",
    permission: "attendance.manage",
    selfService: true,
    fields: [],
    columns: [
      { key: "employee", label: "Employee" },
      { key: "work_date", label: "Date" },
      { key: "check_in", label: "Check in" },
      { key: "check_out", label: "Check out" },
      { key: "working_hours", label: "Hours" },
      { key: "status", label: "Status" },
    ],
  },
  {
    key: "leave-management",
    title: "Leave Management",
    description: "Request time off and manage leave approvals and balances.",
    permission: "leave.manage",
    selfService: true,
    fields: [
      { name: "leaveType", label: "Leave type", type: "select", required: true, options: ["casual", "sick", "earned", "emergency", "other"] },
      { name: "startDate", label: "Start date", type: "date", required: true },
      { name: "endDate", label: "End date", type: "date", required: true },
      { name: "reason", label: "Reason", type: "textarea", required: true },
    ],
    columns: [
      { key: "employee", label: "Employee" },
      { key: "leave_type", label: "Type" },
      { key: "start_date", label: "From" },
      { key: "end_date", label: "To" },
      { key: "days", label: "Days" },
      { key: "reason", label: "Reason" },
      { key: "manager_review", label: "Manager review" },
      { key: "ceo_review", label: "CEO review" },
      { key: "status", label: "Status" },
    ],
    statuses: ["approved", "rejected"],
  },
  {
    key: "task-management",
    title: "Task Management",
    description: "Create work items, assign owners, and track delivery.",
    permission: "task.manage",
    selfService: true,
    fields: [
      { name: "title", label: "Task title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { ...employeeLookup, required: false },
      { name: "priority", label: "Priority", type: "select", required: true, options: ["low", "medium", "high"] },
      { name: "deadline", label: "Deadline", type: "date" },
    ],
    columns: [
      { key: "title", label: "Task" },
      { key: "assignee", label: "Assignee" },
      { key: "priority", label: "Priority" },
      { key: "deadline", label: "Deadline" },
      { key: "status", label: "Status" },
    ],
    statuses: ["not_started", "in_progress", "completed"],
  },
  {
    key: "project-management",
    title: "Project Management",
    description: "Manage the project portfolio, ownership, budgets, and timelines.",
    permission: "project.manage",
    selfService: true,
    fields: [
      { name: "name", label: "Project name", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { ...employeeLookup, label: "Project manager", required: false },
      { name: "priority", label: "Priority", type: "select", required: true, options: ["low", "medium", "high"] },
      { name: "startDate", label: "Start date", type: "date" },
      { name: "endDate", label: "End date", type: "date" },
      { name: "budget", label: "Budget", type: "text" },
    ],
    columns: [
      { key: "project_id", label: "ID" },
      { key: "name", label: "Project" },
      { key: "manager", label: "Manager" },
      { key: "priority", label: "Priority" },
      { key: "start_date", label: "Start" },
      { key: "end_date", label: "End" },
      { key: "budget", label: "Budget" },
      { key: "status", label: "Status" },
    ],
    statuses: ["active", "in_progress", "on_hold", "completed"],
  },
  {
    key: "recruitment",
    title: "Recruitment",
    description: "Publish and manage open positions and hiring requirements.",
    permission: "recruitment.manage",
    fields: [
      { name: "title", label: "Position title", type: "text", required: true },
      { name: "departmentId", label: "Department", type: "select", required: true, lookup: "departments" },
      { name: "description", label: "Role description", type: "textarea", required: true },
      { name: "requiredSkills", label: "Required skills", type: "text" },
      { name: "experience", label: "Experience", type: "text" },
      { name: "employmentType", label: "Employment type", type: "select", options: ["full_time", "part_time", "contract", "internship"] },
      { name: "applicationDeadline", label: "Application deadline", type: "date" },
    ],
    columns: [
      { key: "title", label: "Position" },
      { key: "department", label: "Department" },
      { key: "employment_type", label: "Type" },
      { key: "application_deadline", label: "Deadline" },
      { key: "application_count", label: "Applicants" },
      { key: "status", label: "Status" },
    ],
    statuses: ["open", "paused", "closed"],
  },
  {
    key: "applications",
    title: "Applications",
    description: "Review candidates and move applications through your hiring pipeline.",
    permission: "recruitment.manage",
    fields: [
      { ...employeeLookup, name: "vacancyId", label: "Open position", lookup: "vacancies" },
      { name: "name", label: "Candidate name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel", required: true },
      { name: "resumeUrl", label: "Resume URL", type: "text" },
    ],
    columns: [
      { key: "name", label: "Candidate" },
      { key: "email", label: "Email" },
      { key: "position", label: "Position" },
      { key: "resume_url", label: "Resume" },
      { key: "application_date", label: "Applied" },
      { key: "status", label: "Stage" },
    ],
    statuses: ["applied", "resume_screening", "shortlisted", "interview", "offered", "hired", "rejected"],
  },
  {
    key: "onboarding",
    title: "Onboarding",
    description: "Track document checks, account setup, and first-week readiness.",
    permission: "employee.manage",
    fields: [
      { ...employeeLookup },
      { name: "departmentAssigned", label: "Department", type: "text" },
      { name: "managerAssigned", label: "Manager", type: "text" },
      { name: "joiningConfirmation", label: "Joining confirmation", type: "date" },
      { name: "initialTasks", label: "Initial tasks", type: "textarea" },
    ],
    columns: [
      { key: "employee", label: "Employee" },
      { key: "department_assigned", label: "Department" },
      { key: "manager_assigned", label: "Manager" },
      { key: "document_verified", label: "Documents" },
      { key: "account_created", label: "Account" },
      { key: "hardware_ready", label: "Hardware" },
      { key: "email_setup", label: "Email setup" },
      { key: "orientation_complete", label: "Orientation" },
      { key: "manager_intro_complete", label: "Manager 1:1" },
      { key: "status", label: "Status" },
    ],
    statuses: ["in_progress", "completed", "on_hold"],
  },
  {
    key: "offboarding",
    title: "Offboarding",
    description: "Coordinate exit activities and record the final employment status.",
    permission: "employee.manage",
    fields: [
      { ...employeeLookup },
      { name: "resignationDate", label: "Resignation date", type: "date" },
      { name: "exitInterview", label: "Exit interview notes", type: "textarea" },
      { name: "pendingTasks", label: "Pending tasks", type: "textarea" },
      { name: "assetReturnStatus", label: "Asset return", type: "select", options: ["pending", "in_progress", "returned"] },
    ],
    columns: [
      { key: "employee", label: "Employee" },
      { key: "resignation_date", label: "Resignation" },
      { key: "asset_return_status", label: "Assets" },
      { key: "knowledge_transfer_complete", label: "Knowledge transfer" },
      { key: "exit_interview_complete", label: "Exit interview" },
      { key: "account_deactivated", label: "Account" },
      { key: "final_status", label: "Status" },
    ],
    statuses: ["pending", "in_progress", "completed"],
  },
  {
    key: "feedback",
    title: "Feedback",
    description: "Share employee feedback or review submissions with management.",
    permission: "feedback.manage",
    selfService: true,
    fields: [
      { name: "category", label: "Category", type: "select", options: ["workplace", "culture", "wellbeing", "suggestion", "other"] },
      { name: "message", label: "Feedback", type: "textarea", required: true },
      { name: "isAnonymous", label: "Anonymous", type: "select", options: ["no", "yes"] },
    ],
    columns: [
      { key: "category", label: "Category" },
      { key: "message", label: "Feedback" },
      { key: "submitter", label: "Submitted by" },
      { key: "created_at", label: "Date" },
      { key: "management_response", label: "Management reply" },
      { key: "status", label: "Status" },
    ],
    statuses: ["new", "in_review", "resolved"],
  },
  {
    key: "reports",
    title: "Reports",
    description: "Review workforce, attendance, leave, hiring, and project metrics.",
    permission: "report.view",
    fields: [],
    columns: [
      { key: "metric", label: "Metric" },
      { key: "value", label: "Current value" },
      { key: "context", label: "Notes" },
    ],
  },
  {
    key: "notifications",
    title: "Notifications",
    description: "Review your HR updates and mark items as read.",
    selfService: true,
    fields: [],
    columns: [
      { key: "title", label: "Notification" },
      { key: "message", label: "Details" },
      { key: "type", label: "Type" },
      { key: "created_at", label: "Received" },
      { key: "is_read", label: "Read" },
    ],
  },
  {
    key: "settings",
    title: "Settings & Audit",
    description: "Review account and access-control configuration and recent audit events.",
    permission: "settings.manage",
    fields: [],
    columns: [
      { key: "created_at", label: "Time" },
      { key: "actor", label: "Actor" },
      { key: "action", label: "Action" },
      { key: "entity_type", label: "Record type" },
      { key: "details", label: "Details" },
    ],
  },
];

export function getHrModule(key: string) {
  const routeAliases: Record<string, HrModuleKey> = {
    leaves: "leave-management",
    tasks: "task-management",
    projects: "project-management",
  };
  const canonicalKey = routeAliases[key] ?? key;
  return hrModules.find((module) => module.key === canonicalKey);
}

export function canAccessHrModule(module: HrModuleDefinition, permissions: string[]) {
  return !module.permission || permissions.includes(module.permission) || Boolean(module.selfService);
}

export function getUserPermissions(userId: number) {
  return (
    db
      .prepare(`
        SELECT p.name
        FROM permissions p
        JOIN role_permissions rp ON rp.permission_id = p.id
        JOIN users u ON u.role_id = rp.role_id
        WHERE u.id = ?
      `)
      .all(userId) as { name: string }[]
  ).map(({ name }) => name);
}

export function getHrLookups(includeManagementLookups = true) {
  return {
    employees: includeManagementLookups ? db.prepare(`
      SELECT u.id AS value, u.name AS label
      FROM users u
      WHERE u.status = 'active'
      ORDER BY u.name
    `).all() as { value: number; label: string }[] : [],
    departments: includeManagementLookups ? db.prepare(`
      SELECT id AS value, name AS label FROM departments ORDER BY name
    `).all() as { value: number; label: string }[] : [],
    vacancies: includeManagementLookups ? db.prepare(`
      SELECT id AS value, title AS label FROM job_vacancies WHERE status = 'open' ORDER BY title
    `).all() as { value: number; label: string }[] : [],
  };
}

export function getHrRows(key: HrModuleKey, user: SessionUser, canManage: boolean) {
  switch (key) {
    case "employees":
      return db.prepare(`
        SELECT ep.employee_id, u.id AS user_id, u.name, u.email, u.phone, ep.department_id, d.name AS department,
          ep.designation, r.name AS role, ep.employment_status
        FROM employee_profiles ep
        JOIN users u ON u.id = ep.user_id
        LEFT JOIN departments d ON d.id = ep.department_id
        JOIN roles r ON r.id = u.role_id
        ORDER BY u.name
      `).all();
    case "attendance":
      return db.prepare(`
        SELECT a.id, u.name AS employee, date(a.check_in) AS work_date, a.check_in, a.check_out,
          round(a.working_hours, 2) AS working_hours, a.status, a.user_id
        FROM attendance a JOIN users u ON u.id = a.user_id
        ${canManage ? "" : "WHERE a.user_id = ?"}
        ORDER BY a.check_in DESC LIMIT 200
      `).all(...(canManage ? [] : [user.id]));
    case "leave-management":
      return db.prepare(`
        SELECT lr.id, u.name AS employee, lr.user_id, lr.leave_type, lr.start_date, lr.end_date,
          cast(julianday(lr.end_date) - julianday(lr.start_date) + 1 AS INTEGER) AS days,
          lr.reason,
          CASE WHEN lr.manager_approved_by IS NOT NULL THEN 'Approved' WHEN lr.status = 'rejected' THEN 'Rejected' ELSE 'Pending' END AS manager_review,
          CASE WHEN lr.ceo_approved_by IS NOT NULL THEN 'Approved' WHEN lr.status = 'rejected' THEN 'Rejected' ELSE 'Pending' END AS ceo_review,
          lr.status
        FROM leave_requests lr JOIN users u ON u.id = lr.user_id
        ${canManage ? "" : "WHERE lr.user_id = ?"}
        ORDER BY lr.created_at DESC
      `).all(...(canManage ? [] : [user.id]));
    case "task-management":
      return db.prepare(`
        SELECT t.id, t.title, t.description, u.name AS assignee, t.assignee_id, t.priority, t.deadline, t.status
        FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id
        ${canManage ? "" : "WHERE t.assignee_id = ?"}
        ORDER BY CASE t.status WHEN 'completed' THEN 1 ELSE 0 END, t.deadline
      `).all(...(canManage ? [] : [user.id]));
    case "project-management":
      return db.prepare(`
        SELECT p.id, p.project_id, p.name, u.name AS manager, p.priority, p.start_date, p.end_date, p.budget, p.status
        FROM projects p LEFT JOIN users u ON u.id = p.manager_id
        ${canManage ? "" : "JOIN project_members pm ON pm.project_id = p.id WHERE pm.user_id = ?"}
        ORDER BY p.created_at DESC
      `).all(...(canManage ? [] : [user.id]));
    case "recruitment":
      return db.prepare(`
        SELECT j.id, j.title, j.department, j.employment_type, j.application_deadline,
          (SELECT count(*) FROM job_applications a WHERE a.vacancy_id = j.id) AS application_count,
          j.status
        FROM job_vacancies j ORDER BY j.created_at DESC
      `).all();
    case "applications":
      return db.prepare(`
        SELECT a.id, a.name, a.email, a.phone, a.resume_url, j.title AS position, date(a.application_date) AS application_date, a.status
        FROM job_applications a JOIN job_vacancies j ON j.id = a.vacancy_id
        ORDER BY a.application_date DESC
      `).all();
    case "onboarding":
      return db.prepare(`
        SELECT o.id, u.name AS employee, o.department_assigned, o.manager_assigned,
          CASE o.document_verified WHEN 1 THEN 'Verified' ELSE 'Pending' END AS document_verified,
          CASE o.account_created WHEN 1 THEN 'Created' ELSE 'Pending' END AS account_created,
          CASE o.hardware_ready WHEN 1 THEN 'Ready' ELSE 'Pending' END AS hardware_ready,
          CASE o.email_setup WHEN 1 THEN 'Set up' ELSE 'Pending' END AS email_setup,
          CASE o.orientation_complete WHEN 1 THEN 'Done' ELSE 'Pending' END AS orientation_complete,
          CASE o.manager_intro_complete WHEN 1 THEN 'Done' ELSE 'Pending' END AS manager_intro_complete,
          o.status
        FROM onboarding_records o JOIN users u ON u.id = o.user_id
        ORDER BY o.created_at DESC
      `).all();
    case "offboarding":
      return db.prepare(`
        SELECT o.id, u.name AS employee, o.resignation_date, o.asset_return_status,
          CASE o.knowledge_transfer_complete WHEN 1 THEN 'Done' ELSE 'Pending' END AS knowledge_transfer_complete,
          CASE o.exit_interview_complete WHEN 1 THEN 'Done' ELSE 'Pending' END AS exit_interview_complete,
          CASE o.account_deactivated WHEN 1 THEN 'Deactivated' ELSE 'Active' END AS account_deactivated,
          o.final_status
        FROM offboarding_records o JOIN users u ON u.id = o.user_id
        ORDER BY o.created_at DESC
      `).all();
    case "feedback":
      return db.prepare(`
        SELECT f.id, f.category, f.message,
          CASE WHEN f.is_anonymous = 1 THEN 'Anonymous' ELSE coalesce(u.name, 'Former employee') END AS submitter,
          f.created_at, f.management_response, f.status, f.submitter_id
        FROM employee_feedback f LEFT JOIN users u ON u.id = f.submitter_id
        ${canManage ? "" : "WHERE f.submitter_id = ?"}
        ORDER BY f.created_at DESC
      `).all(...(canManage ? [] : [user.id]));
    case "reports":
      return db.prepare(`
        SELECT 'Active employees' AS metric,
          (SELECT count(*) FROM employee_profiles ep JOIN users u ON u.id = ep.user_id WHERE ep.employment_status = 'active' AND u.status = 'active') AS value,
          'Current active workforce' AS context
        UNION ALL SELECT 'Present today',
          (SELECT count(DISTINCT user_id) FROM attendance WHERE date(check_in) = date('now', 'localtime')),
          'Unique employees checked in today'
        UNION ALL SELECT 'Pending leave requests',
          (SELECT count(*) FROM leave_requests WHERE status IN ('pending', 'manager_approved')),
          'Awaiting manager or CEO review'
        UNION ALL SELECT 'Open applications',
          (SELECT count(*) FROM job_applications WHERE status NOT IN ('hired', 'rejected')),
          'Candidates in the hiring pipeline'
        UNION ALL SELECT 'Active projects',
          (SELECT count(*) FROM projects WHERE status IN ('active', 'in_progress')),
          'Currently active or in progress'
        UNION ALL SELECT 'Tasks completed',
          (SELECT count(*) FROM tasks WHERE status = 'completed'),
          'Completed task records'
      `).all();
    case "notifications":
      return db.prepare(`
        SELECT id, title, message, type, created_at, is_read
        FROM notifications WHERE user_id = ? OR user_id IS NULL
        ORDER BY is_read ASC, created_at DESC LIMIT 100
      `).all(user.id);
    case "settings":
      return db.prepare(`
        SELECT al.id, al.created_at, coalesce(u.name, 'System') AS actor, al.action,
          al.entity_type, al.details
        FROM audit_logs al LEFT JOIN users u ON u.id = al.user_id
        UNION ALL
        SELECT ci.id, ci.created_at, 'External contact: ' || ci.name AS actor,
          'contact.inquiry_received' AS action, 'contact_inquiry' AS entity_type,
          'Email: ' || ci.email || CASE WHEN ci.company IS NOT NULL THEN ' | Company: ' || ci.company ELSE '' END ||
          ' | Message: ' || ci.message AS details
        FROM contact_inquiries ci
        ORDER BY created_at DESC LIMIT 100
      `).all();
  }
}
