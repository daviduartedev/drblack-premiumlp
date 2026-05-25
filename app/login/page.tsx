import { isSupabaseConfigured } from "@/lib/supabase/env";
import LoginForm from "@/app/login/LoginForm";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : {};
  return (
    <LoginForm
      useSupabase={isSupabaseConfigured()}
      errorCode={params.error}
    />
  );
}
