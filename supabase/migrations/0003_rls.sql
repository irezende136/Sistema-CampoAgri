-- ============================================================================
-- Row Level Security — isolamento por organization_id em todas as tabelas
-- operacionais. Regra crítica: nenhum dado operacional é visível/gravável
-- fora da organização do usuário autenticado (exceto Super Admin / plataforma).
-- ============================================================================

alter table public.platform_admins enable row level security;
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_users enable row level security;
alter table public.produtores enable row level security;
alter table public.propriedades enable row level security;
alter table public.areas enable row level security;
alter table public.safras enable row level security;
alter table public.planejamento_plantio enable row level security;
alter table public.visitas enable row level security;
alter table public.avaliacoes_area enable row level security;
alter table public.ocorrencias enable row level security;
alter table public.fotos enable row level security;
alter table public.recomendacoes enable row level security;
alter table public.insumos_custos enable row level security;
alter table public.relatorios enable row level security;
alter table public.agenda_visitas enable row level security;
alter table public.logs_auditoria enable row level security;

-- ----------------------------------------------------------------------------
-- platform_admins — visível/gerenciável apenas por platform admins
-- ----------------------------------------------------------------------------
create policy "platform_admins_select" on public.platform_admins
  for select using (public.is_platform_admin());
create policy "platform_admins_insert" on public.platform_admins
  for insert with check (public.is_platform_admin());
create policy "platform_admins_update" on public.platform_admins
  for update using (public.is_platform_admin());
create policy "platform_admins_delete" on public.platform_admins
  for delete using (public.is_platform_admin());

-- ----------------------------------------------------------------------------
-- organizations
-- ----------------------------------------------------------------------------
create policy "organizations_select" on public.organizations
  for select using (public.is_org_member(id) or public.is_platform_admin());
create policy "organizations_update" on public.organizations
  for update using (public.is_org_admin(id) or public.is_platform_admin());
create policy "organizations_insert_platform" on public.organizations
  for insert with check (public.is_platform_admin());
create policy "organizations_delete_platform" on public.organizations
  for delete using (public.is_platform_admin());

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create policy "profiles_select_self_or_org" on public.profiles
  for select using (
    id = auth.uid()
    or public.is_platform_admin()
    or exists (
      select 1 from public.organization_users me
      join public.organization_users them on them.organization_id = me.organization_id
      where me.user_id = auth.uid() and me.status = 'ativo'
        and them.user_id = public.profiles.id and them.status = 'ativo'
    )
  );
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid() or public.is_platform_admin());
create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());

-- ----------------------------------------------------------------------------
-- organization_users
-- ----------------------------------------------------------------------------
create policy "org_users_select" on public.organization_users
  for select using (
    user_id = auth.uid()
    or public.is_org_member(organization_id)
    or public.is_platform_admin()
  );
create policy "org_users_insert" on public.organization_users
  for insert with check (public.is_org_admin(organization_id) or public.is_platform_admin());
create policy "org_users_update" on public.organization_users
  for update using (public.is_org_admin(organization_id) or public.is_platform_admin());
create policy "org_users_delete" on public.organization_users
  for delete using (public.is_org_admin(organization_id) or public.is_platform_admin());

-- ----------------------------------------------------------------------------
-- Tabelas operacionais: padrão SELECT (membro OU platform admin),
-- INSERT/UPDATE (membro com permissão de escrita, não-viewer),
-- DELETE (owner/admin da organização ou platform admin).
-- ----------------------------------------------------------------------------

create policy "produtores_select" on public.produtores for select using (public.is_org_member(organization_id) or public.is_platform_admin());
create policy "produtores_insert" on public.produtores for insert with check (public.can_write_org(organization_id));
create policy "produtores_update" on public.produtores for update using (public.can_write_org(organization_id)) with check (public.can_write_org(organization_id));
create policy "produtores_delete" on public.produtores for delete using (public.is_org_admin(organization_id) or public.is_platform_admin());

create policy "propriedades_select" on public.propriedades for select using (public.is_org_member(organization_id) or public.is_platform_admin());
create policy "propriedades_insert" on public.propriedades for insert with check (public.can_write_org(organization_id));
create policy "propriedades_update" on public.propriedades for update using (public.can_write_org(organization_id)) with check (public.can_write_org(organization_id));
create policy "propriedades_delete" on public.propriedades for delete using (public.is_org_admin(organization_id) or public.is_platform_admin());

create policy "areas_select" on public.areas for select using (public.is_org_member(organization_id) or public.is_platform_admin());
create policy "areas_insert" on public.areas for insert with check (public.can_write_org(organization_id));
create policy "areas_update" on public.areas for update using (public.can_write_org(organization_id)) with check (public.can_write_org(organization_id));
create policy "areas_delete" on public.areas for delete using (public.is_org_admin(organization_id) or public.is_platform_admin());

