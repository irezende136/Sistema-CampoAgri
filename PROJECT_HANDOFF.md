# PROJECT_HANDOFF.md — Sistema CampoAgri

> Documento de transição de contexto. Gerado por análise direta do código-fonte, das migrations SQL, do banco de dados remoto (via MCP Supabase) e do deploy remoto (via MCP Vercel), não apenas do histórico de chat. Última atualização: **2026-07-10**, commit `f6dbc86` (branch `claude/agronomy-saas-platform-fpxpei`).
>
> Convenção usada neste documento: cada afirmação é marcada como **[CÓDIGO]** (confirmado lendo o arquivo/diretório), **[BANCO]** (confirmado via SQL/MCP Supabase contra o projeto remoto `ynspkydroyncqhswjznm`), **[DEPLOY]** (confirmado via MCP Vercel contra o deploy de produção), **[CHAT]** (mencionado na conversa mas não re-verificado agora) ou **[INFERÊNCIA]** (dedução minha, não um fato direto). Nada aqui foi tratado como "concluído" apenas por ter sido dito no chat.

---

## 1. Visão geral do projeto

Sistema CampoAgri é um SaaS multi-tenant, em português, para engenheiros agrônomos autônomos e pequenas equipes técnicas gerenciarem visitas técnicas a propriedades rurais: produtores, propriedades, áreas/talhões, safras, planejamento de plantio, visitas com avaliações por área, ocorrências agronômicas (pragas/doenças/deficiências), fotos, recomendações técnicas, agenda de visitas e geração de relatórios de visita em PDF. **[CÓDIGO]**

O sistema foi desenhado desde o início para multi-tenancy (SaaS-ready), com `organization_id` em todas as tabelas operacionais e isolamento de dados via Row Level Security (RLS) no Postgres, mesmo que hoje, na prática, existam apenas duas organizações reais em produção (ver seção 12). **[BANCO]**

Está publicado em produção na Vercel, com backend Supabase real (não é um protótipo local). **[DEPLOY]**

---

## 2. Escopo funcional (com status de conclusão real)

Legenda de status: ✅ Concluído e verificado em código+banco · 🟡 Parcial/limitado · ⚠️ Apenas estrutura de banco, sem UI · ❌ Mencionado no chat mas não encontrado no código.

