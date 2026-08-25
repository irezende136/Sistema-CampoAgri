# PROJECT_HANDOFF.md — Sistema CampoAgri

> Documento de transição de contexto. Gerado por análise direta do código-fonte, das migrations SQL, do banco de dados remoto (via MCP Supabase) e do deploy remoto (via MCP Vercel), não apenas do histórico de chat. Última atualização: **2026-08-25**, commit `a27b387` (branch `claude/agronomy-saas-platform-fpxpei`).
>
> **Leia a seção 4 antes de escrever código.** Em 2026-08-25 o app passou de "Server Components lendo o Postgres" para **local-first**: as telas leem e gravam num banco local (IndexedDB) e uma fila sincroniza com o Supabase. Quase todas as Server Actions foram removidas. Padrões antigos de mutação não se aplicam mais.
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
| Visitas (excluir) | ✅ | `excluirVisitaLocal` em `src/lib/offline/visita-actions.ts` (exclusão lógica) **[CÓDIGO]** |
| Avaliação de área dentro da visita | ✅ | `src/app/(app)/visitas/[id]/areas/[avaliacaoId]`, tabela `avaliacoes_area` **[CÓDIGO+BANCO]** |
| Ocorrências agronômicas — criar | ✅ | `src/app/(app)/visitas/[id]/ocorrencias/nova`, tabela `ocorrencias` **[CÓDIGO+BANCO]** |
| Ocorrências agronômicas — editar | ✅ | `src/components/visitas/ocorrencia-page.tsx` (criar e editar na mesma tela), gravando via `visita-actions.ts`. Só enquanto a visita está em `rascunho`. **[CÓDIGO]** |
| Recomendações técnicas — criar | ✅ | `src/app/(app)/visitas/[id]/recomendacoes/nova`, tabela `recomendacoes` **[CÓDIGO+BANCO]** |
| Recomendações técnicas — editar | ✅ | `src/components/visitas/recomendacao-page.tsx`, mesma regra de `rascunho`. **[CÓDIGO]** |
| Fotos (upload, galeria) | ✅ | `src/components/visitas/visita-fotos.tsx`. **Funciona offline**: o arquivo fica no IndexedDB e sobe para o Storage na sincronização; até lá a miniatura lê o arquivo local e mostra o aviso "no aparelho". **[CÓDIGO+BANCO]** |
| Insumos/custos por safra | ✅ | Seção "Insumos e custos" em `src/components/safras/safras-pages.tsx`. Calcula `custo_ha` (quantidade × preço) e `custo_total` (custo_ha × área) automaticamente. Reaproveita as políticas RLS de `0003_rls.sql`. **[CÓDIGO+BANCO]** |
| Relatório de visita em PDF | ✅ | `src/lib/pdf/visit-report-document.tsx` (`@react-pdf/renderer`), rota `src/app/(app)/visitas/[id]/relatorio/route.tsx`, dados via `src/lib/data/visit-report.ts` **[CÓDIGO]** |
| Agenda de visitas | ✅ | `src/app/(app)/agenda`, tabela `agenda_visitas` **[CÓDIGO+BANCO]** |
| Dashboard com KPIs | ✅ | `src/app/(app)/dashboard`, `src/lib/data/dashboard.ts`. Inclui central de alertas (visitas atrasadas, recomendações vencidas), gráfico de visitas por mês e card "A receber". **Ainda server-side** — exige conexão. **[CÓDIGO]** |
| Histórico/timeline de propriedade | ✅ | `src/components/propriedades/historico-page.tsx`, lendo visitas + relatórios do banco local **[CÓDIGO]** |
| Gestão de usuários/equipe da organização | ✅ | `src/app/(app)/usuarios`, `src/lib/actions/team.ts`, função `find_user_by_email` **[CÓDIGO+BANCO]** |
| Configurações da organização (nome, cor, logo, assinatura) | ✅ | `src/app/(app)/configuracoes`, `src/lib/actions/organization.ts`, coluna `organizations.cor_primaria` **[CÓDIGO+BANCO]** |
| Localização GPS da propriedade + Waze/Maps | ✅ | `src/lib/utils/maps.ts`, campos de latitude/longitude em `propriedades`, botões de navegação nas páginas de propriedade **[CÓDIGO+BANCO]** |
| Botão WhatsApp na tela do produtor | ✅ | `src/lib/utils/whatsapp.ts`, usado em `src/app/(app)/produtores` **[CÓDIGO]** |
| Logs de auditoria | ✅ | tabela `logs_auditoria`, função `log_action()` **[BANCO]** |
| LGPD/CDC — aceite de termos | ✅ | `src/app/(legal)/termos`, `termos/aceitar`, `privacidade`, `src/lib/actions/legal.ts`, colunas `profiles.termos_aceitos_em`/`termos_versao`, gate no middleware **[CÓDIGO+BANCO]** — ver observação na seção 6 sobre cobertura do gate |
| PWA + service worker | ✅ | `public/sw.js` v3: cache-first para assets e fotos, network-first com fallback para navegações, página `/offline`, banner de "sem conexão". `sw.js` excluído do matcher do middleware — servido com redirect, o registro do service worker **falha** (bug corrigido em 2026-08-25). **[CÓDIGO]** |
| **Modo offline completo (local-first)** | ✅ | Todo o trabalho de campo cria/edita/exclui sem sinal: visitas, ocorrências, recomendações, avaliações, fotos, produtores, propriedades, áreas, safras, insumos, agenda e financeiro. Camada em `src/lib/offline/` (ver seção 4). **Verificado em navegador real** apenas na camada local; o ciclo completo contra o Postgres **nunca foi testado** (ver seção 12). **[CÓDIGO]** |
| Financeiro (cobrança da visita) | ✅ | Tabela `financeiro_visitas` (migration `0011`), seção dentro da visita + página `/financeiro` com filtros e totais. Desconto percentual ou fixo, nunca deixa o total negativo (regra herdada do CampoVet). **[CÓDIGO+BANCO]** |
| Recuperação de senha por e-mail | ✅ | `/esqueci-senha` → link do Supabase → `/redefinir-senha`. A tela de confirmação é a mesma exista ou não conta com aquele e-mail, para não permitir descobrir quais e-mails estão cadastrados. **Depende de configurar a URL do deploy em Authentication → URL Configuration.** **[CÓDIGO]** |
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
- **Armazenamento local**: IndexedDB via camada própria em `src/lib/offline/idb.ts` — **sem dependência externa** (nada de Dexie/idb)
- **Utilitário de classes**: `clsx ^2.1.1` (instalado, porém **sem nenhum import em `src/`** — dependência morta)
- **Formulários/validação**: `react-hook-form ^7.81.0`, `@hookform/resolvers ^5.4.0`, `zod ^4.4.3` — **instalados mas sem nenhum import em `src/`**; os formulários usam `FormData` nativo com o hook próprio `useFormSubmit`
- **Datas**: `date-fns ^4.4.0` — **instalado, sem import em `src/`**
- **Lint**: ESLint `^9` com `eslint-config-next 16.2.10`
- **Deploy**: Vercel (via integração Git, deploy automático) **[DEPLOY]**
- **Fonte**: Geist (via `next/font`, mapeada em `--font-sans`/`--font-mono`)

