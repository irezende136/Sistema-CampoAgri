-- ============================================================================
-- `fotos` ficou de fora da lista de triggers da migration 0004 e, por isso,
-- nunca teve `updated_at`.
--
-- A sincronização offline usa essa coluna como marca d'água. Sem ela a consulta
-- de `fotos` falhava, o erro abortava o ciclo inteiro e a sincronização nunca
-- concluía — o app mostrava "Falha ao sincronizar" mesmo online.
--
-- Mesma correção já aplicada em `relatorios` na migration 0012. Após esta,
-- todas as 14 tabelas sincronizadas têm updated_at + trigger.
-- ============================================================================

alter table public.fotos
  add column if not exists updated_at timestamptz not null default now();

alter table public.fotos
  add column if not exists updated_by uuid references auth.users(id);

update public.fotos set updated_at = coalesce(created_at, now()) where updated_at is null;

drop trigger if exists trg_set_updated_at on public.fotos;
create trigger trg_set_updated_at before update on public.fotos
  for each row execute function public.set_updated_at();
