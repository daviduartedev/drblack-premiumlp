"use server";

import { redirect } from "next/navigation";
import { TEST_CREDENTIALS } from "@/lib/ruby-safira-seed";
import { getUserByEmail } from "@/lib/ruby-safira-repository";
import { clearSessionCookie, setSessionCookie } from "@/lib/server-session";

export type LoginState = {
  message: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await getUserByEmail(email);
  const credential = Object.values(TEST_CREDENTIALS).find(
    (item) => item.email === email
  );

  if (!user || credential?.password !== password) {
    return {
      message: "Credenciais de teste invalidas. Use uma conta seedada.",
    };
  }

  await setSessionCookie(user.id);
  redirect(user.role === "admin" ? "/admin" : "/dashboard");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