create policy "safras_select" on public.safras for select using (public.is_org_member(organization_id) or public.is_platform_admin());
create policy "safras_insert" on public.safras for insert with check (public.can_write_org(organization_id));
create policy "safras_update" on public.safras for update using (public.can_write_org(organization_id)) with check (public.can_write_org(organization_id));
create policy "safras_delete" on public.safras for delete using (public.is_org_admin(organization_id) or public.is_platform_admin());

create policy "planejamento_select" on public.planejamento_plantio for select using (public.is_org_member(organization_id) or public.is_platform_admin());
create policy "planejamento_insert" on public.planejamento_plantio for insert with check (public.can_write_org(organization_id));
create policy "planejamento_update" on public.planejamento_plantio for update using (public.can_write_org(organization_id)) with check (public.can_write_org(organization_id));
create policy "planejamento_delete" on public.planejamento_plantio for delete using (public.is_org_admin(organization_id) or public.is_platform_admin());

create policy "visitas_select" on public.visitas for select using (public.is_org_member(organization_id) or public.is_platform_admin());
create policy "visitas_insert" on public.visitas for insert with check (public.can_write_org(organization_id));
create policy "visitas_update" on public.visitas for update using (public.can_write_org(organization_id)) with check (public.can_write_org(organization_id));
create policy "visitas_delete" on public.visitas for delete using (public.is_org_admin(organization_id) or public.is_platform_admin());

create policy "avaliacoes_select" on public.avaliacoes_area for select using (public.is_org_member(organization_id) or public.is_platform_admin());
create policy "avaliacoes_insert" on public.avaliacoes_area for insert with check (public.can_write_org(organization_id));
create policy "avaliacoes_update" on public.avaliacoes_area for update using (public.can_write_org(organization_id)) with check (public.can_write_org(organization_id));
create policy "avaliacoes_delete" on public.avaliacoes_area for delete using (public.is_org_admin(organization_id) or public.is_platform_admin());

create policy "ocorrencias_select" on public.ocorrencias for select using (public.is_org_member(organization_id) or public.is_platform_admin());
create policy "ocorrencias_insert" on public.ocorrencias for insert with check (public.can_write_org(organization_id));
create policy "ocorrencias_update" on public.ocorrencias for update using (public.can_write_org(organization_id)) with check (public.can_write_org(organization_id));
create policy "ocorrencias_delete" on public.ocorrencias for delete using (public.is_org_admin(organization_id) or public.is_platform_admin());

create policy "fotos_select" on public.fotos for select using (public.is_org_member(organization_id) or public.is_platform_admin());
create policy "fotos_insert" on public.fotos for insert with check (public.can_write_org(organization_id));
create policy "fotos_update" on public.fotos for update using (public.can_write_org(organization_id)) with check (public.can_write_org(organization_id));
create policy "fotos_delete" on public.fotos for delete using (public.is_org_admin(organization_id) or public.is_platform_admin());

create policy "recomendacoes_select" on public.recomendacoes for select using (public.is_org_member(organization_id) or public.is_platform_admin());
create policy "recomendacoes_insert" on public.recomendacoes for insert with check (public.can_write_org(organization_id));
create policy "recomendacoes_update" on public.recomendacoes for update using (public.can_write_org(organization_id)) with check (public.can_write_org(organization_id));
create policy "recomendacoes_delete" on public.recomendacoes for delete using (public.is_org_admin(organization_id) or public.is_platform_admin());

create policy "insumos_select" on public.insumos_custos for select using (public.is_org_member(organization_id) or public.is_platform_admin());
create policy "insumos_insert" on public.insumos_custos for insert with check (public.can_write_org(organization_id));
create policy "insumos_update" on public.insumos_custos for update using (public.can_write_org(organization_id)) with check (public.can_write_org(organization_id));
create policy "insumos_delete" on public.insumos_custos for delete using (public.is_org_admin(organization_id) or public.is_platform_admin());

create policy "relatorios_select" on public.relatorios for select using (public.is_org_member(organization_id) or public.is_platform_admin());
create policy "relatorios_insert" on public.relatorios for insert with check (public.can_write_org(organization_id));
create policy "relatorios_update" on public.relatorios for update using (public.can_write_org(organization_id)) with check (public.can_write_org(organization_id));
create policy "relatorios_delete" on public.relatorios for delete using (public.is_org_admin(organization_id) or public.is_platform_admin());

create policy "agenda_select" on public.agenda_visitas for select using (public.is_org_member(organization_id) or public.is_platform_admin());
create policy "agenda_insert" on public.agenda_visitas for insert with check (public.can_write_org(organization_id));
create policy "agenda_update" on public.agenda_visitas for update using (public.can_write_org(organization_id)) with check (public.can_write_org(organization_id));
create policy "agenda_delete" on public.agenda_visitas for delete using (public.is_org_admin(organization_id) or public.is_platform_admin());

-- logs_auditoria: imutável — apenas leitura por admins da organização ou platform admin;
-- inserções somente via função log_action (SECURITY DEFINER, bypassa RLS).
create policy "logs_select" on public.logs_auditoria for select using (public.is_org_admin(organization_id) or public.is_platform_admin());
