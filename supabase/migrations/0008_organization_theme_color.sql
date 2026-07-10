-- ============================================================================
-- Permite que cada organização personalize a cor primária da interface e dos
-- relatórios PDF (identidade visual própria).
-- ============================================================================

alter table public.organizations
  add column cor_primaria text not null default '#1f4d3a';

alter table public.organizations
  add constraint organizations_cor_primaria_format
  check (cor_primaria ~* '^#[0-9a-f]{6}$');
