-- ============================================================================
-- Sistema CampoAgri — schema inicial
-- Convenção: toda tabela operacional carrega organization_id (multi-tenant).
-- Soft delete via deleted_at em todas as entidades de negócio.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Plataforma (nível Super Admin, fora do tenant)
-- ----------------------------------------------------------------------------
create table public.platform_admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  tipo text not null default 'super_admin' check (tipo in ('super_admin','suporte','financeiro')),
  status text not null default 'ativo' check (status in ('ativo','inativo')),
  ultimo_acesso timestamptz,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Organizations / Tenants
-- ----------------------------------------------------------------------------
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  nome_comercial text,
  documento text,
  telefone text,
  email text,
  cidade text,
  estado text,
  logo_url text,
  assinatura_url text,
  registro_profissional text,
  plano text not null default 'trial' check (plano in ('trial','individual','profissional','equipe')),
  status_assinatura text not null default 'trial' check (status_assinatura in ('trial','active','past_due','canceled','suspended')),
  limite_propriedades int,
  limite_visitas_mensais int,
  limite_armazenamento_mb int not null default 1024,
  limite_usuarios int not null default 1,
  data_inicio_trial timestamptz default now(),
  data_fim_trial timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ----------------------------------------------------------------------------
-- Profiles (extensão de auth.users)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text,
  telefone text,
  avatar_url text,
  status text not null default 'ativo' check (status in ('ativo','inativo','convidado')),
  ultimo_acesso timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Organization Users (vínculo usuário <-> organização + papel)
-- ----------------------------------------------------------------------------
create table public.organization_users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'agronomo' check (role in ('owner','admin','agronomo','tecnico','assistente','viewer')),
  status text not null default 'convidado' check (status in ('ativo','inativo','convidado')),
  data_convite timestamptz default now(),
  data_entrada timestamptz,
  ultimo_acesso timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index idx_organization_users_org on public.organization_users(organization_id);
create index idx_organization_users_user on public.organization_users(user_id);

