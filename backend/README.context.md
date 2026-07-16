# Documento de Contexto — Coffee Shop (Backend)

> Este documento consolida especificações do projeto com base no código atual do diretório `backend/`.

---

## 1) Visão Geral

API HTTP construída com **Node.js + TypeScript + Express**. A aplicação organiza responsabilidades em:

- **Rotas** (`src/routes.ts`)
- **Controllers** (camada HTTP)
- **Services** (lógica de negócio e acesso ao banco)
- **Middlewares** (auth/role, validação e tratamento de erro)
- **Schemas** (validação de request com Zod)
- **Prisma** (ORM e modelagem do banco)

---

## 2) Arquitetura (camadas)

Fluxo principal:

1. **Rotas** (`routes.ts`) registram endpoints e encadeiam middlewares (ex: `validateSchema`, `isAuthenticated`, `isAdmin`).
2. **Controller** recebe a requisição Express (`req`, `res`), extrai campos (body) e chama a **Service**.
3. **Service** executa a lógica:
   - consulta/cria dados via **Prisma** (`src/prisma/index.ts`)
   - em falhas, lança **exceções** específicas (classes em `src/exceptions/*`).
4. O **Controller** retorna a resposta ao cliente (`res.json` ou `res.status(...).json`).
5. Erros são capturados no middleware global **errorHandler** (`src/middlewares/errorHandler.ts`).

Exemplo (descrição do pipeline):

- **Rotas** → controller recebe requisição e chama service → service usa prisma → controller devolve resposta → `errorHandler` trata exceções.

---

## 3) Organização de Pastas

Estrutura relevante:

- `backend/src/server.ts`
  - Boot da aplicação Express, configura `express.json()`, `cors`, monta `router` e registra `errorHandler`.

- `backend/src/routes.ts`
  - Declara endpoints e middlewares por rota.

- `backend/src/controllers/`
  - `controllers/user/`
    - `createUserController.ts`
    - `AuthUserController.ts`
    - `DetailUserController.ts`
  - `controllers/category/`
    - `CreateCategoryController.ts`

- `backend/src/services/`
  - `services/user/`
    - `CreateUserService.ts`
    - `AuthUserService.ts`
    - `DetailUserService.ts`
  - `services/category/`
    - `CreateCategoryService.ts`

- `backend/src/middlewares/`
  - `validateSchema.ts` (validação Zod)
  - `errorHandler.ts` (tratamento global de erros)
  - `IsAuthenticated.ts` (JWT)
  - `IsAdmin.ts` (role ADMIN)

- `backend/src/schemas/`
  - `userSchema.ts` (Zod schemas para user)
  - `categorySchema.ts` (Zod schema para categoria)
  - `productsSchema.ts` (Zod schema para query de listagem de produtos)


- `backend/src/exceptions/`
  - Erros customizados com `statusCode` e `message`.

- `backend/src/prisma/`
  - `index.ts` (instância Prisma Client com adapter pg)
  - `prisma.config.ts` (config Prisma; aparece gerado/relacionado ao setup)

- `backend/src/@types/express/`
  - Extensão do tipo Express para adicionar `req.user_id`.

---

## 4) Endpoints (API)

Base: rotas definidas em `backend/src/routes.ts`.

### 4.1) `POST /users`
- Middlewares:
  - `validateSchema(createUserSchema)`
- Controller: `CreateUserController().handle`
- Service: `CreateUserService.execute`
- Body (conforme `createUserSchema`):
  - `body.name` (string, min 3, max 45)
  - `body.email` (string email)
  - `body.password` (string, min 6)

### 4.2) `POST /session`
- Middlewares:
  - `validateSchema(authUserSchema)`
- Controller: `AuthUserController().handle`
- Service: `AuthUserService.execute`
- Body (conforme `authUserSchema`):
  - `body.email` (string email)
  - `body.password` (string, min 1)
- Resposta:
  - retorna sessão com `{ id, name, email, role, token }`

### 4.3) `GET /me`
- Middlewares:
  - `isAuthenticated`
- Controller: `DetailUserController().handle`
- Service: `DetailUserService.execute(user_id)`
- Requisitos:
  - Header `Authorization: Bearer <token>`
  - `token` deve ser JWT válido assinado por `process.env.JWT_SECRET`

### 4.4) `POST /category`
- Middlewares:
  - `isAuthenticated`
  - `isAdmin`
  - `validateSchema(CreateCategorySchema)`