| Funcionalidade | Status | Evidência |
|---|---|---|
| Autenticação (login, cadastro, callback) | ✅ | `src/app/(auth)/login`, `cadastro`, `src/app/auth/callback/route.ts` **[CÓDIGO]** |
| Onboarding (criação da organização) | ✅ | `src/app/(auth)/onboarding`, `create_organization()` **[CÓDIGO+BANCO]** |
| Multi-tenant com RLS | ✅ | 18 tabelas com `organization_id`, políticas RLS em `0003_rls.sql`, funções helper `is_org_member`/`is_org_admin`/`can_write_org` **[BANCO]** |
| Super Admin (plataforma) | ✅ | tabela `platform_admins`, rotas `src/app/(app)/super-admin` **[CÓDIGO+BANCO]** |
| Papéis internos (owner/admin/agronomo/tecnico/assistente/viewer) | ✅ | `organization_users.role`, `src/lib/auth/permissions.ts` **[CÓDIGO+BANCO]** |
| Produtores (CRUD) | ✅ | `src/app/(app)/produtores`, tabela `produtores` **[CÓDIGO+BANCO]** |
| Propriedades (CRUD) | ✅ | `src/app/(app)/propriedades`, tabela `propriedades` **[CÓDIGO+BANCO]** |
| Áreas/talhões (CRUD) | ✅ | `src/app/(app)/areas`, tabela `areas` **[CÓDIGO+BANCO]** |
| Safras + planejamento de plantio | ✅ | `src/app/(app)/safras`, tabelas `safras` e `planejamento_plantio` **[CÓDIGO+BANCO]** |
| Visitas (criar) | ✅ | `src/app/(app)/visitas/nova` **[CÓDIGO]** |
| Visitas (editar) | ✅ | `src/app/(app)/visitas/[id]/editar` **[CÓDIGO]** |
| Visitas (excluir) | ✅ | ação de exclusão em `src/lib/actions/visitas.ts` **[CÓDIGO]** |
| Avaliação de área dentro da visita | ✅ | `src/app/(app)/visitas/[id]/areas/[avaliacaoId]`, tabela `avaliacoes_area` **[CÓDIGO+BANCO]** |
| Ocorrências agronômicas — criar | ✅ | `src/app/(app)/visitas/[id]/ocorrencias/nova`, tabela `ocorrencias` **[CÓDIGO+BANCO]** |
| Ocorrências agronômicas — editar | ❌ | Não existe página/rota de edição, apenas criação e exclusão. Confirmado por varredura de `src/app/(app)/visitas` — não há `ocorrencias/[id]/editar`. **[CÓDIGO]** |
| Recomendações técnicas — criar | ✅ | `src/app/(app)/visitas/[id]/recomendacoes/nova`, tabela `recomendacoes` **[CÓDIGO+BANCO]** |
| Recomendações técnicas — editar | ❌ | Mesma situação das ocorrências: só criação e exclusão. **[CÓDIGO]** |
| Fotos (upload, galeria) | ✅ | `src/lib/actions/fotos.ts`, tabela `fotos`, bucket Storage `campoagri` (ver seção 5) **[CÓDIGO+BANCO]** |
| Insumos/custos por visita | ⚠️ | Tabela `insumos_custos` existe no schema (`0001_schema.sql`), com **0 linhas** no banco, e **nenhuma referência em `src/`** fora dos tipos gerados automaticamente. Não há formulário, listagem ou ação para essa entidade. **[CÓDIGO+BANCO]** |
| Relatório de visita em PDF | ✅ | `src/lib/pdf/visit-report-document.tsx` (`@react-pdf/renderer`), rota `src/app/(app)/visitas/[id]/relatorio/route.tsx`, dados via `src/lib/data/visit-report.ts` **[CÓDIGO]** |
| Agenda de visitas | ✅ | `src/app/(app)/agenda`, tabela `agenda_visitas` **[CÓDIGO+BANCO]** |
| Dashboard com KPIs | ✅ | `src/app/(app)/dashboard`, `src/lib/data/dashboard.ts` **[CÓDIGO]** |
| Histórico/timeline de propriedade | ✅ | `src/lib/data/property-history.ts` **[CÓDIGO]** |
| Gestão de usuários/equipe da organização | ✅ | `src/app/(app)/usuarios`, `src/lib/actions/team.ts`, função `find_user_by_email` **[CÓDIGO+BANCO]** |
| Configurações da organização (nome, cor, logo, assinatura) | ✅ | `src/app/(app)/configuracoes`, `src/lib/actions/organization.ts`, coluna `organizations.cor_primaria` **[CÓDIGO+BANCO]** |
| Localização GPS da propriedade + Waze/Maps | ✅ | `src/lib/utils/maps.ts`, campos de latitude/longitude em `propriedades`, botões de navegação nas páginas de propriedade **[CÓDIGO+BANCO]** |
| Botão WhatsApp na tela do produtor | ✅ | `src/lib/utils/whatsapp.ts`, usado em `src/app/(app)/produtores` **[CÓDIGO]** |
| Logs de auditoria | ✅ | tabela `logs_auditoria`, função `log_action()` **[BANCO]** |
| LGPD/CDC — aceite de termos | ✅ | `src/app/(legal)/termos`, `termos/aceitar`, `privacidade`, `src/lib/actions/legal.ts`, colunas `profiles.termos_aceitos_em`/`termos_versao`, gate no middleware **[CÓDIGO+BANCO]** — ver observação na seção 6 sobre cobertura do gate |
| PWA (manifest + service worker) | 🟡 | `public/manifest.webmanifest` e `public/sw.js` existem e funcionam, mas o cache do SW só cobre o app-shell mínimo (sem dados/API), e o `theme_color` do manifest é estático, não reflete a cor dinâmica por organização (ver seção 12). **[CÓDIGO]** |
| Planos de assinatura (trial/individual/profissional/equipe) | ⚠️ | Não há tabela de planos/billing nem integração de pagamento no schema ou no código. A arquitetura multi-tenant está pronta para isso, mas a funcionalidade de planos em si não foi implementada. **[BANCO+CÓDIGO]** |
| Certificados de vacinação / módulo veterinário | ❌ N/A | Este projeto é agronômico, não veterinário. Não existe (e não foi criado) nenhum módulo de vacinação, animais ou certificados sanitários. Qualquer menção a isso em instruções genéricas de handoff não se aplica a este sistema. |

---

## 3. Tecnologias utilizadas

Confirmado em `package.json` **[CÓDIGO]**:

- **Framework**: Next.js `16.2.10` (App Router), React `19.2.4` / React DOM `19.2.4`, TypeScript `^5` (modo strict, ver `tsconfig.json`)
- **Estilo**: Tailwind CSS `^4` com `@tailwindcss/postcss`, sistema de tokens via `@theme inline` em `src/app/globals.css`
- **Backend/dados**: Supabase (`@supabase/supabase-js ^2.110.1`, `@supabase/ssr ^0.12.0`) — Postgres, Auth, Storage, RLS
- **PDF**: `@react-pdf/renderer ^4.5.1`
- **Ícones**: `lucide-react ^1.23.0`
- **Utilitário de classes**: `clsx ^2.1.1` (instalado, porém **sem nenhum import em `src/`** — dependência morta)
- **Formulários/validação**: `react-hook-form ^7.81.0`, `@hookform/resolvers ^5.4.0`, `zod ^4.4.3` — **instalados mas sem nenhum import em `src/`**; todos os formulários do projeto usam Server Actions nativas com `useActionState`, não essas libs
- **Datas**: `date-fns ^4.4.0` — **instalado, sem import em `src/`**
- **Lint**: ESLint `^9` com `eslint-config-next 16.2.10`
- **Deploy**: Vercel (via integração Git, deploy automático) **[DEPLOY]**
- **Fonte**: Geist (via `next/font`, mapeada em `--font-sans`/`--font-mono`)

