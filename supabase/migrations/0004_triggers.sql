-- ============================================================================
-- Triggers: updated_at automático, criação de profile no signup,
-- proteção do último owner ativo da organização.
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'organizations','profiles','organization_users','produtores','propriedades',
    'areas','safras','planejamento_plantio','visitas','avaliacoes_area',
    'ocorrencias','recomendacoes','insumos_custos','agenda_visitas'
  ] loop
    execute format(
      'create trigger trg_set_updated_at before update on public.%I for each row execute function public.set_updated_at();',
      t
    );
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Cria profile automaticamente quando um novo usuário se registra no Auth
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', new.email), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Impede remover/desativar/rebaixar o único owner ativo de uma organização
-- ----------------------------------------------------------------------------
create or replace function public.protect_last_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_other_active_owners int;
begin
  if old.role = 'owner' and old.status = 'ativo' then
    select count(*) into v_other_active_owners
    from public.organization_users
    where organization_id = old.organization_id
      and role = 'owner'
      and status = 'ativo'
      and id <> old.id;

    if v_other_active_owners = 0 then
      if tg_op = 'DELETE' then
        raise exception 'Não é possível remover o único owner ativo da organização';
      elsif tg_op = 'UPDATE' and (new.role <> 'owner' or new.status <> 'ativo') then
        raise exception 'Não é possível rebaixar ou desativar o único owner ativo da organização';
      end if;
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger trg_protect_last_owner_update
  before update on public.organization_users
  for each row execute function public.protect_last_owner();

create trigger trg_protect_last_owner_delete
  before delete on public.organization_users
  for each row execute function public.protect_last_owner();
