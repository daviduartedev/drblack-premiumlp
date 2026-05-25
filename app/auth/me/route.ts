import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/ruby-safira-repository";

export async function GET() {
  const user = await getCurrentProfile();
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    role: user.role,
    email: user.email,
  });
}