Scripts disponíveis em `package.json` **[CÓDIGO]**: `dev`, `build`, `start`, `lint`. Não há script de `test`, nem de seed automatizado.

**Aviso importante do `AGENTS.md`** (incorporado via `CLAUDE.md` → `@AGENTS.md`) **[CÓDIGO]**: este projeto usa uma versão do Next.js com mudanças que quebram compatibilidade com o conhecimento de treinamento padrão. Antes de escrever código, ler a documentação relevante em `node_modules/next/dist/docs/` e respeitar avisos de depreciação.

---

## 4. Arquitetura e estrutura do projeto

Estrutura de diretórios confirmada por varredura direta de `src/` **[CÓDIGO]**:

```
Sistema-CampoAgri/
├── middleware.ts                     # wrapper fino chamando updateSession()
├── next.config.ts                    # config padrão, sem customizações
├── tsconfig.json                     # strict, alias @/* -> ./src/*
├── eslint.config.mjs
├── postcss.config.mjs
├── .env.example
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── icons/                        # 192/512/maskable-512, gerados via sharp
├── supabase/
│   ├── migrations/                   # 0001..0009 (ver seção 5)
│   └── seed/seed.sql                 # script manual, não integrado a nenhum script npm
└── src/
    ├── app/
    │   ├── (auth)/                   # login, cadastro, cadastro/confirme, onboarding
    │   ├── (app)/                    # agenda, areas, configuracoes, dashboard, produtores,
    │   │                             # propriedades, relatorios, safras, super-admin, usuarios,
    │   │                             # visitas (+ visitas/[id]/areas/[avaliacaoId], editar,
    │   │                             #   ocorrencias/nova, recomendacoes/nova, relatorio/route.tsx)
    │   ├── (legal)/                  # termos, termos/aceitar, privacidade
    │   ├── auth/callback/route.ts
    │   ├── layout.tsx, page.tsx, globals.css, favicon.ico
    ├── components/
    │   ├── agenda/ areas/ auth/ configuracoes/ dashboard/ layout/ legal/
    │   ├── produtores/ propriedades/ pwa/ safras/ super-admin/ ui/ usuarios/ visitas/
    ├── lib/
    │   ├── actions/    # agenda, areas, auth, fotos, legal, organization, platform,
    │   │                 produtores, propriedades, safras, team, visitas
    │   ├── auth/       # context.ts, permissions.ts
    │   ├── data/       # dashboard.ts, platform.ts, property-history.ts, visit-report.ts
    │   ├── domain/
    │   ├── legal/      # constants.ts (TERMS_UPDATED_AT etc.)
    │   ├── pdf/        # visit-report-document.tsx
    │   ├── supabase/   # client.ts, server.ts, middleware.ts
    │   └── utils/      # cn.ts, color.ts, format.ts, maps.ts, whatsapp.ts
    └── types/database.ts             # tipos gerados automaticamente pelo Supabase
```

**Padrão arquitetural observado** **[CÓDIGO]**:
- Route groups do App Router separam áreas públicas (`(auth)`, `(legal)`) de áreas autenticadas (`(app)`), cada uma com seu próprio `layout.tsx`.
- Mutações usam Server Actions em `src/lib/actions/*.ts`, consumidas via `useActionState` em componentes `"use client"`.
- Leitura de dados para páginas usa funções server-side em `src/lib/data/*.ts`, chamadas diretamente dentro de Server Components.
- `src/lib/auth/context.ts` centraliza a resolução do contexto do usuário logado (organização atual, papel, se é platform admin) — consumido por `AppShell` e pelas páginas.
- Theming dinâmico por organização: `AppShell` (`src/components/layout/app-shell.tsx`) lê `ctx.organization.cor_primaria` e injeta `--primary`/`--primary-dark`/`--primary-foreground` como CSS custom properties inline via `style={themeStyle}`, sobrepondo os tokens estáticos de `globals.css`.

---

## 5. Banco de dados

Projeto Supabase remoto `ynspkydroyncqhswjznm`. 9 migrations aplicadas, **sem drift** entre local e remoto (confirmado via `mcp__Supabase__list_migrations`) **[BANCO]**.

### 5.1 Migrations (ordem de aplicação)

