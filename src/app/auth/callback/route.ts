import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Só aceitamos caminhos internos como destino. Sem isso, um link forjado com
// ?next=https://site-malicioso poderia usar nosso domínio para redirecionar.
function safeNext(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next ?? "/onboarding"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
