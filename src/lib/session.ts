// Edge-safe session helpers (used by middleware and server code).
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "hq_session";
export const SESSION_DAYS = 30;

export type SessionPayload = { uid: string; role: "CUSTOMER" | "ADMIN"; name: string };

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set (16+ chars)");
    return new TextEncoder().encode("dev-only-insecure-secret-change-me");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(p: SessionPayload) {
  return new SignJWT(p)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (typeof payload.uid !== "string") return null;
    return { uid: payload.uid, role: payload.role === "ADMIN" ? "ADMIN" : "CUSTOMER", name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}