| Arquivo | Conteúdo confirmado |
|---|---|
| `0001_schema.sql` | Cria as 18 tabelas: `platform_admins, organizations, profiles, organization_users, produtores, propriedades, areas, safras, planejamento_plantio, visitas, avaliacoes_area, ocorrencias, fotos, recomendacoes, insumos_custos, relatorios, agenda_visitas, logs_auditoria` |
| `0002_functions.sql` | Funções: `is_platform_admin, user_role_in_org, is_org_member, is_org_admin, can_write_org, create_organization, log_action` |
| `0003_rls.sql` | Políticas RLS em todas as tabelas operacionais |
| `0004_triggers.sql` | Funções `set_updated_at, handle_new_user, protect_last_owner`; triggers `trg_set_updated_at, trg_handle_new_user, trg_protect_last_owner_update, trg_protect_last_owner_delete` |
| `0005_storage.sql` | Bucket de Storage + políticas `campoagri_select_org_members, campoagri_insert_org_members, campoagri_update_org_members, campoagri_delete_org_admins` |
| `0006_function_grants.sql` | Revoga EXECUTE de `anon`/`public` nas funções helper (mantém para `authenticated`) |
| `0007_team_invite_helper.sql` | Função `find_user_by_email` (convite de membros por e-mail) |
| `0008_organization_theme_color.sql` | Adiciona `organizations.cor_primaria text not null default '#1f4d3a'` com `CHECK (cor_primaria ~ '^#[0-9a-f]{6}$')` |
| `0009_terms_acceptance.sql` | Adiciona `profiles.termos_aceitos_em timestamptz`, `profiles.termos_versao text`; reescreve `handle_new_user()` para copiar esses campos de `raw_user_meta_data` |

### 5.2 Modelo de dados — pontos-chave

- **Isolamento multi-tenant**: toda tabela operacional tem `organization_id` referenciando `organizations(id)`, e RLS usa as funções helper (`is_org_member`, `is_org_admin`, `can_write_org`) para restringir acesso por linha — não é um filtro só na camada de aplicação. **[BANCO]**
- **Dois níveis de admin**: `platform_admins` (tabela separada, Super Admin global da plataforma) vs `organization_users.role` (papel por organização: owner/admin/agronomo/tecnico/assistente/viewer). **[BANCO]**
- **Soft delete**: colunas `deleted_at` presentes nas tabelas de entidades de negócio; trigger `protect_last_owner` impede remover/rebaixar o último owner ativo de uma organização. **[BANCO]**
- **Storage**: bucket usado por `fotos`/logo/assinatura da organização, com políticas restringindo select/insert/update a membros da organização e delete a admins. **[BANCO]**
- **Auditoria**: `logs_auditoria` + função `log_action()`.

### 5.3 Variáveis de ambiente necessárias (nomes apenas, sem valores)

Confirmado em `.env.example` e no uso em código **[CÓDIGO]**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (padrão `http://localhost:3000`)
- `SUPABASE_SERVICE_ROLE_KEY` — **documentada mas não utilizada em nenhum arquivo de `src/`** (variável morta/aspiracional; confirmado por grep). Nenhum valor de nenhuma dessas variáveis é exposto neste documento.

### 5.4 Estado dos dados em produção (confirmado por SQL direto)

Existem **duas organizações reais** no banco de produção, não apenas o seed **[BANCO]**:
1. Organização semeada "AgroGestão Técnica" (dados fictícios do `seed.sql`: produtor João Pereira, propriedade Fazenda Santa Clara, 5 áreas, 1 visita finalizada). Essa organização tem **2 safras** no banco (a original "Milho Verão 2026/2027" do seed, mais uma segunda "Milho Verão 26/27" criada em 2026-07-08, provavelmente resíduo de testes manuais/anteriores, não parte do `seed.sql` original).
2. Organização real "RPM ESTRATEGIA E TECNOLOGIA", criada pelo usuário final `irezende136@gmail.com` (Igor Rezende) em 2026-07-10, que completou signup → onboarding → aceite de termos com sucesso em produção.

---

## 6. Regras de negócio

Confirmadas em código/banco **[CÓDIGO+BANCO]**, salvo indicação contrária:

- Um usuário só acessa dados de organizações às quais pertence (`organization_users`), reforçado por RLS, não apenas por lógica de UI.
- O último `owner` ativo de uma organização não pode ser removido nem ter seu papel rebaixado (`protect_last_owner`), evitando organizações órfãs sem administrador.
- Papéis (`owner/admin/agronomo/tecnico/assistente/viewer`) controlam permissões de escrita via `can_write_org`/`is_org_admin`, consumidos tanto em RLS quanto em `src/lib/auth/permissions.ts` no lado da aplicação.
- Todo cadastro de usuário exige aceite dos Termos de Uso e da Política de Privacidade; a versão aceita e o timestamp são gravados em `profiles.termos_versao`/`termos_aceitos_em`, seja no cadastro (via metadata copiada pelo trigger `handle_new_user`) ou depois, via `/termos/aceitar` para usuários já existentes cuja versão ficou desatualizada.
  - **Observação sobre cobertura do gate**: o middleware (`src/lib/supabase/middleware.ts`) hoje só controla acesso autenticado vs público (`PUBLIC_PATHS`); a página `termos/aceitar` existe e a Server Action `acceptTermsAction` grava a aceitação, mas **não confirmei nesta análise, lendo o middleware, um redirecionamento forçado para `/termos/aceitar` quando `termos_versao` está desatualizada** — isso precisa ser verificado por quem assumir o projeto antes de considerar o gate de conformidade LGPD como bloqueio garantido em todas as rotas. Ver seção 12.
