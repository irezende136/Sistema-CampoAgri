-- ============================================================================
-- Storage: bucket privado único, organizado por organization_id como
-- primeiro segmento do path. Ex.: {organization_id}/visitas/{visita_id}/foto.jpg
--                                 {organization_id}/propriedades/...
--                                 {organization_id}/relatorios/...
--                                 {organization_id}/organizacao/logo.png
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('campoagri', 'campoagri', false, 15728640)
on conflict (id) do nothing;

create policy "campoagri_select_org_members"
  on storage.objects for select
  using (
    bucket_id = 'campoagri'
    and (
      public.is_org_member(((storage.foldername(name))[1])::uuid)
      or public.is_platform_admin()
    )
  );

create policy "campoagri_insert_org_members"
  on storage.objects for insert
  with check (
    bucket_id = 'campoagri'
    and public.can_write_org(((storage.foldername(name))[1])::uuid)
  );

create policy "campoagri_update_org_members"
  on storage.objects for update
  using (
    bucket_id = 'campoagri'
    and public.can_write_org(((storage.foldername(name))[1])::uuid)
  );

create policy "campoagri_delete_org_admins"
  on storage.objects for delete
  using (
    bucket_id = 'campoagri'
    and (
      public.is_org_admin(((storage.foldername(name))[1])::uuid)
      or public.is_platform_admin()
    )
  );
