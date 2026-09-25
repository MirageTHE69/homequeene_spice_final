"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction } from "@/app/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="form-grid">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="field" required autoComplete="email" defaultValue={state?.fields?.email} />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="field" required autoComplete="current-password" />
      </div>
      {state?.error && <div className="alert alert-err" role="alert">{state.error}</div>}
      <button className="btn btn-red btn-lg" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </button>
      <div style={{ fontSize: 15, fontWeight: 600 }}>
        New to Home Queen? <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Create an account</Link>
      </div>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(registerAction, undefined);
  return (
    <form action={action} className="form-grid">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="name">Full name</label>
        <input id="name" name="name" className="field" required autoComplete="name" defaultValue={state?.fields?.name} />
      </div>
      <div className="two">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="field" required autoComplete="email" defaultValue={state?.fields?.email} />
        </div>
        <div>
          <label className="label" htmlFor="phone">Mobile</label>
          <input id="phone" name="phone" className="field" required inputMode="tel" autoComplete="tel" placeholder="10-digit number" defaultValue={state?.fields?.phone} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="field" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
      </div>
      {state?.error && <div className="alert alert-err" role="alert">{state.error}</div>}
      <button className="btn btn-red btn-lg" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <div style={{ fontSize: 15, fontWeight: 600 }}>
        Already have an account? <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Log in</Link>
      </div>
    </form>
  );
}
