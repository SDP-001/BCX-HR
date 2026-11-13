import nodemailer from "nodemailer";

type MailSettings = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
};

export function getMailSettings(): MailSettings | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) return null;
  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("SMTP_PORT must be a valid TCP port.");
  return {
    host: SMTP_HOST,
    port,
    secure: port === 465,
    user: SMTP_USER,
    password: SMTP_PASSWORD,
    from: SMTP_FROM,
  };
}

export async function sendPasswordResetEmail(email: string, name: string, resetUrl: string) {
  const settings = getMailSettings();
  if (!settings) throw new Error("Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM to send recovery email.");
  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: { user: settings.user, pass: settings.password },
  });
  await transporter.sendMail({
    from: settings.from,
    to: email,
    subject: "Reset your ByteCodX password",
    text: `Hello ${name},\n\nUse the secure link below to reset your ByteCodX password. It expires in 30 minutes.\n\n${resetUrl}\n\nIf you did not request this, you can ignore this message.`,
  });
}