-- ----------------------------------------------------------------------------
-- Produtores / Clientes
-- ----------------------------------------------------------------------------
create table public.produtores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  nome text not null,
  cpf_cnpj text,
  telefone text,
  whatsapp text,
  email text,
  endereco text,
  cidade text,
  estado text,
  observacoes text,
  status text not null default 'ativo' check (status in ('ativo','inativo')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_produtores_org on public.produtores(organization_id) where deleted_at is null;

-- ----------------------------------------------------------------------------
-- Propriedades
-- ----------------------------------------------------------------------------
create table public.propriedades (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  produtor_id uuid not null references public.produtores(id) on delete cascade,
  nome text not null,
  municipio text,
  estado text,
  localizacao text,
  latitude numeric(10,6),
  longitude numeric(10,6),
  area_total_ha numeric(12,2),
  tipo_atividade text check (tipo_atividade in ('graos','leite','corte','silagem','pastagem','cana','horticultura','misto','outro')),
  observacoes text,
  status text not null default 'ativa' check (status in ('ativa','inativa')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_propriedades_org on public.propriedades(organization_id) where deleted_at is null;
create index idx_propriedades_produtor on public.propriedades(produtor_id);

-- ----------------------------------------------------------------------------
-- Áreas produtivas / Talhões / Lavouras / Pastagens
-- ----------------------------------------------------------------------------
create table public.areas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  propriedade_id uuid not null references public.propriedades(id) on delete cascade,
  nome text not null,
  tipo text not null check (tipo in ('lavoura','pastagem','piquete','canavial','area_silagem','area_experimental','outro')),
  area_ha numeric(12,2),
  latitude numeric(10,6),
  longitude numeric(10,6),
  status text not null default 'ativa' check (status in ('ativa','em_reforma','em_pousio','colhida','encerrada')),
  observacoes text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_areas_org on public.areas(organization_id) where deleted_at is null;
create index idx_areas_propriedade on public.areas(propriedade_id);

-- ----------------------------------------------------------------------------
-- Safras / Ciclos produtivos
-- ----------------------------------------------------------------------------
create table public.safras (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  propriedade_id uuid not null references public.propriedades(id) on delete cascade,
  area_id uuid not null references public.areas(id) on delete cascade,
  nome text not null,
  cultura text not null,
  finalidade text check (finalidade in ('grao','silagem','pastejo','feno','cobertura','cana_corte','outro')),
  cultivar text,
  data_prevista_plantio date,
  data_real_plantio date,
  data_prevista_colheita date,
  data_real_colheita date,
  populacao_planejada numeric(12,2),
  espacamento numeric(6,3),
  profundidade_plantio numeric(6,3),
  sistema_plantio text check (sistema_plantio in ('direto','convencional','minimo','reforma_pastagem','outro')),
  status text not null default 'planejada' check (status in ('planejada','plantada','em_desenvolvimento','colhida','encerrada')),
  observacoes text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_safras_org on public.safras(organization_id) where deleted_at is null;
create index idx_safras_area on public.safras(area_id);

-- ----------------------------------------------------------------------------
-- Planejamento de plantio
-- ----------------------------------------------------------------------------
create table public.planejamento_plantio (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  safra_id uuid not null references public.safras(id) on delete cascade,
  area_id uuid not null references public.areas(id) on delete cascade,
  cultivar text,
  sementes_por_ha numeric(12,2),
  espacamento numeric(6,3),
  profundidade numeric(6,3),
  tratamento_sementes text,
  adubacao_base text,
  adubacao_cobertura text,
  produtos_previstos text,
  custo_estimado_ha numeric(12,2),
  custo_total_estimado numeric(14,2),
  observacoes_tecnicas text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_planejamento_org on public.planejamento_plantio(organization_id) where deleted_at is null;

-- ----------------------------------------------------------------------------
-- Visitas técnicas
-- ----------------------------------------------------------------------------
create table public.visitas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  produtor_id uuid not null references public.produtores(id) on delete cascade,
  propriedade_id uuid not null references public.propriedades(id) on delete cascade,
  data_visita date not null default current_date,
  hora_inicial time,
  hora_final time,
  responsavel_tecnico_id uuid references auth.users(id),
  objetivo text,
  condicoes_climaticas text,
  resumo_geral text,
  proximas_acoes text,
  status text not null default 'rascunho' check (status in ('rascunho','finalizada','relatorio_gerado')),
  observacoes_finais text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_visitas_org on public.visitas(organization_id) where deleted_at is null;
create index idx_visitas_propriedade on public.visitas(propriedade_id);
create index idx_visitas_data on public.visitas(data_visita);

-- ----------------------------------------------------------------------------
-- Avaliação de área durante a visita
-- ----------------------------------------------------------------------------
create table public.avaliacoes_area (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  visita_id uuid not null references public.visitas(id) on delete cascade,
  area_id uuid not null references public.areas(id) on delete cascade,
  safra_id uuid references public.safras(id),
  estadio_fenologico text,
  desenvolvimento_geral text,
  stand_plantas text,
  uniformidade text,
  falhas_plantio text,
  acamamento text,
  vigor text,
  umidade_solo text,
  compactacao text,
  plantas_daninhas text,
  pragas text,
  doencas text,
  necessidade_intervencao boolean default false,
  observacoes_gerais text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (visita_id, area_id)
);
create index idx_avaliacoes_org on public.avaliacoes_area(organization_id) where deleted_at is null;
create index idx_avaliacoes_visita on public.avaliacoes_area(visita_id);

-- ----------------------------------------------------------------------------
-- Ocorrências agronômicas
-- ----------------------------------------------------------------------------
create table public.ocorrencias (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  visita_id uuid not null references public.visitas(id) on delete cascade,
  area_id uuid not null references public.areas(id) on delete cascade,
  safra_id uuid references public.safras(id),
  tipo text not null,
  severidade text not null default 'baixa' check (severidade in ('baixa','media','alta','critica')),
  descricao text,
  recomendacao_tecnica text,
  prazo_recomendado date,
  produto_recomendado text,
  dose text,
  responsavel_acao text,
  status text not null default 'identificado' check (status in ('identificado','recomendado','em_execucao','resolvido')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_ocorrencias_org on public.ocorrencias(organization_id) where deleted_at is null;
create index idx_ocorrencias_visita on public.ocorrencias(visita_id);
create index idx_ocorrencias_area on public.ocorrencias(area_id);

-- ----------------------------------------------------------------------------
-- Fotos
-- ----------------------------------------------------------------------------
create table public.fotos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  visita_id uuid references public.visitas(id) on delete cascade,
  propriedade_id uuid references public.propriedades(id) on delete cascade,
  area_id uuid references public.areas(id),
  safra_id uuid references public.safras(id),
  ocorrencia_id uuid references public.ocorrencias(id),
  storage_path text not null,
  legenda text,
  data_hora timestamptz not null default now(),
  latitude numeric(10,6),
  longitude numeric(10,6),
  observacoes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_fotos_org on public.fotos(organization_id) where deleted_at is null;
create index idx_fotos_visita on public.fotos(visita_id);
create index idx_fotos_ocorrencia on public.fotos(ocorrencia_id);

-- ----------------------------------------------------------------------------
-- Recomendações técnicas
-- ----------------------------------------------------------------------------
create table public.recomendacoes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  visita_id uuid not null references public.visitas(id) on delete cascade,
  area_id uuid references public.areas(id),
  safra_id uuid references public.safras(id),
  categoria text not null check (categoria in ('plantio','adubacao','pragas','doencas','plantas_daninhas','solo','pastagem','colheita','manejo_geral')),
  recomendacao text not null,
  prioridade text not null default 'media' check (prioridade in ('baixa','media','alta','urgente')),
  prazo_sugerido date,
  produto_sugerido text,
  dose text,
  volume_calda text,
  area_aplicar text,
  observacoes text,
  status text not null default 'pendente' check (status in ('pendente','executada','cancelada')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_recomendacoes_org on public.recomendacoes(organization_id) where deleted_at is null;
create index idx_recomendacoes_visita on public.recomendacoes(visita_id);

-- ----------------------------------------------------------------------------
-- Insumos e custos previstos
-- ----------------------------------------------------------------------------
create table public.insumos_custos (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  propriedade_id uuid not null references public.propriedades(id) on delete cascade,
  area_id uuid references public.areas(id),
  safra_id uuid references public.safras(id),
  tipo_insumo text not null check (tipo_insumo in ('semente','fertilizante','herbicida','inseticida','fungicida','corretivo','diesel','servico','mao_de_obra','outro')),
  nome_insumo text not null,
  quantidade_ha numeric(12,3),
  unidade text,
  preco_unitario numeric(12,2),
  custo_ha numeric(12,2),
  area_total numeric(12,2),
  custo_total numeric(14,2),
  observacoes text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_insumos_org on public.insumos_custos(organization_id) where deleted_at is null;
create index idx_insumos_safra on public.insumos_custos(safra_id);

-- ----------------------------------------------------------------------------
-- Relatórios
-- ----------------------------------------------------------------------------
create table public.relatorios (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  visita_id uuid not null references public.visitas(id) on delete cascade,
  produtor_id uuid not null references public.produtores(id),
  propriedade_id uuid not null references public.propriedades(id),
  codigo text,
  data_geracao timestamptz not null default now(),
  status text not null default 'gerado' check (status in ('gerado','enviado')),
  storage_path text,
  gerado_por uuid references auth.users(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_relatorios_org on public.relatorios(organization_id) where deleted_at is null;
create index idx_relatorios_visita on public.relatorios(visita_id);

-- ----------------------------------------------------------------------------
-- Agenda de visitas
-- ----------------------------------------------------------------------------
create table public.agenda_visitas (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  produtor_id uuid not null references public.produtores(id) on delete cascade,
  propriedade_id uuid not null references public.propriedades(id) on delete cascade,
  data_prevista date not null,
  horario time,
  objetivo text,
  status text not null default 'agendada' check (status in ('agendada','realizada','cancelada')),
  observacoes text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_agenda_org on public.agenda_visitas(organization_id) where deleted_at is null;
create index idx_agenda_data on public.agenda_visitas(data_prevista);

-- ----------------------------------------------------------------------------
-- Logs e auditoria
-- ----------------------------------------------------------------------------
create table public.logs_auditoria (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id),
  acao text not null,
  entidade text not null,
  entidade_id uuid,
  data_hora timestamptz not null default now(),
  ip text,
  detalhes jsonb
);
create index idx_logs_org on public.logs_auditoria(organization_id);
create index idx_logs_data on public.logs_auditoria(data_hora);
