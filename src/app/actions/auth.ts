"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";

export type FormState = { error?: string; ok?: string; fields?: Record<string, string> } | undefined;

function safeNext(n: FormDataEntryValue | null, fallback: string) {
  const s = typeof n === "string" ? n : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : fallback;
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  if (!email || !password) return { error: "Enter your email and password.", fields: { email } };

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "That email and password don't match.", fields: { email } };
  }
  if (user.blocked) return { error: "This account has been disabled. Please contact support.", fields: { email } };

  await createSession({ uid: user.id, role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER", name: user.name });
  redirect(safeNext(fd.get("next"), user.role === "ADMIN" ? "/admin" : "/account"));
}

const RegisterSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
  const raw = { name: String(fd.get("name") || ""), email: String(fd.get("email") || ""), phone: String(fd.get("phone") || "").replace(/\D/g, "").slice(-10), password: String(fd.get("password") || "") };
  const fields = { name: raw.name, email: raw.email, phone: raw.phone };
  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields };

  const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return { error: "An account with this email already exists. Try logging in.", fields };

  const user = await db.user.create({
    data: { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, passwordHash: await bcrypt.hash(parsed.data.password, 10) },
  });
  await createSession({ uid: user.id, role: "CUSTOMER", name: user.name });
  redirect(safeNext(fd.get("next"), "/account"));
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
