import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthShell } from "@/components/store/AuthShell";
import { LoginForm } from "@/components/store/AuthForms";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "" } = await searchParams;
  const s = await getSession();
  if (s) redirect(next.startsWith("/") ? next : s.role === "ADMIN" ? "/admin" : "/account");
  return (
    <AuthShell eyebrow="Welcome back" title="Log in to your account">
      <LoginForm next={next} />
    </AuthShell>
  );
}
