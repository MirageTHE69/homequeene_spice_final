import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AuthShell } from "@/components/store/AuthShell";
import { RegisterForm } from "@/components/store/AuthForms";

export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "" } = await searchParams;
  if (await getSession()) redirect("/account");
  return (
    <AuthShell eyebrow="New here" title="Create your account">
      <RegisterForm next={next} />
    </AuthShell>
  );
}
