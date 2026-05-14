# MedCof

Monorepo **npm workspaces** com API HTTP em **Node.js 20+**, **TypeScript** estrito, **Express 5**, **Prisma** + **MySQL 8**, e frontend **React 19** com **Vite 6**. O backend segue **Arquitetura Hexagonal** (ports & adapters): domínio e casos de uso isolados de framework e de persistência, facilitando testes, evolução e substituição de infraestrutura.

---

## Visão arquitetural

| Camada | Responsabilidade | Dependências |
|--------|------------------|--------------|
| **Domain** | Entidades, VOs, enums, erros de domínio, **ports** (interfaces de repositório) | Nenhuma camada interna |
| **Application** | Casos de uso, DTOs, **ports** de aplicação (JWT, password hasher) | Apenas `domain` |
| **Infrastructure** | HTTP (Express), Prisma, bcrypt, JWT, middlewares | `application`, `domain`, `shared` |
| **Shared** | Config (Zod), erros HTTP (`AppError`), contratos de API, logging de erros | `domain` apenas onde necessário (ex.: mapeamento de `DomainError`) |

**Composição raiz** (`backend/src/main.ts`): instancia adaptadores concretos (Prisma, bcrypt, JWT), injeta nos casos de uso e monta o `Express` — é o único lugar que “amarra” o grafo de dependências.

---

## Arquitetura Hexagonal (Ports & Adapters)

Na **hexagonal**, o **núcleo** (domínio + aplicação) não conhece MySQL, Express nem JSON Web Token. Ele depende apenas de **portas** (interfaces):

- **Driving side (primária):** HTTP chama casos de uso; controllers são finos e traduzem request → comando/query.
- **Driven side (secundária):** repositórios Prisma, serviço de hash, emissor/validador de JWT implementam portas definidas no domínio ou na aplicação.

**Benefícios:** regras de negócio testáveis sem banco; troca de ORM ou de transporte (ex. filas) sem reescrever use cases; limites claros de responsabilidade.

---

## Decisões técnicas

- **TypeScript** com `strict`, `exactOptionalPropertyTypes`, paths `@domain/*`, `@application/*`, `@infrastructure/*`, `@shared/*`.
- **Validação de entrada** com **Zod** nos controllers/schemas; erros mapeados pelo **global error handler** com payload `{ success: false, error: { code, message } }`.
- **Erros operacionais** (`AppError` e subclasses) vs **DomainError** (sem semântica HTTP); mapeamento HTTP centralizado.
- **Produção:** mensagens genéricas em falhas 500; stack e detalhes só em **logs estruturados** (JSON line), nunca no corpo da resposta.
- **Correlação:** `x-request-id` + `req.requestId` via middleware de contexto.
- **Autenticação:** JWT Bearer; senhas com **bcrypt**; rounds configuráveis.
- **Tasks em lote:** `createMany` no Prisma (sem N inserts linha a linha).
- **Jest** em ESM (`NODE_OPTIONS=--experimental-vm-modules`), testes sob `backend/tests/unit` com factories/mocks, sem dependência real de banco nos unitários.

---

## Pré-requisitos

- **Node.js** ≥ 20  
- **npm** (workspaces)  
- **Docker** (apenas para subir MySQL local, opcional se você já tiver uma instância)

---

## Como rodar (visão geral)

1. Instalar dependências na raiz do monorepo.  
2. Subir MySQL (Docker recomendado).  
3. Configurar `backend/.env` a partir de `backend/.env.example`.  
4. `prisma generate` + migrações (ou `db push` em ambiente descartável).  
5. Backend em uma aba; frontend em outra (proxy `/api` → API).

---

## Docker

O `docker-compose.yml` sobe **MySQL 8.4** com charset `utf8mb4`, volume persistente e healthcheck:

```bash
npm run docker:up
```

Credenciais alinhadas ao exemplo de `DATABASE_URL` em `backend/.env.example`:

| Variável (container) | Valor padrão |
|----------------------|--------------|
| Database             | `medcof`     |
| User                 | `medcof`     |
| Password             | `medcof`     |
| Porta host           | `3306`       |

Encerrar:

```bash
npm run docker:down
```

> **Produção:** não use senhas padrão do compose; injete segredos via secret manager / variáveis de ambiente do orquestrador.

---

## Prisma

- **Schema:** `backend/prisma/schema.prisma` (MySQL, modelos `User`, `Task`).  
- **Client:** gerado em `node_modules/.prisma/client` após `generate`.

### Comandos (sempre a partir do workspace `backend`)

```bash
npm run prisma:generate -w backend   # gera o Prisma Client
npm run prisma:migrate -w backend   # cria/aplica migrations em dev (interativo)
npm run prisma:studio -w backend    # UI opcional para inspecionar dados
npm run prisma:push -w backend      # sincroniza schema sem migration (útil só em dev descartável)
```

### Migrations

O fluxo recomendado após alterar `schema.prisma`:

```bash
npm run prisma:migrate -w backend
```

Isso mantém histórico versionado em `backend/prisma/migrations/`. Em um clone **sem** pasta de migrations ainda, o primeiro `migrate dev` cria a migration inicial com base no schema atual.

Para ambiente local rápido **sem** histórico de migrations (não recomendado para times):

```bash
npm run prisma:push -w backend
```

---

## Variáveis de ambiente