- Controller: `CreateCategoryController().handle`
- Service: `CreateCategoryService.execute`
- Body (conforme `CreateCategorySchema`):
  - `body.name` (string, min 3, max 45)

### 4.5) `GET /category`
- Middlewares:
  - `isAuthenticated`
- Controller: `ListCategoriesController().handle`
- Service: `ListCategoriesService.execute`
- Resposta:
  - lista de categorias com `{ id, name, createdAt }`

---

### 4.6) `POST /product`
- Middlewares:
  - `isAuthenticated`
  - `isAdmin`
  - `upload.single("file")` (multer)
  - `validateSchema(CreateProductSchema)`
- Controller: `CreateProductController().handle`
- Service: `CreateProductService.execute`
- Body / request (conforme `CreateProductSchema`):
  - `body.name` (string, min 1)
  - `body.description` (string, min 1)
  - `body.price` (string numérica, min 1)
  - `body.category_id` (string, min 1)
- Upload:
  - campo `file` (imagem do banner do produto)

### 4.7) `GET /product`
- Middlewares:
  - `isAuthenticated`
- Observação:
  - rota está declarada em `backend/src/routes.ts` como `router.get("/product", isAuthenticated)`.
  - esta rota não possui controller explicitado no documento (verificar implementação).

### 4.8) `GET /products`
- Middlewares:
  - `isAuthenticated`
  - `validateSchema(productsSchema)`
- Controller: `ListProductsController().handle`
- Service: `ListProductsService.execute`
- Query params (conforme regra do endpoint):
  - `disabled` (string: `true` ou `false`)
  - comportamento:
    - se `disabled` não for enviado, usa `disabled=false` como padrão
    - se `disabled=true`, filtra apenas produtos com `disabled=true`
    - se `disabled=false`, filtra apenas produtos com `disabled=false`



---

## 5) Middlewares

### 5.1) `validateSchema(schema)` (`src/middlewares/validateSchema.ts`)
- Função: valida `req.body`, `req.query` e `req.params` contra um schema Zod.
- Implementação:
  - chama `schema.parseAsync({ body: req.body, query: req.query, params: req.params })`
  - se falhar, repassa a exceção para `next(error)`
- Tratamento de erro associado:
  - `errorHandler` detecta `error instanceof ZodError` e responde:
    - **HTTP 400**
    - `{ error: "Erro de validação", details: [{ message }] }`

### 5.2) `errorHandler` (`src/middlewares/errorHandler.ts`)
- Função: middleware global de tratamento.
- Mapeamentos atuais:
  - `ZodError` → **400** (`Erro de validação` + `details`)
  - `UserAlreadyExistsError` → `error.statusCode` (**400**)
  - `PasswordNotMatchError` → **401**
  - `UserNotFoundError` → **404**
  - `InvalidToken` → **401**
  - `CreateCategoryError` → `error.statusCode` (**400**)
  - fallback → **500** (`Erro interno do servidor`)

### 5.3) `isAuthenticated` (`src/middlewares/IsAuthenticated.ts`)
- Função: autentica usuário via JWT.
- Espera header:
  - `Authorization` no formato `Bearer <token>`
- Lógica:
  - se não houver `authorization`, lança `InvalidToken`.
  - `jwt.verify(token, process.env.JWT_SECRET as string)`
  - extrai `sub` do payload e popula `req.user_id = sub`
- Erros:
  - qualquer falha na verificação lança `InvalidToken`.

### 5.4) `isAdmin` (`src/middlewares/IsAdmin.ts`)
- Função: autoriza apenas usuários com role ADMIN.
- Lógica:
  - usa `req.user_id`
  - busca `user.role` em `prismaClient.user.findFirst({ where: { id: user_id } })`
  - se `user?.role !== "ADMIN"`, lança `UserNotFoundError()`

---

## 6) Validação de Schemas (Zod)

### 6.1) `createUserSchema` (`src/schemas/userSchema.ts`)
- `body.name`
  - string
  - min(3)
  - max(45)
- `body.email`
  - zod `.email()`
- `body.password`
  - string
  - min(6)

### 6.2) `authUserSchema` (`src/schemas/userSchema.ts`)
- `body.email` (email)
- `body.password`
  - string
  - min(1)

### 6.3) `CreateCategorySchema` (`src/schemas/categorySchema.ts`)
- `body.name`
  - string
  - min(3)
  - max(45)

---

## 7) Exceções Customizadas

- `UserAlreadyExistsError` (`statusCode = 400`)
  - message: `Usuário já cadastrado`