Scripts disponíveis em `package.json` **[CÓDIGO]**: `dev`, `build`, `start`, `lint`. Não há script de `test`, nem de seed automatizado.

**Aviso importante do `AGENTS.md`** (incorporado via `CLAUDE.md` → `@AGENTS.md`) **[CÓDIGO]**: este projeto usa uma versão do Next.js com mudanças que quebram compatibilidade com o conhecimento de treinamento padrão. Antes de escrever código, ler a documentação relevante em `node_modules/next/dist/docs/` e respeitar avisos de depreciação.

---

## 4. Arquitetura e estrutura do projeto

### 4.1 Arquitetura local-first (mudança estrutural de 2026-08-25)

O app é usado por agrônomos **no campo, onde o sinal falha**. Por isso deixou de ser
"Server Components lendo o Postgres" e passou a ser **local-first**:

```
  tela (client component)
        │  lê/grava
        ▼
  IndexedDB (cópia local da organização)  ──┐
        │  toda escrita também enfileira    │  useLiveQuery re-renderiza
        ▼                                   │  quando algo muda
  outbox (fila ordenada de alterações)      │
        │  quando há conexão                │
        ▼                                   │
  Supabase Postgres (RLS)  ─── pull delta ──┘
```

**Regras que sustentam o desenho** (não quebrar sem entender o motivo):