- Relatórios de visita em PDF são gerados sob demanda (`route.tsx` em `visitas/[id]/relatorio`), a partir de dados carregados em `src/lib/data/visit-report.ts`.
- **Regra sobre certificados/comprovantes — não aplicável a este projeto**: o sistema não possui nenhum módulo veterinário, de vacinação ou de laudo sanitário. Não existe, portanto, nenhum documento no sistema que precise da ressalva de que um certificado comprova apenas aplicação/registro (e não exame clínico ou ausência de doença) — essa regra genérica não se aplica a nenhuma funcionalidade real deste código e não deve ser inventada ou adicionada especulativamente.

---

## 7. Usuários, acessos e permissões

- **Super Admin (plataforma)**: registrado em `platform_admins`, acessa `src/app/(app)/super-admin`, enxerga dados entre organizações (visão de plataforma). **[CÓDIGO+BANCO]**
- **Owner (organização)**: dono da organização, único papel protegido contra remoção total (`protect_last_owner`). **[BANCO]**
- **Demais papéis internos**: `admin`, `agronomo`, `tecnico`, `assistente`, `viewer`, com permissões de escrita/leitura diferenciadas via `can_write_org`/`is_org_admin` e checados em `src/lib/auth/permissions.ts`. **[CÓDIGO+BANCO]**
- Convite de membros para uma organização usa a função `find_user_by_email` (`0007_team_invite_helper.sql`) e a Server Action em `src/lib/actions/team.ts`. **[CÓDIGO+BANCO]**
- Contas de teste conhecidas: usuário semeado `demo@campoagri.app` (senha não reproduzida aqui por instrução de sigilo — está apenas em `supabase/seed/seed.sql`, que não deve ser tratado como documentação pública) e o usuário real `irezende136@gmail.com`.

---

## 8. Interface e padrão visual

Tokens de design confirmados em `src/app/globals.css` **[CÓDIGO]**:

- Paleta base ("rural premium"): fundo `#faf7f0` (bege), texto `#1f2421` (grafite escuro), cartões brancos `#ffffff`, bordas `#e3ddcd`, primário verde escuro `#1f4d3a` (com variante escura `#163728`), destaque âmbar-terra `#c88a2e`, mais cores semânticas `success #2f8f4e`, `warning #c88a2e`, `danger #b33f3f`, `info #2f6a8f`.
- Os tokens são mapeados para o Tailwind v4 via bloco `@theme inline` (ex.: `--color-background`, `--color-primary` etc.), permitindo uso direto de classes como `bg-primary`, `text-muted-foreground`.
- **Personalização por organização**: `organizations.cor_primaria` permite que cada organização substitua a cor primária padrão; `AppShell` injeta essa cor como CSS custom properties no elemento raiz, com utilitários `darkenHex`/`readableTextColor` (`src/lib/utils/color.ts`) para gerar a variante escura e escolher a cor de texto legível sobre o destaque.
- Layout responsivo: sidebar fixa em telas `lg:`, bottom navigation + FAB ("Nova visita") em telas menores — ambos implementados como componentes `"use client"` (`nav-lists.tsx`) para evitar o bug de serialização RSC (ver seção 10).
- Fonte: Geist (sans e mono) via `next/font`.

---

## 9. Funcionalidades já desenvolvidas (mapeamento funcionalidade → arquivos → tabelas)

Ver tabela completa na seção 2. Resumo dos módulos com implementação de ponta a ponta (UI + Server Action + tabela + RLS) verificada em código: autenticação/onboarding, produtores, propriedades (com GPS/Waze/Maps), áreas, safras/planejamento, visitas (criar/editar/excluir), avaliação de área, ocorrências (criar/excluir), recomendações (criar/excluir), fotos, relatório PDF, agenda, dashboard, histórico de propriedade, gestão de usuários/equipe, configurações (nome/cor/logo/assinatura), WhatsApp no produtor, aceite de termos LGPD/CDC, Super Admin, PWA básico.

---

## 10. Histórico das principais decisões técnicas

