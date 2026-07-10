-- ============================================================================
-- Aceite de Termos de Uso e Política de Privacidade (LGPD / CDC).
-- Guardamos quando e qual versão dos termos cada usuário aceitou. No
-- cadastro, o aceite (marcado no checkbox) vem em raw_user_meta_data e é
-- copiado para profiles pela trigger handle_new_user. Usuários que ainda não
-- aceitaram a versão vigente são redirecionados para /termos/aceitar antes
-- de usar o sistema (ver requireTermsAccepted em src/lib/auth/context.ts).
-- ============================================================================

alter table public.profiles
  add column termos_aceitos_em timestamptz,
  add column termos_versao text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email, termos_aceitos_em, termos_versao)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    nullif(new.raw_user_meta_data->>'termos_aceitos_em', '')::timestamptz,
    new.raw_user_meta_data->>'termos_versao'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