- **IDs são gerados no cliente** (`crypto.randomUUID()` em `repo.newId()`), não pelo banco.
  É o que permite criar uma visita offline e, em seguida, uma ocorrência que referencia
  essa visita — a FK já existe antes de qualquer contato com o servidor.
- **A fila preserva a ordem de inserção** (chave autoincremental do IndexedDB). A ordem
  carrega as dependências: pai antes de filho. `push()` **para na primeira falha**, porque
  os itens seguintes podem depender do que falhou.
- **Insert sobe como `upsert`** (`onConflict: "id"`). Se a gravação chegou ao servidor mas
  a resposta se perdeu, reenviar não pode duplicar.
- **Update envia só os campos alterados.** Se outra pessoa mexeu em campos diferentes do
  mesmo registro, as duas edições convivem em vez de uma apagar a outra.
- **Conflito entre aparelhos: última escrita vence**, comparando `updated_at`. Se a versão
  do servidor for mais nova, a local é descartada. (Mesma regra do CampoVet.)
- **A descida é por delta**, usando `updated_at` como marca d'água por tabela. **Toda tabela
  sincronizada precisa ter `updated_at` + o trigger `trg_set_updated_at`** — `relatorios` não
  tinha e isso quebraria o ciclo inteiro; corrigido na migration `0012`.
- **Exclusão é sempre lógica** (`deleted_at`), nunca `DELETE` físico — inclusive na fila.
- **Logout apaga o banco local** (`wipeOfflineDb`) além dos caches de página, para não deixar
  dados de uma conta acessíveis a quem usar o mesmo aparelho depois.

**Ao adicionar uma tabela à sincronização**: inclua o nome em `SYNCED_TABLES`
(`src/lib/offline/idb.ts`), **suba o `DB_VERSION`** — sem isso o novo armazenamento não é
criado nos aparelhos que já têm o app — e confirme que a tabela tem `updated_at` e trigger.

### 4.2 Estrutura de diretórios

```
Sistema-CampoAgri/
├── middleware.ts                     # wrapper chamando updateSession(); exclui sw.js do matcher
├── public/
│   ├── manifest.webmanifest
│   ├── sw.js                         # service worker v3 (cache de páginas/assets/fotos)
│   └── icons/
├── supabase/migrations/              # 0001..0012 (ver seção 5)
└── src/
    ├── app/
    │   ├── (auth)/                   # login, cadastro, esqueci-senha, redefinir-senha, onboarding
    │   ├── (app)/                    # telas autenticadas — hoje quase todas são cascas finas
    │   │                             # que renderizam um client component de components/
    │   ├── (legal)/                  # termos, privacidade
    │   ├── offline/                  # página de fallback do service worker (pública)
    │   └── auth/callback/route.ts
    ├── components/
    │   ├── offline/                  # sync-provider, sync-status, org-context, estado-lista
    │   ├── agenda/ areas/ auth/ configuracoes/ dashboard/ financeiro/ layout/ legal/
    │   ├── produtores/ propriedades/ pwa/ safras/ super-admin/ ui/ usuarios/ visitas/
    ├── lib/
    │   ├── offline/                  # ⬅ o coração da arquitetura atual
    │   │   ├── idb.ts                # IndexedDB, SYNCED_TABLES, DB_VERSION, wipeOfflineDb
    │   │   ├── outbox.ts             # fila de alterações pendentes
    │   │   ├── sync.ts               # pull (delta) + push + upload de fotos
    │   │   ├── repo.ts               # API local-first: listAll/getById/create/update/remove
    │   │   ├── hooks.ts              # useLiveQuery
    │   │   ├── events.ts             # notificação de mudança local
    │   │   ├── use-form-submit.ts    # substitui useActionState nos formulários
    │   │   ├── visita.ts             # join manual do fluxo de visita
    │   │   ├── visita-actions.ts     # operações do fluxo de visita
    │   │   └── cadastros.ts          # operações de produtor/propriedade/área/safra/agenda
    │   ├── actions/                  # sobraram: auth, legal, organization, platform, team
    │   ├── auth/                     # context.ts, permissions.ts
    │   ├── data/                     # dashboard.ts, platform.ts, visit-report.ts
    │   ├── domain/ legal/ pdf/ supabase/ utils/
    └── types/database.ts
```

### 4.3 Padrões atuais

