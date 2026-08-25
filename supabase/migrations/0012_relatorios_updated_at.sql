-- ============================================================================
-- `relatorios` era a única tabela operacional sem `updated_at`/trigger.
--
-- A sincronização offline usa essa coluna como marca d'água para baixar apenas
-- o que mudou; sem ela, incluir a tabela na sincronização quebraria o ciclo
-- inteiro (a consulta falha e nenhuma tabela desce).
-- ============================================================================

alter table public.relatorios
  add column if not exists updated_at timestamptz not null default now();

alter table public.relatorios
  add column if not exists updated_by uuid references auth.users(id);

-- Backfill: registros antigos passam a ter uma marca d'água coerente.
update public.relatorios set updated_at = coalesce(created_at, now()) where updated_at is null;

drop trigger if exists trg_set_updated_at on public.relatorios;
create trigger trg_set_updated_at before update on public.relatorios
  for each row execute function public.set_updated_at();
