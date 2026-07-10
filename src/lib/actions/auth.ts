"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CURRENT_TERMS_VERSION } from "@/lib/legal/constants";

export type ActionState = { error?: string } | undefined;

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/dashboard");

  if (!email || !password) return { error: "Informe e-mail e senha." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  redirect(redirectTo || "/dashboard");
}

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const termosAceitos = formData.get("termos") === "on";

  if (!nome || !email || !password) return { error: "Preencha todos os campos." };
  if (password.length < 8) return { error: "A senha deve ter ao menos 8 caracteres." };
  if (!termosAceitos) return { error: "É necessário aceitar os Termos de Uso e a Política de Privacidade." };

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome,
        termos_aceitos_em: new Date().toISOString(),
        termos_versao: CURRENT_TERMS_VERSION,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  if (data.session) {
    redirect("/onboarding");
  }

  redirect("/cadastro/confirme");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