- **Mutação**: componente cliente → função de `lib/offline/*` → grava no IndexedDB e enfileira.
  **Não criar novas Server Actions para dados operacionais** — elas gravariam direto no servidor
  e o app se comportaria de forma diferente dependendo da tela. As Server Actions que restam
  cobrem o que não faz sentido offline: autenticação, aceite de termos, configurações da
  organização, equipe e super admin.
- **Leitura**: `useLiveQuery(consulta, deps)` lê do IndexedDB e refaz a leitura sozinho quando
  algo muda — seja edição do usuário ou dados recém-baixados.
- **Estado de lista**: usar `<EstadoLista>` em vez de `<EmptyState>` direto. Ele distingue
  "vazio de verdade" de "ainda não sincronizado" e de "navegador bloqueando o armazenamento" —
  mostrar "nenhum registro" quando a sincronização falhou faz o usuário achar que perdeu dados.
- **Contexto**: `useOrgCtx()` dá organização, usuário e papel no cliente (permissões continuam
  valendo — `canDelete(ctx.role)`); `useSync()` dá estado da fila e dispara sincronização.
- **Rotas em `(app)`** são cascas finas: recebem `params` e renderizam o client component.
- **Theming por organização** segue como antes, via CSS custom properties injetadas no `AppShell`.

---

## 5. Banco de dados

Projeto Supabase remoto `ynspkydroyncqhswjznm`. **12 migrations** aplicadas, sem drift entre local e remoto **[BANCO]**.

> **Regra para novas tabelas sincronizadas**: toda tabela que entrar em `SYNCED_TABLES` precisa ter `updated_at` **e** o trigger `trg_set_updated_at`. A sincronização usa essa coluna como marca d'água; sem ela a consulta falha e **nenhuma** tabela desce (foi o caso de `relatorios`, corrigido na `0012`).

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
| `0010_rls_initplan_fix.sql` | Recria `org_users_select`, `profiles_insert_self`, `profiles_update_self`, `profiles_select_self_or_org` trocando `auth.uid()` por `(select auth.uid())` (corrige advisory `auth_rls_initplan`) |
| `0011_financeiro_visitas.sql` | Cria `financeiro_visitas` (cobrança do serviço técnico: valor, desconto percentual ou fixo, status de pagamento, forma de pagamento), com 4 políticas RLS por organização e trigger de `updated_at` |
| `0012_relatorios_updated_at.sql` | Adiciona `updated_at`/`updated_by` e o trigger em `relatorios` — era a única tabela operacional sem eles, o que impedia incluí-la na sincronização offline |

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
  - **Cobertura do gate — auditada e confirmada em 2026-07-11**: o enforcement não está no middleware, e sim em `requireTermsAccepted()` (`src/lib/auth/context.ts`), chamada dentro de `requireOrgContext()`. Essa função é invocada por: (1) `src/app/(app)/layout.tsx`, o layout compartilhado por **todas** as rotas do grupo `(app)` — incluindo `super-admin/*`, já que essas páginas também estão aninhadas em `(app)`; (2) `src/app/(auth)/onboarding/page.tsx`, diretamente; (3) praticamente todas as Server Actions em `src/lib/actions/*.ts` (confirmado por contagem de chamadas vs. funções exportadas em cada arquivo); (4) o único outro route handler autenticado, `visitas/[id]/relatorio/route.tsx`. `acceptTermsAction` (em `legal.ts`) e as ações de `auth.ts` são intencionalmente as únicas exceções, pois precisam funcionar antes do aceite existir. **Gap residual (corrigido em 2026-07-11)**: as duas Server Actions de `src/lib/actions/platform.ts` (`updateOrgStatusAction`, `updateOrgPlanAction`) chamavam apenas `requirePlatformAdmin()`, sem `requireTermsAccepted()`. Corrigido adicionando `await requireTermsAccepted();` no início de ambas as funções.
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

## 12. Problemas e riscos pendentes

### 🔴 O mais importante

1. **O ciclo completo de sincronização nunca foi testado contra o Postgres.** A camada local foi
   verificada em navegador real (uuid no cliente, gravação no IndexedDB, entrada na fila, ordem
   das dependências preservada), mas **nenhum registro criado offline foi visto chegando ao
   banco**. O sandbox de desenvolvimento bloqueia `*.supabase.co` no proxy, então esse teste só
   pode ser feito no deploy. **Fazer antes de entregar a um agrônomo em campo** — roteiro na
   seção 16.
