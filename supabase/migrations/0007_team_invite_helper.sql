-- ============================================================================
-- Suporte a convite de usuários: como a v1 não integra um serviço de e-mail
-- transacional, o fluxo é "peça para a pessoa criar conta em /cadastro e
-- depois adicione-a pelo e-mail". Esta função permite que um owner/admin
-- localize o perfil de um usuário já cadastrado pelo e-mail, sem expor a
-- tabela profiles inteira via RLS (que só permite ver colegas da mesma
-- organização).
-- ============================================================================

create or replace function public.find_user_by_email(p_email text)
returns table (id uuid, nome text, email text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.nome, p.email
  from public.profiles p
  where lower(p.email) = lower(p_email)
  limit 1;
$$;

revoke execute on function public.find_user_by_email(text) from public, anon;
grant execute on function public.find_user_by_email(text) to authenticated;
