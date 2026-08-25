"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { CURRENT_TERMS_VERSION } from "@/lib/legal/constants";

export type ActionState = { error?: string } | undefined;

/**
 * URL pública do app, derivada do próprio pedido.
 *
 * Depender só de NEXT_PUBLIC_SITE_URL é frágil: se a variável não estiver
 * configurada no ambiente, o código cai em localhost silenciosamente e os links
 * de confirmação de e-mail e de redefinição de senha chegam ao usuário
 * apontando para a máquina dele. Lendo o host do pedido, o link sempre aponta
 * para o domínio de onde o app foi realmente acessado.
 */
async function origemDoApp(): Promise<string> {
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const protocolo = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
      return `${protocolo}://${host}`;
    }
  } catch {
    // Fora de um contexto de requisição: cai para a variável de ambiente.
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

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
  const origin = await origemDoApp();

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

export async function requestPasswordReset(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Informe seu e-mail." };

  const supabase = await createClient();
  const origin = await origemDoApp();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/redefinir-senha`,
  });

  // Sempre seguimos para a mesma tela, mesmo se o e-mail não existir: revelar
  // isso permitiria descobrir quais e-mails têm conta no sistema.
  redirect("/esqueci-senha/enviado");
}

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmacao = String(formData.get("password_confirm") ?? "");

  if (password.length < 8) return { error: "A senha deve ter ao menos 8 caracteres." };
  if (password !== confirmacao) return { error: "As senhas não conferem." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Link inválido ou expirado. Solicite um novo link de redefinição." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
