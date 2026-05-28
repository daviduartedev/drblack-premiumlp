import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateSkinImageUrl } from "@/lib/ruby-safira-repository";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const skinId = String(formData.get("skinId") ?? "").trim();

  if (!(file instanceof File) || !skinId) {
    return NextResponse.json({ error: "Arquivo ou skinId invalido" }, { status: 400 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob nao configurado (BLOB_READ_WRITE_TOKEN)" },
      { status: 503 }
    );
  }

  const blob = await put(`skins/${skinId}/${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  const ok = await updateSkinImageUrl(skinId, blob.url);
  if (!ok) {
    return NextResponse.json({ error: "Falha ao atualizar skin" }, { status: 500 });
  }

  revalidatePath("/admin");
  revalidatePath("/loja");
  revalidatePath("/");

  return NextResponse.json({ url: blob.url });
}
