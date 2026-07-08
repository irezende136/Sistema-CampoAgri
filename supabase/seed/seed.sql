-- ============================================================================
-- Dados fictícios de demonstração (ver seção 19 do briefing do produto).
-- Cria um usuário de demonstração já confirmado (sem depender de e-mail),
-- uma organização, produtor, propriedade, áreas, safra, planejamento de
-- plantio, uma visita finalizada com avaliação, ocorrências e recomendações.
--
-- Credenciais de demonstração:
--   e-mail:  demo@campoagri.app
--   senha:   CampoAgri#2026
--
-- Este script é idempotente apenas na primeira execução (não usa
-- ON CONFLICT em todas as tabelas); rode uma única vez por ambiente.
-- Requer a extensão pgcrypto (já habilitada pela migration 0001).
-- ============================================================================

do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_org_id uuid;
  v_produtor_id uuid;
  v_propriedade_id uuid;
  v_area_milho1 uuid;
  v_area_milho2 uuid;
  v_area_cana1 uuid;
  v_area_pasto1 uuid;
  v_area_piquete3 uuid;
  v_safra_id uuid;
  v_visita_id uuid;
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change, is_sso_user, is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated',
    'demo@campoagri.app', crypt('CampoAgri#2026', gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nome":"Eng. Agrônomo Exemplo"}'::jsonb,
    now(), now(), '', '', '', '', false, false
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), v_user_id, v_user_id::text,
    jsonb_build_object('sub', v_user_id::text, 'email', 'demo@campoagri.app'),
    'email', now(), now(), now()
  );

  insert into public.organizations (nome, nome_comercial, telefone, email, cidade, estado, registro_profissional, plano, status_assinatura)
  values ('AgroGestão Técnica', 'AgroGestão Técnica', '(32) 99999-0000', 'contato@agrogestaotecnica.com.br', 'Juiz de Fora', 'MG', 'CREA 123456-D/MG', 'profissional', 'active')
  returning id into v_org_id;

  update public.profiles set nome = 'Eng. Agrônomo Exemplo' where id = v_user_id;

  insert into public.organization_users (organization_id, user_id, role, status, data_entrada)
  values (v_org_id, v_user_id, 'owner', 'ativo', now());

  insert into public.platform_admins (user_id, nome, email, tipo, status)
  values (v_user_id, 'Eng. Agrônomo Exemplo', 'demo@campoagri.app', 'super_admin', 'ativo');

  insert into public.produtores (organization_id, nome, telefone, whatsapp, cidade, estado, created_by, updated_by)
  values (v_org_id, 'João Pereira', '(32) 98888-1111', '(32) 98888-1111', 'Juiz de Fora', 'MG', v_user_id, v_user_id)
  returning id into v_produtor_id;

  insert into public.propriedades (organization_id, produtor_id, nome, municipio, estado, area_total_ha, tipo_atividade, created_by, updated_by)
  values (v_org_id, v_produtor_id, 'Fazenda Santa Clara', 'Juiz de Fora', 'MG', 43, 'graos', v_user_id, v_user_id)
  returning id into v_propriedade_id;

  insert into public.areas (organization_id, propriedade_id, nome, tipo, area_ha, status, created_by, updated_by)
  values (v_org_id, v_propriedade_id, 'Lavoura 1 de milho', 'lavoura', 12, 'ativa', v_user_id, v_user_id) returning id into v_area_milho1;

  insert into public.areas (organization_id, propriedade_id, nome, tipo, area_ha, status, created_by, updated_by)
  values (v_org_id, v_propriedade_id, 'Lavoura 2 de milho', 'lavoura', 8, 'ativa', v_user_id, v_user_id) returning id into v_area_milho2;

  insert into public.areas (organization_id, propriedade_id, nome, tipo, area_ha, status, created_by, updated_by)
  values (v_org_id, v_propriedade_id, 'Lavoura 1 de cana', 'canavial', 6, 'ativa', v_user_id, v_user_id) returning id into v_area_cana1;

  insert into public.areas (organization_id, propriedade_id, nome, tipo, area_ha, status, created_by, updated_by)
  values (v_org_id, v_propriedade_id, 'Pastagem 1', 'pastagem', 15, 'ativa', v_user_id, v_user_id) returning id into v_area_pasto1;

  insert into public.areas (organization_id, propriedade_id, nome, tipo, area_ha, status, created_by, updated_by)
  values (v_org_id, v_propriedade_id, 'Piquete 3', 'piquete', 2, 'ativa', v_user_id, v_user_id) returning id into v_area_piquete3;

  insert into public.safras (organization_id, propriedade_id, area_id, nome, cultura, finalidade, cultivar, data_prevista_plantio, data_real_plantio, populacao_planejada, espacamento, sistema_plantio, status, created_by, updated_by)
  values (v_org_id, v_propriedade_id, v_area_milho1, 'Milho Verão 2026/2027', 'Milho', 'grao', 'AG 9045 PRO3 (fictício)', '2026-10-12', '2026-10-10', 61000, 0.50, 'direto', 'em_desenvolvimento', v_user_id, v_user_id)
  returning id into v_safra_id;

  insert into public.planejamento_plantio (organization_id, safra_id, area_id, cultivar, sementes_por_ha, espacamento, adubacao_base, adubacao_cobertura, custo_estimado_ha, observacoes_tecnicas, created_by, updated_by)
  values (v_org_id, v_safra_id, v_area_milho1, 'AG 9045 PRO3 (fictício)', 61000, 0.50, '350 kg/ha de 08-28-16', 'Ureia conforme recomendação técnica', 3200, 'Plantio previsto para 12/10, monitorar germinação em até 7 dias.', v_user_id, v_user_id);

  insert into public.visitas (organization_id, produtor_id, propriedade_id, data_visita, hora_inicial, hora_final, responsavel_tecnico_id, objetivo, condicoes_climaticas, resumo_geral, proximas_acoes, status, created_by, updated_by)
  values (v_org_id, v_produtor_id, v_propriedade_id, '2026-10-20', '08:30', '10:15', v_user_id, 'Avaliação de desenvolvimento inicial da lavoura', 'Ensolarado, 26°C, sem chuva nos últimos 5 dias', 'Lavoura de milho com germinação uniforme e bom vigor inicial. Monitorar pragas.', 'Retornar em 10 dias para reavaliar nível de infestação de cigarrinha e liberar adubação de cobertura.', 'finalizada', v_user_id, v_user_id)
  returning id into v_visita_id;

  insert into public.avaliacoes_area (organization_id, visita_id, area_id, safra_id, estadio_fenologico, desenvolvimento_geral, stand_plantas, uniformidade, vigor, umidade_solo, pragas, necessidade_intervencao, observacoes_gerais, created_by, updated_by)
  values (v_org_id, v_visita_id, v_area_milho1, v_safra_id, 'V4', 'Bom', 'Adequado, poucas falhas', 'Uniforme', 'Bom', 'Adequada', 'Baixa presença de lagarta e monitoramento de cigarrinha', false, 'Lavoura com bom desenvolvimento inicial.', v_user_id, v_user_id);

  insert into public.ocorrencias (organization_id, visita_id, area_id, safra_id, tipo, severidade, descricao, status, created_by, updated_by)
  values
    (v_org_id, v_visita_id, v_area_milho1, v_safra_id, 'Plantio efetuado', 'baixa', 'Plantio realizado em 10/10.', 'resolvido', v_user_id, v_user_id),
    (v_org_id, v_visita_id, v_area_milho1, v_safra_id, 'Germinação avaliada', 'baixa', 'Germinação uniforme em toda a área.', 'resolvido', v_user_id, v_user_id),
    (v_org_id, v_visita_id, v_area_milho1, v_safra_id, 'Ataque de lagarta', 'baixa', 'Ataque inicial de lagarta em baixa severidade.', 'em_execucao', v_user_id, v_user_id),
    (v_org_id, v_visita_id, v_area_milho1, v_safra_id, 'Ataque de cigarrinha', 'baixa', 'Presença de cigarrinha em monitoramento.', 'identificado', v_user_id, v_user_id);

  insert into public.recomendacoes (organization_id, visita_id, area_id, safra_id, categoria, recomendacao, prioridade, status, created_by, updated_by)
  values
    (v_org_id, v_visita_id, v_area_milho1, v_safra_id, 'pragas', 'Realizar controle de cigarrinha caso a infestação atinja o nível de ação.', 'media', 'pendente', v_user_id, v_user_id),
    (v_org_id, v_visita_id, v_area_milho1, v_safra_id, 'adubacao', 'Adubação de cobertura programada conforme planejamento de plantio.', 'alta', 'pendente', v_user_id, v_user_id);

end $$;
