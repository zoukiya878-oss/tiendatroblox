import nodemailer from "nodemailer";
import type { EmailProvider } from "./types";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT) || 1025,
  secure: false,
});

// ponytail: dev-only Mailpit SMTP, swap for Resend when going to production.
export const DevelopmentEmailProvider: EmailProvider = {
  async send(to, subject, html) {
    await transport.sendMail({ from: "no-reply@tiendatroblox.local", to, subject, html });
  },
};

export const emailProvider = DevelopmentEmailProvider;