Definidas e validadas por **Zod** em `backend/src/shared/config/env.ts`. Copie `backend/.env.example` → `backend/.env`.

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | sim | URL MySQL (ex.: `mysql://user:pass@host:3306/db`) |
| `JWT_SECRET` | sim | Mínimo **32** caracteres |
| `PORT` | não (default `3000`) | Porta HTTP |
| `NODE_ENV` | não | `development` \| `test` \| `production` |
| `JWT_EXPIRES_IN_SECONDS` | não | TTL do access token (default `86400`) |
| `JWT_ISSUER` | não | Claim `iss` opcional |
| `JWT_AUDIENCE` | não | Claim `aud` opcional |
| `BCRYPT_ROUNDS` | não | Entre 4 e 15 (default `12`) |

**Testes:** Jest carrega `backend/.env.test` (ver `jest.config.mjs`).

---

## Executar o backend

```bash
cd /caminho/do/medcof
npm install

# com MySQL já acessível na DATABASE_URL:
npm run prisma:generate -w backend
npm run prisma:migrate -w backend   # ou prisma:push em dev descartável

npm run dev:backend
# HTTP: http://localhost:3000 (ou PORT do .env)
```

Rotas principais de referência: `GET /health`, `POST /auth/register`, `POST /auth/login`, `GET /auth/me` (JWT), CRUD + bulk em `/tasks` (JWT).

Build e start em modo compilado:

```bash
npm run build:backend
npm run start -w backend
```

Qualidade:

```bash
npm run typecheck -w backend
npm run lint -w backend
```

---

## Executar o frontend

```bash
npm run dev:frontend
```

Por padrão o **Vite** usa a porta **5173** e faz **proxy** de chamadas `http://localhost:5173/api/*` para `http://localhost:3000/*` (ver `frontend/vite.config.ts`). Ou seja, no browser use prefixo `/api` para bater na API local sem CORS manual.

Build / preview:

```bash
npm run build:frontend
npm run preview -w frontend
```

Lint do monorepo (backend + frontend):

```bash
npm run lint
```

---

## Fluxo da aplicação (request HTTP)

```mermaid
flowchart LR
  subgraph edge [Infrastructure HTTP]
    MW[Middlewares: JSON, request-id, auth]
    R[Routers / Controllers]
    Z[Zod schemas]
  end
  subgraph app [Application]
    UC[Use cases]
  end
  subgraph dom [Domain]
    E[Entities / VOs]
    P[Repository ports]
  end
  subgraph infra [Infrastructure]
    PR[Prisma repositories]
    JWT[JWT / bcrypt]
  end
  Client --> MW --> R
  R --> Z
  R --> UC
  UC --> E
  UC --> P
  P -.->|implements| PR
  UC --> JWT
  R -->|errors| GH[Global error handler]
  GH -->|JSON| Client
```

1. Request entra nos middlewares (corpo JSON, `x-request-id`, autenticação nas rotas protegidas).  
2. Controller valida entrada (Zod), exige usuário autenticado quando aplicável, chama o caso de uso.  
3. Use case aplica regras de domínio e fala apenas com **ports**.  
4. Adaptadores Prisma/JWT realizam I/O.  
5. Erros são normalizados pelo **global error handler** (códigos HTTP + envelope + logs).

---

## Estrutura de pastas (resumo)

```
medcof/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── main.ts                 # composition root
│   │   ├── domain/                 # entidades, VOs, ports, erros de domínio
│   │   ├── application/            # use cases, DTOs, ports de aplicação
│   │   ├── infrastructure/       # http, prisma, auth
│   │   └── shared/                 # config, errors HTTP, api-response, logging
│   ├── tests/
│   │   └── unit/                   # usecases, controllers, middlewares, factories
│   ├── package.json
│   └── jest.config.mjs
├── frontend/
│   ├── src/
│   └── vite.config.ts
├── docker-compose.yml
├── package.json                    # workspaces + scripts agregados
└── README.md
```

---

## Testes

### Comandos

```bash
npm run test -w backend
npm run test:watch -w backend
npm run test:coverage -w backend
```

Os testes usam **ESM** + **ts-jest**; imports de produção usam sufixo `.js` (resolução NodeNext).

### Estratégia de testes

| Camada | Abordagem |
|--------|-----------|
| **Use cases** | Repositórios e serviços **mockados**; foco em regra de negócio; cenários de sucesso e falha (`AppError` / `DomainError`). |
| **Controllers** | Use cases como `jest.fn`; validação de status HTTP / envelope `sendSuccess` ou `next(error)` (Zod, auth defensivo). |
| **Middlewares** | JWT service mockado; ausência/malformação de token, expirado, sucesso. |
| **Factories** | `tests/unit/factories`: HTTP doubles, mocks de ports, builders quando útil. |

Padrão **Arrange / Act / Assert**, mocks limpos (`clearMocks: true`), **sem** MySQL real nos unitários — adequado para CI rápido e feedback local.

---

## Scripts úteis (raiz)

| Script | Descrição |
|--------|-----------|
| `npm run dev:backend` | API com `tsx watch` |
| `npm run dev:frontend` | Vite dev server |
| `npm run build:backend` / `build:frontend` | Builds |
| `npm run docker:up` / `docker:down` | MySQL local |
| `npm run lint` | ESLint em ambos workspaces |
| `npm run format` / `format:check` | Prettier |

---

## Licença e contribuição

Projeto privado / teste técnico — ajuste licença e guidelines de PR conforme a política da sua organização.

---

*Documentação gerada para refletir o estado atual do repositório; após mudar `schema.prisma` ou contratos de API, mantenha migrations e este README alinhados ao que o time realmente executa em CI e em produção.*
# test-medcof