2. **`auth_leaked_password_protection` desabilitado** no Supabase Auth (advisory WARN). Exige o
   Dashboard (Authentication → Providers → Email); não há ferramenta MCP para isso.
3. **URL de redirecionamento do Auth precisa estar configurada** para a recuperação de senha
   funcionar: Site URL e Redirect URL (`/auth/callback`) em Authentication → URL Configuration,
   e `NEXT_PUBLIC_SITE_URL` na Vercel. Sem isso o link do e-mail aponta para `localhost:3000`.

### 🟠 Limites conhecidos da arquitetura offline

4. **A primeira sincronização baixa a organização inteira** (limite de 2000 registros por tabela).
   No volume atual é tranquilo; para uma organização com milhares de visitas e fotos, a primeira
   carga fica lenta e pesada no celular. Caminho quando chegar lá: limitar por período
   (ex.: últimos 6 meses) em vez de trazer tudo.
5. **Conflito é resolvido por "última escrita vence"**, sem aviso ao usuário. Adequado porque cada
   registro costuma ser editado por uma pessoa só, mas se duas pessoas editarem o mesmo campo,
   uma perde silenciosamente.
6. **Um item que falha 5 vezes sai da fila de tentativas** (`MAX_TRIES`) e fica visível no
   indicador, mas não há tela dedicada para inspecionar ou reenviar manualmente pendências presas.
7. **`push()` para na primeira falha** — correto para preservar dependências, mas significa que um
   item problemático bloqueia todos os posteriores até ser resolvido.
8. **Sem IndexedDB o app não funciona** (janela anônima, armazenamento bloqueado). Isso é
   detectado e comunicado pelo `<EstadoLista>`, mas é uma dependência dura.

### 🟡 Dívida menor

9. **Dashboard, relatório PDF, configurações, usuários e super admin continuam server-side** —
   exigem conexão. São telas de escritório; a geração de PDF depende do servidor por natureza.
10. **Chaves estrangeiras sem índice** e **índices não utilizados** (advisories INFO) — esperado
    no volume atual.
11. **Dependências mortas no `package.json`**: `react-hook-form`, `zod`, `clsx`, `date-fns`,
    `@hookform/resolvers` — instaladas sem nenhum import em `src/`.
12. **`manifest.webmanifest` com `theme_color` estático**, não reflete a cor por organização.
13. **Seed não automatizado**: `supabase/seed/seed.sql` não está ligado a nenhum script npm.
14. **`SUPABASE_SERVICE_ROLE_KEY` documentada mas não usada** em nenhum arquivo.
15. **Nenhum módulo de planos/billing**, apesar do spec original mencionar planos.
16. **Nenhum teste automatizado no repositório.** Os testes de navegador feitos até aqui foram
    scripts Playwright ad-hoc, não commitados.

### Resolvidos (mantidos para rastreabilidade)

- ~~RLS com `auth_rls_initplan`~~ — migration `0010` (2026-07-11).
- ~~Gate de aceite de termos incompleto~~ — gap em `platform.ts` corrigido (2026-07-11).
- ~~`insumos_custos` sem UI~~ / ~~sem edição de ocorrências e recomendações~~ — 2026-07-11.
- ~~Service worker nunca registrava~~ — `/sw.js` era interceptado pelo middleware e respondia
  redirect; pela especificação isso faz o registro **falhar**. Corrigido em 2026-08-25.
- ~~Erro `invalid input syntax for type uuid: ""`~~ — o select de produtor é `disabled` na edição
  de propriedade e campos desabilitados não entram no `FormData`. Corrigido em 2026-08-25.
- ~~Datas e horários errados após as 21h~~ — servidor roda em UTC; passou a usar
  `America/Sao_Paulo` (`todayInSaoPauloISO`). Corrigido em 2026-08-25.
- ~~Conta demo com poder de super admin~~ — privilégio movido para a conta real do dono
  (2026-08-25). A senha da demo está publicada no README.
- ~~`relatorios` sem `updated_at`~~ — migration `0012`; sem isso, incluir a tabela na
  sincronização quebraria o ciclo inteiro.

---

## 13. Estado atual exato