1. **Multi-tenant desde o início via RLS**, não filtro em aplicação — decisão estrutural do spec original, implementada com funções `SECURITY DEFINER` reutilizadas dentro das próprias políticas RLS (`is_org_member`, `is_org_admin`, `can_write_org`), para evitar que qualquer bug de query na aplicação vaze dados entre organizações.
2. **Dois níveis de admin desacoplados** (`platform_admins` como tabela própria, separada do papel `owner` dentro de uma organização), permitindo que o dono da plataforma não precise pertencer a nenhuma organização de cliente.
3. **Server Actions nativas + `useActionState`** em vez de `react-hook-form`/`zod` (apesar de instalados) — decisão de fato observável no código, não documentada explicitamente em nenhum commit, portanto tratada aqui como **[INFERÊNCIA]** a partir do padrão consistente em todos os formulários encontrados.
4. **Theming dinâmico via CSS custom properties injetadas no client**, em vez de gerar CSS por tenant em build-time — permite trocar a cor da organização sem rebuild.
5. **PDF gerado no servidor** com `@react-pdf/renderer`, com estilos parametrizados por cor primária (`createStyles(primaryColor)`), para que o relatório reflita a identidade visual da organização.
6. **Wrappers client dedicados para listas de navegação** (`nav-lists.tsx`) — decisão corretiva após o bug de serialização RSC (detalhado abaixo), tornando explícito que ícones/componentes do Lucide nunca cruzam a fronteira Server→Client como prop.

---

## 11. Problemas encontrados e soluções aplicadas

1. **Exclusão acidental de `.git`** durante a montagem inicial do projeto (um `rm -rf` durante cópia de arquivos apagou o histórico git, que na época tinha zero commits). Corrigido com `git init` + re-adição do remote `origin` + checkout da branch `claude/agronomy-saas-platform-fpxpei`. Nenhum trabalho foi perdido porque não havia commits anteriores, mas é registrado aqui como "quase-incidente" para reforçar cautela com comandos destrutivos em scripts de scaffolding.
2. **Funções helper de RLS com permissão excessiva**: migrations iniciais deixaram `is_org_member` e afins executáveis por `anon`. Corrigido em `0006_function_grants.sql`, revogando EXECUTE de `anon`/`public` e mantendo apenas para `authenticated` (necessário porque as próprias políticas RLS invocam essas funções no contexto do papel que faz a query).
3. **Erro de TypeScript com chave computada em `.update()` do Supabase**: `updateOrganizationImageAction` usava `{ [field]: storagePath }`; os tipos estritos gerados pelo Supabase rejeitavam chave dinâmica. Corrigido com um ternário explícito construindo `{ logo_url: storagePath }` ou `{ assinatura_url: storagePath }`.
4. **Bug crítico de produção — serialização RSC**: `/dashboard` e todas as páginas autenticadas retornavam HTTP 500 (confirmado via logs de runtime da Vercel), com erro "Functions cannot be passed directly to Client Components...". Causa raiz: `AppShell` (Server Component) mapeava `NAV_ITEMS`/`NAV_ITEMS_SECONDARY`/`BOTTOM_NAV_ITEMS` (cada item contendo um ícone Lucide, ou seja, uma referência de função/componente) e passava o objeto inteiro como prop para componentes `"use client"` — o que o Next.js proíbe. Corrigido criando `src/components/layout/nav-lists.tsx`, com componentes `"use client"` (`PrimarySidebarNav`, `SecondarySidebarNav`, `BottomNav`) que importam as listas diretamente, resolvendo tudo dentro do bundle client sem cruzar a fronteira como prop. Verificado pós-fix via novo deploy + `get_runtime_errors`/`get_runtime_logs` sem novos erros.
5. **Falso alarme de "erro de servidor"** reportado pelo usuário via screenshot: a URL usada (`sistema-campo-agri-6rr05k5ty-rpmestrategiaetecnologia.vercel.app`) era o **primeiro deploy com hash fixo**, anterior à correção do bug de RSC acima — URLs de deploy com hash na Vercel são snapshots imutáveis e nunca são atualizadas por novos pushes. O alias de produção estável foi confirmado saudável.

---

## 12. Problemas e riscos pendentes (não corrigidos nesta etapa, apenas documentados)

Por instrução explícita, **nada nesta seção foi corrigido** — apenas identificado e registrado.

