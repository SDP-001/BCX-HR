import bcrypt from "bcryptjs";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

const sessionSecret =
  process.env.SESSION_SECRET ??
  (process.env.NODE_ENV === "production"
    ? ""
    : createHash("sha256")
        .update(`bytecodx-local-session:${process.env.INITIAL_ADMIN_PASSWORD ?? "ByteCodx@2025!"}`)
        .digest("hex"));

function signSession(value: string) {
  if (!sessionSecret) throw new Error("SESSION_SECRET must be configured in production.");
  return createHmac("sha256", sessionSecret).update(value).digest("hex");
}

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  roleId: number;
  status: string;
  sessionVersion: number;
};

export function getUserById(userId: number) {
  const user = db
    .prepare(
      `
        SELECT u.id, u.name, u.email, u.phone, u.status, u.role_id, u.session_version, r.name as role
        FROM users u
        JOIN roles r ON r.id = u.role_id
        WHERE u.id = ?
      `
    )
    .get(userId) as
    | { id: number; name: string; email: string; phone: string; status: string; role_id: number; session_version: number; role: string }
    | undefined;

  if (!user) return undefined;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    status: user.status,
    roleId: user.role_id,
    role: user.role,
    sessionVersion: user.session_version,
  } satisfies SessionUser;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("bytecodx_token")?.value;
  if (!session) return null;

  const [userIdPart, expiresPart, versionPart, signature, extra] = session.split(".");
  if (!userIdPart || !expiresPart || !versionPart || !signature || extra !== undefined) return null;
  const userId = Number(userIdPart);
  const expiresAt = Number(expiresPart);
  const sessionVersion = Number(versionPart);
  if (!Number.isSafeInteger(userId) || userId < 1 || !Number.isSafeInteger(expiresAt) || expiresAt <= Date.now() ||
      !Number.isSafeInteger(sessionVersion) || sessionVersion < 0) return null;
  try {
    const expected = Buffer.from(signSession(`${userIdPart}.${expiresPart}.${versionPart}`), "hex");
    const actual = Buffer.from(signature, "hex");
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const user = getUserById(userId);
    return user?.status === "active" && user.sessionVersion === sessionVersion ? user : null;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export async function setSessionCookie(userId: number, rememberMe = false) {
  const cookieStore = await cookies();
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8;
  const expiresAt = Date.now() + maxAge * 1000;
  const user = db.prepare("SELECT session_version FROM users WHERE id = ? AND status = 'active'").get(userId) as { session_version: number } | undefined;
  if (!user) throw new Error("An active account is required to start a session.");
  const value = `${userId}.${expiresAt}.${user.session_version}`;
  cookieStore.set("bytecodx_token", `${value}.${signSession(value)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set("bytecodx_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export function seedExecutives() {
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (Number(totalUsers.count) === 0 && process.env.NODE_ENV === "production" && !process.env.INITIAL_ADMIN_PASSWORD) {
    throw new Error("Set INITIAL_ADMIN_PASSWORD before initializing executive accounts in production.");
  }
  const initialPassword = process.env.INITIAL_ADMIN_PASSWORD ?? "ByteCodx@2025!";
  const executivePortraits: Record<string, string> = {
    "ceo@bytecodx.com": "/team/joel-kirubainathan.jpeg",
    "cto@bytecodx.com": "/team/poovarasan.jpeg",
    "coo@bytecodx.com": "/team/dharun.jpeg",
    "cso@bytecodx.com": "/team/sugasini.jpeg",
    "cmo@bytecodx.com": "/team/sri-abinaya.jpeg",
  };
  for (const [email, avatarUrl] of Object.entries(executivePortraits)) {
    db.prepare(`
      UPDATE employee_profiles SET avatar_url = ?
      WHERE user_id = (SELECT id FROM users WHERE email = ?)
    `).run(avatarUrl, email);
  }
  db.prepare(`
    UPDATE employee_profiles SET designation = 'CMO',
      department_id = (SELECT id FROM departments WHERE name = 'Marketing')
    WHERE user_id = (SELECT id FROM users WHERE email = 'cmo@bytecodx.com')
  `).run();

  if (Number(totalUsers.count) > 0) return;

  const roleRows = db.prepare("SELECT id, name FROM roles").all() as { id: number; name: string }[];
  const roleMap = new Map(roleRows.map((role) => [role.name, role.id]));

  const users = [
    { name: "JOEL KIRUBAINATHAN", email: "ceo@bytecodx.com", phone: "+91 9876543210", role: "CEO" },
    { name: "POOVARASAN", email: "cto@bytecodx.com", phone: "+91 9876543211", role: "CTO" },
    { name: "DHARUN", email: "coo@bytecodx.com", phone: "+91 9876543212", role: "COO" },
    { name: "SUGASINI", email: "cso@bytecodx.com", phone: "+91 9876543213", role: "CSO" },
    { name: "SRI ABINAYA", email: "cmo@bytecodx.com", phone: "+91 9876543214", role: "CMO" },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, phone, password_hash, role_id, status)
    VALUES (?, ?, ?, ?, ?, 'active')
  `);

  const insertProfile = db.prepare(`
    INSERT INTO employee_profiles (user_id, employee_id, department_id, designation, joining_date, address, emergency_contact, avatar_url, employment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `);

  const departments = db.prepare("SELECT id, name FROM departments").all() as { id: number; name: string }[];
  const departmentMap = new Map(departments.map((department) => [department.name, department.id]));

  const defaultDepartmentMap: Record<string, string> = {
    CEO: "Human Resources",
    CTO: "Engineering",
    COO: "Operations",
    CSO: "Strategy",
    CMO: "Marketing",
  };

  for (const user of users) {
    const roleId = roleMap.get(user.role);
    if (!roleId) continue;

    const userId = Number(
      insertUser.run(
        user.name,
        user.email,
        user.phone,
        hashPassword(initialPassword),
        roleId
      ).lastInsertRowid
    );

    const departmentName = defaultDepartmentMap[user.role] ?? "Human Resources";
    const departmentId = departmentMap.get(departmentName) ?? 1;

    insertProfile.run(
      userId,
      `BCX-${String(userId).padStart(4, "0")}`,
      departmentId,
      user.role,
      new Date().toISOString().slice(0, 10),
      "ByteCodX Corporate Office",
      "+91 90000 00099",
      executivePortraits[user.email],
    );
  }

  db.prepare(`
    INSERT INTO audit_logs (user_id, action, entity_type, details)
    VALUES (?, 'seed', 'system', 'Initial executive accounts provisioned.')
  `).run(1);
}

export function logAudit(action: string, userId: number | null, entityType?: string, entityId?: number, details?: string) {
  db.prepare(
    `
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
      VALUES (?, ?, ?, ?, ?)
    `
  ).run(userId, action, entityType ?? null, entityId ?? null, details ?? null);
}

export function getDashboardStats(userId?: number) {
  const totalEmployees = db.prepare(`
    SELECT COUNT(*) as count FROM employee_profiles ep JOIN users u ON u.id = ep.user_id
    WHERE ep.employment_status = 'active' AND u.status = 'active'
  `).get() as { count: number };
  const presentToday = db.prepare(`
    SELECT COUNT(DISTINCT user_id) as count FROM attendance
    WHERE date(check_in, 'localtime') = date('now', 'localtime')
  `).get() as { count: number };
  const pendingTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status != 'completed'").get() as { count: number };
  const activeProjects = db.prepare("SELECT COUNT(*) as count FROM projects WHERE status IN ('active', 'in_progress')").get() as { count: number };
  const pendingApplications = db.prepare("SELECT COUNT(*) as count FROM job_applications WHERE status IN ('applied', 'resume_screening', 'shortlisted')").get() as { count: number };
  const pendingLeaves = userId === undefined
    ? db.prepare("SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending'").get() as { count: number }
    : db.prepare(`
      SELECT COUNT(*) as count FROM leave_requests
      WHERE status = 'pending' OR (
        status = 'manager_approved' AND EXISTS (
          SELECT 1 FROM users u JOIN roles r ON r.id = u.role_id
          WHERE u.id = ? AND r.name = 'CEO'
        )
      )
    `).get(userId) as { count: number };
  const openVacancies = db.prepare("SELECT COUNT(*) as count FROM job_vacancies WHERE status = 'open'").get() as { count: number };
  const completedTasksRow = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status = 'completed'").get() as { count: number };
  const unreadNotifications = userId === undefined
    ? db.prepare("SELECT COUNT(*) as count FROM notifications WHERE is_read = 0").get() as { count: number }
    : db.prepare("SELECT COUNT(*) as count FROM notifications WHERE is_read = 0 AND (user_id = ? OR user_id IS NULL)").get(userId) as { count: number };

  return {
    totalEmployees: Number(totalEmployees.count),
    presentToday: Number(presentToday.count),
    absentToday: Math.max(Number(totalEmployees.count) - Number(presentToday.count), 0),
    pendingTasks: Number(pendingTasks.count),
    completedTasks: Number(completedTasksRow.count),
    activeProjects: Number(activeProjects.count),
    pendingApplications: Number(pendingApplications.count),
    pendingLeaves: Number(pendingLeaves.count),
    openVacancies: Number(openVacancies.count),
    attendanceRate: Number(totalEmployees.count) > 0
      ? Number(((Number(presentToday.count) / Number(totalEmployees.count)) * 100).toFixed(1))
      : 0,
    unreadNotifications: Number(unreadNotifications.count),
  };
}

export async function requireRole(...allowedRoles: string[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!allowedRoles.includes(user.role)) redirect("/portal");
  return user;
}

export async function ensureSeededSession() {
  seedExecutives();
  return await getCurrentUser();
}