- **Branch**: `claude/agronomy-saas-platform-fpxpei` · último commit `a27b387`
- **Deploy**: Vercel, alias estável `https://sistema-campo-agri.vercel.app`
- **Banco**: Supabase `ynspkydroyncqhswjznm`, **12 migrations** aplicadas sem drift
- **Banco local**: IndexedDB `campoagri-offline`, **DB_VERSION 2**, 14 tabelas sincronizadas
- **Qualidade**: `npm run lint` com 0 erros e 0 avisos; `next build` limpo
- **Contas**: `irezende136@gmail.com` (owner + único super admin da plataforma) e
  `demo@campoagri.app` (demo, senha no README, sem privilégio de plataforma)

**O que mudou em 2026-08-25** (a rodada mais estrutural até aqui):

1. **Paridade com o CampoVet**: módulo financeiro, alertas e gráfico no dashboard, agenda
   agrupada com WhatsApp de confirmação.
2. **Modo offline completo (local-first)** — reescrita da camada de dados. Ver seção 4.
3. **Recuperação de senha por e-mail** — não existia; quem esquecia a senha ficava trancado fora
   e só o dono do projeto conseguia destravar pelo Dashboard.
4. **Captura de GPS mais precisa**: `getCurrentPosition` devolve a primeira leitura, que no
   celular costuma vir da rede (centenas de metros de erro). Passou a usar `watchPosition`,
   guardando sempre a leitura mais precisa até ±10 m, e **mostra a precisão na tela**.
5. **Correções**: service worker que nunca registrava, uuid vazio ao editar propriedade,
   timezone, fallback offline com `Vary`, e 5xx sendo devolvido em vez de usar o cache.
6. **Limpeza**: 10 Server Actions e 10 componentes removidos após a migração.

---

## 14. Próximos passos priorizados

**P0**
1. **Testar o ciclo de sincronização ponta a ponta** no deploy (item 12.1, roteiro na seção 16).
2. Habilitar `auth_leaked_password_protection` no Dashboard do Supabase (item 12.2).
3. Confirmar a URL de redirecionamento do Auth e `NEXT_PUBLIC_SITE_URL` (item 12.3).

**P1**
4. Tela de pendências: listar itens presos na fila, com o erro e opção de reenviar ou descartar
   (itens 12.6 e 12.7). Hoje o usuário só vê o número no cabeçalho.
5. Commitar uma suíte mínima de testes de navegador cobrindo o ciclo offline → sincronização
   (item 12.16). É a rede de segurança que falta para mexer nessa camada com confiança.

**P2**
6. Limitar a sincronização por período quando o volume crescer (item 12.4).
7. Converter o dashboard para ler do banco local, para ser útil offline (item 12.9).
8. Remover dependências mortas (item 12.11) e resolver `theme_color` do manifest (item 12.12).

**P3**
9. Índices em FKs conforme o volume crescer; automatizar o seed; decidir sobre
   `SUPABASE_SERVICE_ROLE_KEY` (itens 12.10, 12.13, 12.14).

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

Schema do banco: as migrations em `supabase/migrations/0001` a `0012` devem ser aplicadas, em ordem, contra um projeto Supabase (via CLI do Supabase ou via MCP `apply_migration`). Não há configuração de CLI local (`supabase/config.toml`) neste repositório — a aplicação de migrations foi feita manualmente via MCP durante o desenvolvimento.

**Nota de ambiente**: dentro deste sandbox específico de desenvolvimento, `npm run dev` não consegue alcançar `*.supabase.co` por política de rede do proxy — isso é uma limitação do ambiente de execução, não do projeto. Num ambiente normal (máquina local, CI, ou a própria Vercel), essa restrição não existe.

---

## 16. Checklist de validação

### Básico
- [ ] `npm install`, `npm run lint` e `npm run build` sem erros
- [ ] Login funciona e redireciona para `/dashboard`
- [ ] Cadastro → onboarding → criação de organização funciona
- [ ] Aceite de termos é exigido e gravado
- [ ] "Esqueci minha senha" envia o e-mail e o link cai em `/redefinir-senha`
- [ ] Usuário sem permissão não executa ações restritas; super admin acessa `/super-admin`
- [ ] Advisors do Supabase (security e performance) revisados antes de subir feature nova

### ⚠️ Ciclo offline → sincronização (o teste que ainda não foi feito)

Fazer no deploy, num celular real. É o item de maior risco em aberto.