1. **`auth_leaked_password_protection` desabilitado** nas configurações de Auth do Supabase (advisory de segurança, nível WARN). Recomenda-se habilitar.
2. **Políticas RLS com re-avaliação por linha**: em `profiles` e `organization_users` (políticas `profiles_select_self_or_org`, `profiles_update_self`, `profiles_insert_self`, `org_users_select`), as chamadas a `auth.<função>()` são feitas diretamente em vez de `(select auth.<função>())`, o que causa reavaliação da função a cada linha (advisory de performance, lint `auth_rls_initplan`). Impacto cresce com o volume de dados.
3. **Chaves estrangeiras sem índice** em praticamente todas as tabelas (advisories de performance, nível INFO) — baixo risco no volume atual, mas relevante ao escalar.
4. **Índices não utilizados** em algumas tabelas (INFO) — esperado no volume atual, não urgente.
5. **Gate de aceite de termos possivelmente incompleto**: não há confirmação, nesta análise, de que o middleware força redirecionamento para `/termos/aceitar` quando a versão aceita está desatualizada para usuários já logados — a página e a Server Action existem, mas o "enforcement" automático em todas as rotas autenticadas não foi verificado no código do middleware (ver seção 6). Precisa ser auditado antes de considerar a conformidade LGPD "garantida" em 100% dos fluxos.
6. **`insumos_custos` sem UI**: tabela existe, vazia, sem nenhuma tela, ação ou referência de aplicação.
7. **Sem edição de ocorrências/recomendações**: apenas criação e exclusão; para corrigir um registro após salvo, o usuário precisa excluir e recriar.
8. **Dependências mortas no `package.json`**: `react-hook-form`, `zod`, `clsx`, `date-fns`, `@hookform/resolvers` instaladas sem nenhum import em `src/`.
9. **`manifest.webmanifest` com `theme_color` estático** (`#1f4d3a`), não reflete a cor dinâmica por organização introduzida depois.
10. **Sem forma automatizada de rodar o seed**: `supabase/seed/seed.sql` não está integrado a nenhum script npm nem a configuração de CLI do Supabase local; foi executado manualmente via MCP (`execute_sql`).
11. **`SUPABASE_SERVICE_ROLE_KEY` documentada mas não usada** em nenhum arquivo de código — variável de ambiente morta/aspiracional.
12. **Dados residuais de teste na organização semeada**: uma segunda safra "Milho Verão 26/27" (criada 2026-07-08) além da safra original do `seed.sql`, provavelmente de testes manuais anteriores.
13. **Nenhum módulo de planos/billing implementado** apesar do spec original mencionar planos trial/individual/profissional/equipe — a arquitetura multi-tenant suporta isso, mas não há tabela nem lógica de cobrança/limites por plano.
14. **Restrição do ambiente de sandbox** (não é bug do código): chamadas HTTP diretas do container de desenvolvimento para `*.supabase.co` e para a API da Vercel são bloqueadas pelo proxy do agente (confirmado por erro explícito de proxy). Isso significa que `npm run dev` dentro deste sandbox específico não consegue autenticar de fato contra o Supabase real — um desenvolvedor numa máquina normal ou em CI não teria essa limitação. Testes de integração real foram feitos via ferramentas MCP (que rodam fora do sandbox), não via `npm run dev` local.

---

## 13. Estado atual exato

- **Último commit**: `f6dbc86` — "Add aceite de Termos de Uso e Politica de Privacidade (LGPD/CDC)"
- **Branch**: `claude/agronomy-saas-platform-fpxpei`
- **Árvore de trabalho**: limpa, sem alterações pendentes (`git status` vazio) no momento da criação deste documento
- **Deploy de produção**: ativo na Vercel, alias estável (não usar URLs de deploy com hash específico como referência permanente)
- **Banco de produção**: projeto Supabase `ynspkydroyncqhswjznm`, 9 migrations aplicadas sem drift, 2 organizações reais com dados (uma semeada/demo, uma real de usuário final)
- **Nenhum arquivo funcional foi alterado durante a criação deste documento** — apenas leitura de código, consultas SQL somente-leitura e consultas de advisors/logs via MCP.

---

## 14. Próximos passos priorizados

**P0 — Crítico / bloqueante de conformidade ou segurança**
1. Auditar e, se necessário, corrigir o enforcement do gate de aceite de termos no middleware para todas as rotas autenticadas (item 12.5).
2. Habilitar `auth_leaked_password_protection` no Supabase Auth (item 12.1).

**P1 — Alto impacto, baixo risco**
3. Corrigir as 4 políticas RLS com `auth_rls_initplan` em `profiles`/`organization_users`, trocando `auth.fn()` por `(select auth.fn())` (item 12.2).
4. Decidir o destino de `insumos_custos`: implementar UI mínima ou remover a tabela do schema, para não deixar uma entidade "fantasma" (item 12.6).

**P2 — Melhoria funcional esperada pelo usuário**
5. Implementar edição de ocorrências e recomendações (hoje só criar/excluir) (item 12.7).
6. Atualizar `manifest.webmanifest` para refletir a cor dinâmica da organização, ou documentar que o `theme_color` é intencionalmente fixo (item 12.9).

**P3 — Limpeza técnica / dívida menor**
7. Remover dependências não usadas (`react-hook-form`, `zod`, `clsx`, `date-fns`, `@hookform/resolvers`) ou passar a utilizá-las de fato (item 12.8).
8. Adicionar índices nas chaves estrangeiras mais consultadas conforme o volume de dados crescer (item 12.3).
9. Automatizar a execução do seed (script npm ou configuração de CLI do Supabase local) (item 12.10).
10. Limpar dados residuais de teste na organização semeada e decidir se `SUPABASE_SERVICE_ROLE_KEY` deve ser removida do `.env.example` ou passar a ser usada intencionalmente (itens 12.11, 12.12).

---

## 15. Procedimento para executar o projeto

