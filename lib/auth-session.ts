/**
 * Sessão de login simulada no cliente (placeholder até backend real).
 * sessionStorage primeiro; se falhar (quota / modo privado), usa localStorage.
 */

export const AUTH_SESSION_KEY = "dr.auth.session";
export const AUTH_JUST_LOGGED_IN_KEY = "dr.auth.justLoggedIn";

function storageSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
    return;
  } catch {
    /* */
  }
  try {
    localStorage.setItem(key, value);
  } catch {
    /* */
  }
}

function storageGet(key: string): string | null {
  try {
    const s = sessionStorage.getItem(key);
    if (s != null) return s;
  } catch {
    /* */
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageRemove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* */
  }
  try {
    localStorage.removeItem(key);
  } catch {
    /* */
  }
}

export function markLoggedIn(): void {
  if (typeof window === "undefined") return;
  storageSet(AUTH_SESSION_KEY, "1");
  storageSet(AUTH_JUST_LOGGED_IN_KEY, "1");
}

export function clearJustLoggedIn(): void {
  if (typeof window === "undefined") return;
  storageRemove(AUTH_JUST_LOGGED_IN_KEY);
}

export function hasJustLoggedInFlag(): boolean {
  if (typeof window === "undefined") return false;
  return storageGet(AUTH_JUST_LOGGED_IN_KEY) === "1";
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return storageGet(AUTH_SESSION_KEY) === "1";
}

export function logout(): void {
  if (typeof window === "undefined") return;
  storageRemove(AUTH_SESSION_KEY);
  storageRemove(AUTH_JUST_LOGGED_IN_KEY);
}
