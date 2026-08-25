# Sistema CampoAgri

Plataforma web para engenheiros agrônomos gerenciarem visitas técnicas, produtores,
propriedades rurais, áreas/talhões, safras, ocorrências, recomendações e gerarem
relatórios profissionais em PDF. Nasce simples (uso por um único agrônomo) mas com
arquitetura multi-tenant pronta para virar um SaaS comercial.

## Stack

- **Next.js 16** (App Router, Server Actions) + **TypeScript**
- **Tailwind CSS v4**
- **Supabase**: Postgres, Auth, Storage — com Row Level Security
- **@react-pdf/renderer** para geração dos relatórios de visita em PDF
- **PWA** básico (manifest + service worker de app shell)

## Arquitetura multi-tenant

Toda tabela operacional carrega `organization_id`. O isolamento entre organizações é
garantido por **Row Level Security** no Postgres (não apenas por filtros na aplicação):

- `organizations`: cada cliente do SaaS (agrônomo autônomo, escritório, equipe).
- `organization_users`: vínculo usuário ⇄ organização com `role` (`owner`, `admin`,
  `agronomo`, `tecnico`, `assistente`, `viewer`).
- `platform_admins`: nível separado da plataforma (Super Admin), sem relação com
  nenhuma organização específica.
- Funções auxiliares `is_org_member`, `is_org_admin`, `can_write_org`,
  `is_platform_admin` (todas `SECURITY DEFINER`) usadas dentro das políticas de RLS.
- Bootstrap de organização feito via RPC `create_organization` (evita políticas de
  INSERT perigosas em `organizations`).
- Storage: bucket privado único `campoagri`, com path `{organization_id}/...`; as
  policies de `storage.objects` verificam o primeiro segmento do path contra a
  organização do usuário autenticado.

Ver `supabase/migrations/` para o schema completo, políticas e triggers.

## Papéis e permissões

| Papel       | Pode ver dados da org | Pode criar/editar | Pode excluir | Gerencia usuários/config |
|-------------|:---:|:---:|:---:|:---:|
| owner       | ✅ | ✅ | ✅ | ✅ |
| admin       | ✅ | ✅ | ✅ | ✅ |
| agronomo    | ✅ | ✅ | – | – |
| tecnico     | ✅ | ✅ | – | – |
| assistente  | ✅ | ✅ | – | – |
| viewer      | ✅ | – | – | – |

Um trigger no banco impede excluir/rebaixar/desativar o único `owner` ativo de uma
organização.

## Estrutura de pastas

```
src/
  app/
    (auth)/            login, cadastro, onboarding de organização
    (app)/              área autenticada (dashboard, produtores, propriedades,
                        areas, safras, visitas, agenda, configurações, usuários,
                        super-admin, relatórios)
    auth/callback/      troca de código de confirmação de e-mail
  components/           componentes de UI e por domínio
  lib/
    actions/            Server Actions (mutations)
    auth/                contexto de organização/role, permissões
    data/                queries de leitura (dashboard, histórico, relatório)
    domain/              labels/tons de status, tipos de ocorrência
    pdf/                 documento React-PDF do relatório de visita
    supabase/            clients (browser/server/middleware)
    utils/               formatação, cn()
  types/database.ts      tipos gerados do schema Supabase
supabase/
  migrations/            migrations SQL numeradas (schema, RLS, triggers, storage)
  seed/seed.sql           dados fictícios de demonstração
```

## Rodando localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure as variáveis de ambiente (veja `.env.example`):
   ```bash
   cp .env.example .env.local
   ```
   Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os
   valores do seu projeto Supabase (Project Settings → API).
