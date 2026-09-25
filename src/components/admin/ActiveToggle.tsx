"use client";

import { useOptimistic, useTransition } from "react";
import { setProductActive } from "@/app/actions/admin";

export function ActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [on, setOn] = useOptimistic(active);
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={on ? "Live — click to hide" : "Hidden — click to publish"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          setOn(!on);
          await setProductActive(id, !on);
        })
      }
      style={{ width: 44, height: 24, border: 0, borderRadius: 999, background: on ? "#167D4E" : "#CFC6BA", position: "relative", padding: 0, transition: "background .15s" }}
    >
      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
    </button>
  );
}
