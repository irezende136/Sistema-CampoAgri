-- ============================================================================
-- Ajusta permissões de execução das funções auxiliares.
--
-- IMPORTANTE: is_platform_admin/is_org_member/is_org_admin/can_write_org/
-- user_role_in_org são usadas DENTRO das políticas de RLS e por isso PRECISAM
-- continuar executáveis pelo papel 'authenticated' (senão toda query autenticada
-- passaria a falhar com "permission denied for function" em vez de aplicar RLS).
-- Apenas revogamos de 'anon'/'public', já que usuários não autenticados nunca
-- devem consultar tabelas operacionais nesta aplicação.
--
-- Funções de trigger (handle_new_user, protect_last_owner, set_updated_at)
-- não são chamadas diretamente por nenhum papel — o Postgres as invoca
-- internamente ao disparar o trigger — então podem ter EXECUTE revogado de
-- todos os papéis de API sem quebrar nada.
-- ============================================================================

revoke execute on function public.is_platform_admin() from public, anon;
revoke execute on function public.user_role_in_org(uuid) from public, anon;
revoke execute on function public.is_org_member(uuid) from public, anon;
revoke execute on function public.is_org_admin(uuid) from public, anon;
revoke execute on function public.can_write_org(uuid) from public, anon;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_last_owner() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

revoke execute on function public.create_organization(text, text, text, text, text) from public, anon;
grant execute on function public.create_organization(text, text, text, text, text) to authenticated;

revoke execute on function public.log_action(uuid, text, text, uuid, jsonb) from public, anon;
grant execute on function public.log_action(uuid, text, text, uuid, jsonb) to authenticated;

alter function public.set_updated_at() set search_path = public;
