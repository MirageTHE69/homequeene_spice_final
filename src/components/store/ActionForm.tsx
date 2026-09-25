"use client";

import { useActionState, useEffect, useRef } from "react";
import type { FormState } from "@/app/actions/auth";

/** A <form> bound to a server action that shows success/error and resets on success. */
export function ActionForm({
  action,
  children,
  className,
  style,
  resetOnSuccess = true,
  submitLabel,
  submitClass = "btn btn-red",
  submitStyle,
  pendingLabel = "Sending…",
  dark = false,
}: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  resetOnSuccess?: boolean;
  submitLabel: string;
  submitClass?: string;
  submitStyle?: React.CSSProperties;
  pendingLabel?: string;
  dark?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={ref} action={formAction} className={className ?? "form-grid"} style={style}>
      {children}
      {state?.error && (
        <div className="alert alert-err" role="alert">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="alert alert-ok" role="status" style={dark ? { background: "rgba(22,125,78,.25)", color: "#FFFBF4", borderColor: "rgba(255,251,244,.3)" } : undefined}>
          {state.ok}
        </div>
      )}
      <button type="submit" className={submitClass} style={submitStyle} disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