- `PasswordNotMatchError` (`statusCode = 401`)
  - message: `Email/senha é obrigatório`
- `UserNotFoundError` (`statusCode = 404`)
  - message: `Usuário sem permissão`
- `InvalidToken` (`statusCode = 401`)
  - message: `Token inválido`
- `CreateCategoryError` (`statusCode = 400` por padrão no construtor)
  - message: `Erro ao criar categoria`

---

## 8) Modelagem de Banco de Dados (Prisma)

Arquivo: `backend/prisma/schema.prisma`

### 8.1) Generator / Datasource
- `generator client`
  - provider `prisma-client`
  - output `../src/generated/prisma`
- `datasource db`
  - provider: `postgresql`

### 8.2) Enum `Role`
- `Role { STAFF, ADMIN }`

### 8.3) Models

#### `model User`
- Fields:
  - `id: String` (PK, `@default(uuid())`, `@@map("users")`)
  - `name: String`
  - `email: String @unique`
  - `password: String`
  - `role: Role @default(STAFF)`
  - `createdAt: DateTime @default(now())`
  - `updatedAt: DateTime @updatedAt`

#### `model Category`
- Fields:
  - `id: String` (PK, uuid)
  - `name: String`
  - `products Product[]`
  - timestamps
  - `@@map("categories")`

#### `model Product`
- Fields:
  - `id: String` (PK, uuid)
  - `name: String`
  - `price: Int`
  - `description: String`
  - `banner: String`
  - `disabled: Boolean @default(false)`
  - Relations:
    - `items Item[]`
    - `category_id: String`
    - `category Category @relation(fields: [category_id], references: [id], onDelete: Cascade)`
  - timestamps
  - `@@map("products")`

#### `model Order`
- Fields:
  - `id: String` (PK, uuid)
  - `table: Int`
  - `status: Boolean @default(false)`
  - `draft: Boolean @default(true)`
  - `name: String?`
  - `items Item[]`
  - timestamps
  - `@@map("orders")`

#### `model Item`
- Fields:
  - `id: String` (PK, uuid)
  - `amount: Int`
  - timestamps
  - Relations:
    - `order_id: String`
    - `order Order @relation(fields: [order_id], references: [id], onDelete: Cascade)`
    - `product_id: String`
    - `product Product @relation(fields: [product_id], references: [id], onDelete: Cascade)`
  - `@@map("items")`

---

## 9) Versões e Bibliotecas usadas

Lido de `backend/package.json`.

### 9.1) Dependências (`dependencies`)
- `express` `^5.2.1`
- `cors` `^2.8.6`
- `dotenv` `^17.4.2`
- `zod` `^4.4.3`
- `jsonwebtoken` `^9.0.3`
- `bcrypt` `^6.0.0`
- `tsx` `^4.22.3`
- `@prisma/client` `^7.8.0`
- `@prisma/adapter-pg` `^7.8.0`
- `pg` `^8.21.0`

### 9.2) DevDependencies (`devDependencies`)
- `typescript` `^6.0.3`
- `prisma` `^7.8.0`
- Tipagens:
  - `@types/express` `^5.0.6`
  - `@types/node` `^25.9.1`
  - `@types/jsonwebtoken` `^9.0.10`
  - `@types/cors` `^2.8.19`
  - `@types/bcrypt` `^6.0.0`
  - `@types/pg` `^8.20.0`

---

## 10) Observações de Integração (JWT / Prisma)

### JWT
- `AuthUserService` cria token com:
  - payload: `{ name: user.name, email: user.email }`
  - `subject: user.id`
  - `expiresIn: "30d"`
- `IsAuthenticated` usa `jwt.verify` e lê `sub`.

### Prisma
- Prisma Client instanciado em `src/prisma/index.ts` usando:
  - `PrismaPg` com `connectionString = process.env.DATABASE_URL`
- Operações são feitas diretamente nas services (sem repositórios adicionais).

---

## 11) Referência Rápida de Arquivos-Chave

- `backend/src/server.ts` (startup)
- `backend/src/routes.ts` (endpoints)
- `backend/src/middlewares/validateSchema.ts`
- `backend/src/middlewares/errorHandler.ts`
- `backend/src/middlewares/IsAuthenticated.ts`
- `backend/src/middlewares/IsAdmin.ts`
- `backend/src/controllers/*`
- `backend/src/services/*`
- `backend/prisma/schema.prisma`
- `backend/src/prisma/index.ts`
- `backend/src/schemas/*`

---

Fim do documento de contexto.