Baseado apenas nos scripts e arquivos confirmados em `package.json`/`.env.example` **[CÓDIGO]**:

```bash
npm install
cp .env.example .env.local   # preencher com valores reais do projeto Supabase (não versionar)
npm run dev                  # ambiente de desenvolvimento local
npm run build                # build de produção
npm run start                # servir build de produção
npm run lint                 # ESLint
```

Variáveis obrigatórias em `.env.local` (nomes apenas, ver seção 5.3): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`.

Schema do banco: as migrations em `supabase/migrations/0001` a `0009` devem ser aplicadas, em ordem, contra um projeto Supabase (via CLI do Supabase ou via MCP `apply_migration`). Não há configuração de CLI local (`supabase/config.toml`) neste repositório — a aplicação de migrations foi feita manualmente via MCP durante o desenvolvimento.

**Nota de ambiente**: dentro deste sandbox específico de desenvolvimento, `npm run dev` não consegue alcançar `*.supabase.co` por política de rede do proxy — isso é uma limitação do ambiente de execução, não do projeto. Num ambiente normal (máquina local, CI, ou a própria Vercel), essa restrição não existe.

---

## 16. Checklist de validação

- [ ] `npm install` sem erros
- [ ] `npm run lint` sem erros
- [ ] `npm run build` sem erros
- [ ] Login com usuário existente funciona e redireciona para `/dashboard`
- [ ] Cadastro de novo usuário → onboarding → criação de organização funciona
- [ ] Aceite de termos é exigido e gravado (`profiles.termos_aceitos_em`/`termos_versao`) — **conferir se é realmente bloqueante em todas as rotas, ver item 12.5**
- [ ] CRUD de produtores, propriedades, áreas, safras funcionando
- [ ] Criar, editar e excluir uma visita
- [ ] Adicionar avaliação de área, ocorrência e recomendação a uma visita
- [ ] Upload de foto em uma visita
- [ ] Geração do relatório de visita em PDF sem erros
- [ ] Botão de WhatsApp na tela do produtor abre com número correto
- [ ] Botões de Waze/Maps na propriedade abrem com coordenadas corretas
- [ ] Alterar cor primária e logo da organização em Configurações reflete no `AppShell` e no PDF
- [ ] Usuário sem permissão de admin não consegue executar ações restritas (testar RLS/permissions)
- [ ] Super Admin consegue acessar `/super-admin` e usuário comum não consegue
- [ ] `mcp__Supabase__get_advisors` (security e performance) revisado antes de qualquer nova feature em produção

---

## 17. Instruções obrigatórias para o próximo Claude Code

- Leia integralmente este documento antes de modificar o projeto.
- Não repita trabalho já feito; confirme sempre no código antes de assumir que algo não existe.
- Não presuma que uma funcionalidade mencionada em conversas anteriores foi implementada; verifique diretamente nos arquivos e no banco de dados.
- Preserve os padrões arquiteturais e de nomenclatura já estabelecidos no projeto.
- Não introduza dependências, frameworks ou bibliotecas não previstas sem necessidade clara.
- Não altere regras de negócio existentes sem solicitação explícita.
- Não remova soft delete, RLS, ou máscaras de segurança já implementadas.
- Documente novamente qualquer mudança relevante ao final do trabalho, atualizando este handoff se necessário.
- Mantenha consistência de idioma (português) em toda a interface e documentação voltada ao usuário final.
- Priorize sempre a integridade dos dados e a segurança da informação.
- Use este documento como fonte de verdade, mas revalide tudo o que for crítico diretamente no código antes de agir.
- Pergunte apenas quando existir uma decisão de negócio impossível de inferir a partir deste documento, do código ou do histórico do projeto.

---

## 18. Prompt pronto para colar em um novo chat

```
Estou continuando o desenvolvimento do Sistema CampoAgri, um SaaS multi-tenant em
português para engenheiros agrônomos gerenciarem visitas técnicas a propriedades
rurais (Next.js 16 + React 19 + TypeScript + Tailwind v4 + Supabase/Postgres com RLS,
deploy na Vercel).

Antes de qualquer alteração, leia o arquivo PROJECT_HANDOFF.md na raiz do repositório
por completo. Ele contém o estado real e verificado do projeto (não confie em resumos
anteriores de chat): escopo funcional com status de conclusão por funcionalidade,
arquitetura, modelo de banco de dados, regras de negócio, histórico de decisões e
bugs corrigidos, riscos pendentes (seção 12) e próximos passos priorizados P0-P3
(seção 14).

Branch de trabalho: claude/agronomy-saas-platform-fpxpei.

Antes de considerar qualquer funcionalidade "pronta", confirme diretamente no código
e, quando aplicável, no banco de dados via ferramentas MCP do Supabase — não confie
apenas no que está escrito em documentos ou em conversas anteriores.

[Descreva aqui a tarefa específica que você quer que eu faça a seguir]
```