1. [ ] Abrir o app **online** e deixar sincronizar (indicador no cabeçalho fica "Tudo sincronizado")
2. [ ] Ativar o **modo avião**
3. [ ] Cadastrar um produtor → uma propriedade nele → uma visita → uma ocorrência → uma foto
4. [ ] Conferir que tudo aparece nas listagens com o ícone de "ainda não enviado" e que o
       indicador mostra o número de pendências
5. [ ] Fechar e reabrir o app ainda offline — os dados devem continuar lá
6. [ ] Reconectar e aguardar a sincronização
7. [ ] **Conferir no Supabase** que os 5 registros chegaram, com as FKs ligando corretamente
       (a ocorrência apontando para a visita, a visita para a propriedade, a propriedade para o produtor)
8. [ ] Conferir que a foto subiu para o Storage e que a miniatura deixou de mostrar "no aparelho"
9. [ ] Abrir o histórico da propriedade e verificar se a visita aparece na linha do tempo
10. [ ] Repetir num aparelho que **já tinha o app aberto antes**, para confirmar que a subida do
        `DB_VERSION` para 2 acontece sem perder a fila de pendências

Se algo travar, o erro fica registrado no item da fila e o indicador mostra a contagem.

### Uso normal
- [ ] CRUD de produtores, propriedades, áreas, safras
- [ ] Criar, editar, finalizar e excluir uma visita
- [ ] Avaliação de área, ocorrência e recomendação dentro da visita
- [ ] Lançar cobrança na visita e conferir os totais em `/financeiro`
- [ ] Relatório de visita em PDF sem erros
- [ ] WhatsApp do produtor e da agenda abrem com número e mensagem corretos
- [ ] Waze/Maps abrem com as coordenadas certas; captura de GPS mostra a precisão em metros
- [ ] Cor primária e logo da organização refletem no `AppShell` e no PDF
- [ ] Logout limpa o banco local (abrir de novo deve pedir sincronização, sem mostrar dados da conta anterior)

---

## 17. Instruções obrigatórias para o próximo Claude Code

- Leia integralmente este documento antes de modificar o projeto — **em especial a seção 4**,
  porque a arquitetura de dados mudou por completo em 2026-08-25 e o padrão antigo (Server Actions
  + Server Components lendo o Postgres) não vale mais para dados operacionais.
- **Não crie Server Actions novas para dados operacionais.** Toda escrita passa pela camada
  `src/lib/offline/` (grava no IndexedDB e enfileira). Criar um caminho paralelo que grava direto
  no servidor faz o app se comportar de formas diferentes dependendo da tela.
- **Toda tabela nova que precisar funcionar offline** exige: `updated_at` + trigger no Postgres,
  entrada em `SYNCED_TABLES` e **bump do `DB_VERSION`** em `src/lib/offline/idb.ts`.
- **Em listagens, use `<EstadoLista>`**, não `<EmptyState>` direto — ele distingue "vazio" de
  "ainda não sincronizado" e de "armazenamento bloqueado".
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

O app é **local-first**: as telas leem e gravam num banco local (IndexedDB) e uma fila
sincroniza com o Supabase, para funcionar sem sinal no campo. A camada está em
src/lib/offline/. Quase não existem mais Server Actions para dados operacionais.

Antes de qualquer alteração, leia o arquivo PROJECT_HANDOFF.md na raiz do repositório
por completo. Ele contém o estado real e verificado do projeto (não confie em resumos
anteriores de chat): escopo funcional com status de conclusão por funcionalidade,
arquitetura, modelo de banco de dados, regras de negócio, histórico de decisões e
bugs corrigidos, riscos pendentes (seção 12) e próximos passos priorizados P0-P3
(seção 14). A seção 4 explica a arquitetura offline e as regras que a sustentam —
leia antes de escrever qualquer código que grave dados.

Risco em aberto mais importante: o ciclo completo offline → sincronização nunca foi
testado contra o Postgres real (item 12.1, roteiro na seção 16).

Branch de trabalho: claude/agronomy-saas-platform-fpxpei.

Antes de considerar qualquer funcionalidade "pronta", confirme diretamente no código
e, quando aplicável, no banco de dados via ferramentas MCP do Supabase — não confie
apenas no que está escrito em documentos ou em conversas anteriores.

[Descreva aqui a tarefa específica que você quer que eu faça a seguir]
```
