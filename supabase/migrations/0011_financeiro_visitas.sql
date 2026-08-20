-- ============================================================================
-- Financeiro da visita: lançamentos de cobrança do serviço técnico
-- (honorários da visita, análises, deslocamento etc.), com desconto
-- percentual ou em valor fixo e status de pagamento.
-- ============================================================================

create table public.financeiro_visitas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  produtor_id uuid not null references public.produtores(id) on delete cascade,
  propriedade_id uuid references public.propriedades(id) on delete set null,
  visita_id uuid references public.visitas(id) on delete set null,
  descricao text not null,
  valor numeric(12,2) not null check (valor >= 0),
  desconto_tipo text check (desconto_tipo in ('percentual','valor')),
  desconto_valor numeric(12,2) check (desconto_valor >= 0),
  valor_final numeric(12,2) not null check (valor_final >= 0),
  status_pagamento text not null default 'pendente' check (status_pagamento in ('pendente','pago','cancelado')),
  data_lancamento date not null default current_date,
  data_pagamento date,
  forma_pagamento text check (forma_pagamento in ('pix','dinheiro','boleto','cartao','transferencia','outro')),
  observacoes text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_financeiro_org on public.financeiro_visitas(organization_id) where deleted_at is null;
create index idx_financeiro_visita on public.financeiro_visitas(visita_id);
create index idx_financeiro_produtor on public.financeiro_visitas(produtor_id);
create index idx_financeiro_status on public.financeiro_visitas(status_pagamento) where deleted_at is null;

create trigger trg_set_updated_at before update on public.financeiro_visitas
  for each row execute function public.set_updated_at();

alter table public.financeiro_visitas enable row level security;

create policy "financeiro_select" on public.financeiro_visitas for select
  using (public.is_org_member(organization_id) or public.is_platform_admin());
create policy "financeiro_insert" on public.financeiro_visitas for insert
  with check (public.can_write_org(organization_id));
create policy "financeiro_update" on public.financeiro_visitas for update
  using (public.can_write_org(organization_id))
  with check (public.can_write_org(organization_id));
create policy "financeiro_delete" on public.financeiro_visitas for delete
  using (public.is_org_admin(organization_id) or public.is_platform_admin());
