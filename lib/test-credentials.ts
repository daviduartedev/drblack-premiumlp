import type { TestCredential } from "@/lib/ruby-safira-types";

export const TEST_CREDENTIALS: Record<string, TestCredential> = {
  customer: { email: "cliente@drblack.local", password: "cliente123" },
  admin: { email: "admin@drblack.local", password: "admin123" },
};
