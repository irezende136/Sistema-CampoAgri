-- ============================================================================
-- Funções auxiliares para RLS e regras de negócio
-- Todas SECURITY DEFINER + search_path fixo para evitar recursão de RLS
-- e hijacking de search_path.
-- ============================================================================

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.platform_admins pa
    where pa.user_id = auth.uid() and pa.status = 'ativo'
  );
$$;

create or replace function public.user_role_in_org(org_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select ou.role from public.organization_users ou
  where ou.organization_id = org_id
    and ou.user_id = auth.uid()
    and ou.status = 'ativo'
  limit 1;
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_users ou
    where ou.organization_id = org_id
      and ou.user_id = auth.uid()
      and ou.status = 'ativo'
  );
$$;

create or replace function public.is_org_admin(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_users ou
    where ou.organization_id = org_id
      and ou.user_id = auth.uid()
      and ou.status = 'ativo'
      and ou.role in ('owner','admin')
  );
$$;

-- Membro ativo com permissão de escrita operacional (todos exceto viewer)
create or replace function public.can_write_org(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_users ou
    where ou.organization_id = org_id
      and ou.user_id = auth.uid()
      and ou.status = 'ativo'
      and ou.role <> 'viewer'
  );
$$;

-- ----------------------------------------------------------------------------
-- Criação de organização (bootstrap): cria org + primeiro usuário como owner.
-- Roda como owner da função (postgres, com BYPASSRLS) para permitir o
-- bootstrap sem abrir políticas de INSERT perigosas em organizations.
-- ----------------------------------------------------------------------------
create or replace function public.create_organization(
  p_nome text,
  p_email text default null,
  p_telefone text default null,
  p_cidade text default null,
  p_estado text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado';
  end if;

  insert into public.organizations (nome, email, telefone, cidade, estado)
  values (p_nome, p_email, p_telefone, p_cidade, p_estado)
  returning id into v_org_id;

  insert into public.organization_users (organization_id, user_id, role, status, data_entrada)
  values (v_org_id, auth.uid(), 'owner', 'ativo', now());

  return v_org_id;
end;
$$;

-- ----------------------------------------------------------------------------
-- Registrar ação de auditoria (chamado pela aplicação após ações críticas)
-- ----------------------------------------------------------------------------
create or replace function public.log_action(
  p_organization_id uuid,
  p_acao text,
  p_entidade text,
  p_entidade_id uuid default null,
  p_detalhes jsonb default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.logs_auditoria (organization_id, user_id, acao, entidade, entidade_id, detalhes)
  values (p_organization_id, auth.uid(), p_acao, p_entidade, p_entidade_id, p_detalhes);
end;
$$;
