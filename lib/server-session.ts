import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getUserById } from "@/lib/ruby-safira-repository";
import type { User } from "@/lib/ruby-safira-types";

const SESSION_COOKIE = "drbs_session";
const DEV_ONLY_SECRET =
  "dev-only-drblackskins-local-session-secret-change-before-production";

type SessionPayload = {
  userId: string;
  issuedAt: number;
};

function getSessionSecret(): string {
  return process.env.DRBLACK_SESSION_SECRET ?? DEV_ONLY_SECRET;
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function verifySignature(value: string, signature: string): boolean {
  const expected = sign(value);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function createSessionToken(userId: string): string {
  const payload: SessionPayload = { userId, issuedAt: Date.now() };
  const body = encodeBase64Url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function parseSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature || !verifySignature(body, signature)) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(body)) as SessionPayload;
    if (!payload.userId || typeof payload.issuedAt !== "number") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = parseSessionToken(token);
  if (!payload) return null;
  return getUserById(payload.userId);
}
