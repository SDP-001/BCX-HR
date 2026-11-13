import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "bytecodx.db");
export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_id INTEGER NOT NULL,
      permission_id INTEGER NOT NULL,
      UNIQUE(role_id, permission_id),
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
      FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      session_version INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login TEXT,
      FOREIGN KEY (role_id) REFERENCES roles(id)
    );

    CREATE TABLE IF NOT EXISTS user_login_aliases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      alias TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS employee_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      employee_id TEXT NOT NULL UNIQUE,
      department_id INTEGER,
      designation TEXT,
      joining_date TEXT,
      manager_id INTEGER,
      address TEXT,
      emergency_contact TEXT,
      avatar_url TEXT,
      employment_status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (manager_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      check_in TEXT,
      check_out TEXT,
      status TEXT NOT NULL DEFAULT 'present',
      working_hours REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      leave_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      reason TEXT NOT NULL,
      document_url TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      manager_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (manager_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS leave_balances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      casual INTEGER NOT NULL DEFAULT 12,
      sick INTEGER NOT NULL DEFAULT 10,
      earned INTEGER NOT NULL DEFAULT 8,
      emergency INTEGER NOT NULL DEFAULT 4,
      other INTEGER NOT NULL DEFAULT 2,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      assignee_id INTEGER,
      department TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'not_started',
      start_date TEXT,
      deadline TEXT,
      estimated_hours REAL,
      attachment_url TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignee_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS task_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      manager_id INTEGER,
      start_date TEXT,
      end_date TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'active',
      budget TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS project_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role_name TEXT,
      UNIQUE(project_id, user_id),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      due_date TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS job_vacancies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      department TEXT NOT NULL,
      description TEXT NOT NULL,
      required_skills TEXT,
      experience TEXT,
      employment_type TEXT,
      application_deadline TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS job_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vacancy_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      resume_url TEXT,
      applied_position TEXT,
      status TEXT NOT NULL DEFAULT 'applied',
      interview_feedback TEXT,
      application_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vacancy_id) REFERENCES job_vacancies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS onboarding_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      document_submission TEXT,
      document_verified INTEGER DEFAULT 0,
      account_created INTEGER DEFAULT 0,
      department_assigned TEXT,
      manager_assigned TEXT,
      initial_tasks TEXT,
      joining_confirmation TEXT,
      status TEXT NOT NULL DEFAULT 'in_progress',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS offboarding_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      resignation_date TEXT,
      exit_interview TEXT,
      pending_tasks TEXT,
      asset_return_status TEXT,
      account_deactivated INTEGER DEFAULT 0,
      final_status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS employee_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submitter_id INTEGER,
      category TEXT,
      message TEXT NOT NULL,
      is_anonymous INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'new',
      management_response TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (submitter_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS contact_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS password_reset_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      request_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      reset_status TEXT NOT NULL DEFAULT 'requested',
      reset_time TEXT,
      notified_ceo INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  const ensureColumn = (table: string, column: string, definition: string) => {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (!columns.some((entry) => entry.name === column)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  };
  ensureColumn("users", "session_version", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("password_reset_events", "expires_at", "TEXT");
  ensureColumn("onboarding_records", "hardware_ready", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("onboarding_records", "email_setup", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("onboarding_records", "orientation_complete", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("onboarding_records", "manager_intro_complete", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("offboarding_records", "knowledge_transfer_complete", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("offboarding_records", "exit_interview_complete", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("leave_requests", "manager_approved_by", "INTEGER REFERENCES users(id)");
  ensureColumn("leave_requests", "manager_approved_at", "TEXT");
  ensureColumn("leave_requests", "ceo_approved_by", "INTEGER REFERENCES users(id)");
  ensureColumn("leave_requests", "ceo_approved_at", "TEXT");

  const roleCount = db.prepare("SELECT COUNT(*) as count FROM roles").get() as { count: number };
  if (roleCount.count === 0) {
    db.exec(`
      INSERT OR IGNORE INTO roles (name, description) VALUES
        ('CEO', 'Main Administrator'),
        ('CTO', 'Technology Management'),
        ('COO', 'Operations Management'),
        ('CSO', 'Strategy Management'),
        ('CMO', 'Marketing Management'),
        ('Employee', 'Employee self-service account');
    `);
  }

  const cmpRole = db.prepare("SELECT id FROM roles WHERE name = 'CMP'").get() as { id: number } | undefined;
  const cmoRole = db.prepare("SELECT id FROM roles WHERE name = 'CMO'").get() as { id: number } | undefined;
  if (cmpRole && cmoRole) {
    const mergeLegacyCmoRole = db.transaction(() => {
      db.prepare("UPDATE users SET role_id = ? WHERE role_id = ?").run(cmoRole.id, cmpRole.id);
      db.prepare(`
        INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
        SELECT ?, permission_id FROM role_permissions WHERE role_id = ?
      `).run(cmoRole.id, cmpRole.id);
      db.prepare("DELETE FROM role_permissions WHERE role_id = ?").run(cmpRole.id);
      db.prepare("DELETE FROM roles WHERE id = ?").run(cmpRole.id);
    });
    mergeLegacyCmoRole();
  } else if (cmpRole) {
    db.prepare("UPDATE roles SET name = 'CMO', description = 'Marketing Management' WHERE id = ?").run(cmpRole.id);
  }
  db.prepare("INSERT OR IGNORE INTO roles (name, description) VALUES ('CMO', 'Marketing Management'), ('Employee', 'Employee self-service account')").run();

  const permissionCount = db.prepare("SELECT COUNT(*) as count FROM permissions").get() as { count: number };
  if (permissionCount.count === 0) {
    db.exec(`
      INSERT OR IGNORE INTO permissions (name, description) VALUES
        ('employee.manage', 'Manage employee records'),
        ('attendance.manage', 'View and update attendance'),
        ('leave.manage', 'Manage leave approvals and policies'),
        ('task.manage', 'Assign and monitor tasks'),
        ('project.manage', 'Manage projects and milestones'),
        ('report.view', 'View company reports'),
        ('recruitment.manage', 'Manage hiring and applications'),
        ('feedback.manage', 'Manage employee feedback'),
        ('settings.manage', 'Manage system settings');
    `);

    const roleRows = db.prepare("SELECT id, name FROM roles").all() as { id: number; name: string }[];
    const permissionRows = db.prepare("SELECT id, name FROM permissions").all() as { id: number; name: string }[];
    const map = new Map<string, number>();
    for (const row of permissionRows) map.set(row.name, row.id);

    const grant = db.prepare("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)");
    for (const role of roleRows) {
      const permissions = role.name === "CEO"
        ? Object.values(map)
        : role.name === "CTO"
          ? [map.get("task.manage"), map.get("project.manage"), map.get("report.view"), map.get("employee.manage")]
          : role.name === "COO"
            ? [map.get("attendance.manage"), map.get("leave.manage"), map.get("report.view")]
            : role.name === "CSO"
              ? [map.get("project.manage"), map.get("report.view")]
              : role.name === "CMO"
                ? [map.get("recruitment.manage"), map.get("report.view")]
                : [];

      for (const permissionId of permissions) {
        if (permissionId) grant.run(role.id, permissionId);
      }
    }
  }

  db.prepare("INSERT OR IGNORE INTO permissions (name, description) VALUES ('feedback.manage', 'Manage employee feedback')").run();
  db.prepare(`
    INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
    WHERE r.name = 'CEO'
  `).run();
  db.prepare("DELETE FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE name = 'CMO')").run();
  const permissions = db.prepare("SELECT id, name FROM permissions").all() as { id: number; name: string }[];
  const permissionMap = new Map(permissions.map(({ id, name }) => [name, id]));
  const roleGrants: Record<string, string[]> = {
    CTO: ["task.manage", "project.manage", "report.view", "employee.manage"],
    COO: ["attendance.manage", "leave.manage", "report.view"],
    CSO: ["project.manage", "report.view"],
    CMO: ["employee.manage", "recruitment.manage", "report.view", "feedback.manage"],
  };
  const grantPermission = db.prepare("INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)");
  const roleRows = db.prepare("SELECT id, name FROM roles").all() as { id: number; name: string }[];
  for (const role of roleRows) {
    const names = role.name === "CEO" ? permissions.map(({ name }) => name) : roleGrants[role.name] ?? [];
    for (const name of names) {
      const permissionId = permissionMap.get(name);
      if (permissionId) grantPermission.run(role.id, permissionId);
    }
  }

  const departmentCount = db.prepare("SELECT COUNT(*) as count FROM departments").get() as { count: number };
  if (departmentCount.count === 0) {
    db.exec(`
      INSERT OR IGNORE INTO departments (name, description) VALUES
        ('Engineering', 'Technology and product teams'),
        ('Operations', 'Delivery and workflow operations'),
        ('Human Resources', 'People, hiring, and policy'),
        ('Finance', 'Accounting and financial operations'),
        ('Strategy', 'Planning and executive initiatives');
    `);
  }
  db.prepare("INSERT OR IGNORE INTO departments (name, description) VALUES ('Marketing', 'Brand, communications, and growth')").run();
  db.prepare("INSERT OR IGNORE INTO departments (name, description) VALUES ('Executive', 'Executive leadership and governance'), ('HR/People', 'People operations and employee experience')").run();

  const executiveAccounts = [
    { oldEmail: "ceo@bytecodx.io", email: "ceo@bytecodx.com", oldPhone: "+91 90000 00001", phone: "+91 9876543210" },
    { oldEmail: "cto@bytecodx.io", email: "cto@bytecodx.com", oldPhone: "+91 90000 00002", phone: "+91 9876543211" },
    { oldEmail: "coo@bytecodx.io", email: "coo@bytecodx.com", oldPhone: "+91 90000 00003", phone: "+91 9876543212" },
    { oldEmail: "cso@bytecodx.io", email: "cso@bytecodx.com", oldPhone: "+91 90000 00004", phone: "+91 9876543213" },
    { oldEmail: "cmp@bytecodx.io", email: "cmo@bytecodx.com", oldPhone: "+91 90000 00005", phone: "+91 9876543214" },
  ];
  const addLoginAlias = db.prepare(`
    INSERT OR IGNORE INTO user_login_aliases (user_id, alias)
    SELECT id, ? FROM users WHERE email = ?
  `);
  const migrateExecutive = db.prepare(`
    UPDATE users SET email = ?, phone = ?
    WHERE email = ? AND NOT EXISTS (SELECT 1 FROM users existing WHERE existing.email = ? AND existing.id != users.id)
  `);
  for (const account of executiveAccounts) {
    addLoginAlias.run(account.oldEmail, account.oldEmail);
    addLoginAlias.run(account.oldPhone, account.oldEmail);
    migrateExecutive.run(account.email, account.phone, account.oldEmail, account.email);
  }
  db.prepare(`
    INSERT OR IGNORE INTO user_login_aliases (user_id, alias)
    SELECT id, 'cmp@bytecodx.com' FROM users WHERE email = 'cmp@bytecodx.com'
  `).run();
  db.prepare(`
    UPDATE users SET email = 'cmo@bytecodx.com'
    WHERE email = 'cmp@bytecodx.com'
      AND NOT EXISTS (SELECT 1 FROM users existing WHERE existing.email = 'cmo@bytecodx.com' AND existing.id != users.id)
  `).run();
}

initializeSchema();

export type DbUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  role_id: number;
  status: string;
  created_at: string;
  last_login: string | null;
};
