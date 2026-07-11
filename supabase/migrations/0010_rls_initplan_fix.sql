-- Corrige o advisory de performance auth_rls_initplan: substitui chamadas
-- diretas a auth.uid() por (select auth.uid()) nas políticas de profiles e
-- organization_users, permitindo que o Postgres avalie a função uma única
-- vez por statement (initplan) em vez de reavaliar a cada linha.

drop policy if exists org_users_select on public.organization_users;
create policy org_users_select on public.organization_users
  for select
  using (
    (user_id = (select auth.uid()))
    or is_org_member(organization_id)
    or is_platform_admin()
  );

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert
  with check (id = (select auth.uid()));

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update
  using (
    (id = (select auth.uid()))
    or is_platform_admin()
  );

drop policy if exists profiles_select_self_or_org on public.profiles;
create policy profiles_select_self_or_org on public.profiles
  for select
  using (
    (id = (select auth.uid()))
    or is_platform_admin()
    or exists (
      select 1
      from organization_users me
      join organization_users them on them.organization_id = me.organization_id
      where me.user_id = (select auth.uid())
        and me.status = 'ativo'
        and them.user_id = profiles.id
        and them.status = 'ativo'
    )
  );