3. Rode o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Acesse [http://localhost:3000](http://localhost:3000).

## Configurando o Supabase do zero

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Aplique as migrations em ordem (SQL Editor ou Supabase CLI), de
   `supabase/migrations/0001_schema.sql` até a mais recente.
3. (Opcional) Rode `supabase/seed/seed.sql` para popular dados de demonstração —
   cria um usuário já confirmado, veja credenciais abaixo.
4. Copie a URL do projeto e a chave `anon`/`publishable` para `.env.local`.

O bucket de Storage `campoagri` e suas policies já são criados pela migration
`0005_storage.sql` — não é necessário criar manualmente.

### Convite de usuários da equipe

Como a v1 não integra um serviço de e-mail transacional (o que exigiria a chave
`service_role`, que não deve circular fora do backend), o fluxo de convite é:
o novo membro cria a própria conta em `/cadastro` e, depois, o owner/admin o
adiciona pela tela **Usuários** informando o e-mail já cadastrado. A função
`find_user_by_email` localiza a conta sem expor a tabela `profiles` de outras
organizações.

## Recuperação de senha

O login tem o link **Esqueci minha senha** (`/esqueci-senha`). O usuário informa
o e-mail, recebe um link do Supabase e cai em `/redefinir-senha` para criar a
nova senha. Por segurança, a tela de confirmação é a mesma exista ou não uma
conta com aquele e-mail — assim não é possível descobrir quais e-mails estão
cadastrados.

Para o link funcionar, a URL pública do deploy precisa estar em
*Authentication → URL Configuration* no painel do Supabase (ver seção Deploy).

## Dados de demonstração

Rodando `supabase/seed/seed.sql`, fica disponível um login de demonstração já
confirmado (dispensa clicar em link de e-mail):

- **E-mail:** `demo@campoagri.app`
- **Senha:** `CampoAgri#2026`

Esse usuário é `owner` da organização fictícia **AgroGestão Técnica** (produtor
João Pereira, Fazenda Santa Clara, 5 áreas, uma safra de milho com planejamento de
plantio e uma visita finalizada com ocorrências e recomendações) e também
`platform_admin`, para explorar o painel Super Admin.

## Deploy

### Supabase

O banco já roda em produção (plano gratuito) na organização Supabase do usuário.
Para promover para um plano pago ou trocar de projeto, atualize as variáveis de
ambiente do frontend.

### Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new) (ou conecte
   via GitHub App) selecionando este repositório.
2. Configure as variáveis de ambiente do projeto (Project Settings → Environment
   Variables), iguais às de `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (opcional — os links de confirmação de e-mail e de
     redefinição de senha usam o host do próprio pedido; esta variável serve
     apenas de reserva quando não há contexto de requisição)
3. Deploy. Todo push na branch de produção gera um novo deploy automaticamente.
4. No painel do Supabase, em Authentication → URL Configuration, adicione a URL
   do deploy Vercel em *Site URL* e *Redirect URLs* (`/auth/callback`).
   O mesmo `/auth/callback` atende a confirmação de e-mail e a redefinição de
   senha (que chega como `/auth/callback?next=/redefinir-senha`).

> Este ambiente de execução não tem uma sessão autenticada do Vercel CLI nem uma
> API de criação de projetos, então a conexão inicial do repositório precisa ser
> feita manualmente pelo usuário na Vercel (passo 1 acima); depois disso, os
> deploys seguintes são automáticos a cada push.

## Módulos implementados (MVP)

Autenticação · Organizações/Owner · Papéis e permissões · Isolamento por
`organization_id` (RLS) · Produtores · Propriedades · Áreas/Talhões/Pastagens ·
Safras + Planejamento de plantio · Agenda de visitas · Visita técnica completa
(avaliação por área, ocorrências, recomendações) · Upload de fotos (Storage) ·
Relatório de visita em PDF · Histórico da propriedade · Configurações da
organização (logo/assinatura) · Usuários e permissões · Painel Super Admin ·
Logs de auditoria · PWA básico.

Preparado no schema, com UI simplificada: insumos e custos previstos por
área/safra (`insumos_custos`).

Deixado para uma próxima etapa (conforme priorização do MVP): cobrança
automática, portal do produtor, app nativo, envio automático por WhatsApp.
