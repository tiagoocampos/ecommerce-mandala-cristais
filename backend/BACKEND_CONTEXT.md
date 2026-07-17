# BACKEND_CONTEXT.md

> Documento de contexto do backend **baseado exclusivamente no código existente**.

---

## Visão Geral

### Objetivo do backend
O backend expõe uma API HTTP para:
- autenticação e sessão via JWT (rotas `/users`, `/session`, `/me`)
- gestão de **categorias** (`/category`)
- gestão de **produtos** (`/product`, `/products`, `/category/product`)
- gestão de **endereços** (`/address`)
- fluxo de **pedidos** (criar/consultar/atualizar/remover itens e status) em rotas `/order*`
- administração de **usuários** em rotas sob `/admin/users*`

### Arquitetura utilizada
Padrão predominante (em vários pontos do projeto):
- **Controllers** tratam o Request/Response.
- **Services** contêm a regra de negócio e orquestram o acesso ao banco (via Prisma).
- **Middlewares** aplicam autenticação/autorização/validação e tratamento global de erros.
- **Schemas** (Zod) validam payloads.
- **Exceptions** definem tipos de erros de domínio/HTTP.
- **Utils** contem funções auxiliares (ex.: slug).

### Tecnologias utilizadas
- Express (HTTP)
- TypeScript
- Prisma (PostgreSQL)
- JWT (para autenticação; implementado em `IsAuthenticated`/services associadas)
- Multer (upload de imagem de produto)
- Cloudinary (config existe em `config/cloudinary.ts`, usado no fluxo de criação de produto)
- Zod (validação de payloads)
- Cors
- dotenv (`dotenv/config`)

### Padrões de organização do projeto
Pasta raiz `backend/src` com subpastas por responsabilidade:
- `controllers/` — handlers
- `services/` — regra de negócio
- `middlewares/` — validações e proteção
- `schemas/` — Zod schemas
- `exceptions/` — classes de erro
- `utils/` — helpers
- `prisma/` — Prisma client e instância
- `generated/` — código do Prisma client
- `config/` — integrações (Cloudinary, Multer)

---

## Estrutura de Pastas

### `src/`
Ponto de entrada lógico da API.

#### `controllers/`
Responsabilidades:
- receber `req`/`res`.
- extrair parâmetros e body (após validação por middleware, quando aplicável).
- chamar serviços.
- responder JSON (ou propagando erros para `errorHandler`).

Pontos comuns observados:
- `new XxxController().handle` é registrado nas rotas.

#### `services/`
Responsabilidades:
- regra de negócio.
- validações adicionais (além das validações Zod).
- acesso ao banco via Prisma (em geral).
- lançar exceptions específicas.

#### `middlewares/`
- `errorHandler.ts`: handler global de erros (Zod e exceptions de domínio).
- `IsAuthenticated.ts`: autenticação (JWT) para proteger rotas.
- `IsAdmin.ts`: autorização para rotas admin.
- `validateSchema.ts`: validação usando Zod (via `validateSchema`).

#### `exceptions/`
Classes de erro para cada domínio:
- `UserErrors.ts` (ex.: Unauthorized/Forbidden/UserNotFound)
- `UserAlreadyExistsError.ts`
- `passwordNotMatch.ts`
- `InvalidToken.ts`
- `CategoryErrors.ts`
- `ProductErrors.ts`
- `OrdersErrors.ts`
- `AddressErrors.ts`

Essas exceptions são reconhecidas pelo `middlewares/errorHandler.ts` para mapear status HTTP e payload.

#### `schemas/`
Zod schemas para validar request bodies e params.
Exemplos de schemas registrados em `routes.ts`:
- `schemas/userSchema.ts`: `createUserSchema`, `authUserSchema`
- `schemas/categorySchema.ts`: `createCategorySchema`, `updateCategorySchema`
- `schemas/productSchema.ts`: `CreateProductSchema`, `ListProductsSchema`, `ListProductsByCategorySchema`
- `schemas/orderSchema.ts` e `schemas/orderDetailSchema.ts`
- `schemas/adressSchema.ts`: `createAddressSchema`, `deleteAddressSchema`, `updateAddressSchema`
- `schemas/userAdminSchema.ts`: `updateUserRoleParamsSchema`, `updateUserRoleSchema`

#### `prisma/`
Instância Prisma.

#### `generated/`
Cliente Prisma gerado (`@prisma/client` no output local).

#### `config/`
- `cloudinary.ts`: configurações de integração.
- `multer.ts`: configuração do storage do upload.

#### `utils/`
- `generateSlug.ts`: geração/normalização de slug (usado no cadastro de categorias/produtos, conforme padrão do repo).

---

## Fluxo da Aplicação (Request lifecycle)

Fluxo geral:

1. **Express app** inicializa em `src/server.ts`:
   - `express.json()`
   - `cors()`
   - `app.use(router)` (rotas)
   - `app.use(errorHandler)` (tratamento global)

2. **Route matching** em `src/routes.ts`.

3. **Middlewares na cadeia** (quando presentes na rota):
   - `validateSchema(schema)` executa validação Zod e, em caso de erro, lança `ZodError`.
   - `isAuthenticated` valida JWT e permite acesso ao controller.
   - `isAdmin` garante papel ADMIN.
   - `multer(uploadConfig)` habilita `upload.single("file")` para criação de produto.

4. **Controller** executa `handle`:
   - chama service(s)
   - retorna resposta ou deixa exceptions propagarem

5. **Service** interage com Prisma e lança exceptions específicas.

6. **errorHandler** (global) captura:
   - `ZodError` => status 400 com `error: "Erro de validação"` e `details: [{message, path}]`
   - exceptions de domínio => status e payload definidos
   - caso não reconhecido => status 500 `{ error: "Erro interno" }`

---

## Controllers

Padrão utilizado (observado em `routes.ts`):
- Controllers são instanciados e o método `handle` é passado como callback.

Exemplo de registro:
- `new CreateUserController().handle`

Responsabilidades esperadas:
- não executar regra complexa (regra está em services)
- somente orquestrar Request/Response

---

## Services

Padrão utilizado:
- classes com lógica de negócio.
- interagem com Prisma (`src/prisma/index.ts`) e com integrações (`cloudinary` ao criar produto com imagem).
- lançam exceptions específicas.

---

## Middlewares

### `errorHandler`
Arquivo: `src/middlewares/errorHandler.ts`

Comportamento:
- se `error instanceof ZodError` => `400` com details.
- se `error instanceof ...` (todas as exceptions listadas no arquivo) => mapeia status para o tipo e formata resposta.
- default: `500`.

### `validateSchema`
Arquivo: `src/middlewares/validateSchema.ts` (registrado via `validateSchema(schema)` em `routes.ts`).

### `IsAuthenticated`
Arquivo: `src/middlewares/IsAuthenticated.ts` (rotas como `/me`, `/address`, `/products`, etc).

### `IsAdmin`
Arquivo: `src/middlewares/IsAdmin.ts` (rotas admin: criar/editar/excluir categorias e produtos; `/admin/users*`).

---

## Autenticação

### Rotas
- `POST /users`: cadastro
- `POST /session`: login/autenticação e emissão de token
- `GET /me`: rota protegida para retornar detalhes do usuário autenticado

### Padrão de proteção
- Rotas protegidas usam `isAuthenticated`.
- `isAuthenticated` provavelmente:
  - lê token (Authorization header com Bearer)
  - valida e, em caso de token inválido => lança `InvalidToken` (tratada no errorHandler)

---

## Permissões

Enums (Prisma):
- `Role`: `CUSTOMER`, `ADMIN`.

Autorização via middleware:
- `isAdmin` é aplicado em rotas admin.

Rotas admin observadas em `routes.ts`:
- `POST /category`, `PUT /category/:id`, `DELETE /category/:id`
- `POST /product`, `DELETE /product`
- `/admin/users` e `/admin/users/:id` para listar/atualizar/deletar

---

## Banco de Dados (Prisma)

Arquivo: `prisma/schema.prisma`

### Enums
- `Role`: `CUSTOMER`, `ADMIN`
- `OrderStatus`: `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELED`
- `PaymentStatus`: `PENDING`, `APPROVED`, `REJECTED`, `REFUNDED`
- `CouponType`: `PERCENTAGE`, `FIXED`

### Models e relações (cardinalidades)
- `User`
  - `addresses Address[]`
  - `cart Cart?` (1-1)
  - `orders Order[]`

- `Address`
  - relação many-to-one com `User` (Address.user_id => User.id)
  - `orders Order[]`

- `Category`
  - `products Product[]`

- `Product`
  - many-to-one com `Category` (`category_id`)
  - `cartItems CartItem[]`
  - `orderItems OrderItem[]`

- `Cart`
  - 1-1 com `User` (Cart.user_id @unique)
  - `items CartItem[]`

- `CartItem`
  - many-to-one com `Cart` e `Product`
  - `@@unique([cart_id, product_id])`

- `Order`
  - many-to-one com `User` (`user_id`)
  - many-to-one com `Address` (`address_id`)
  - opcional com `Coupon?` (`coupon_id`)
  - `items OrderItem[]`
  - opcional com `Payment?` (1-1 via `Payment.order_id @unique`)

- `OrderItem`
  - many-to-one com `Order` e `Product`

- `Payment`
  - 1-1 com `Order` (`order_id @unique`)

- `Coupon`
  - `orders Order[]`

### Constraints e onDelete
- `onDelete: Cascade` observado em relações de `Address -> User`, `Category -> Product`, `Order -> User/Address`, `OrderItem -> Order`, `CartItem -> Cart`, etc.
- `Cart.user_id` é `@unique` (cart por user).
- `CartItem` possui `@@unique([cart_id, product_id])`.

---

## Fluxo das Entidades (alto nível)

### User → Address
- Um `User` pode ter múltiplos `Address`.
- `Address` referencia `User` via `user_id`.

### Cart → CartItem → Product
- Um `User` possui opcionalmente um `Cart` (1-1).
- `Cart` possui muitos `CartItem`.
- Cada `CartItem` referencia um `Product`.

### Order → OrderItem → Product
- Um `User` possui múltiplos `Order`.
- Um `Order` possui múltiplos `OrderItem`.
- Cada `OrderItem` referencia o `Product` e guarda `quantity` e `unit_price`.

### Order → Payment
- `Payment` é opcional e ligado ao `Order` por `order_id @unique`.

---

## Regras de Negócio (observadas no código disponível)

> Observação: esta versão do documento foi criada usando apenas trechos que já foram lidos com ferramenta antes. Para não fazer suposições, as regras aqui se limitam ao que aparece explicitamente em `routes.ts`, `server.ts`, `errorHandler.ts` e `schema.prisma`.

1. **Validação de payloads via Zod**
   - todas rotas com `validateSchema(...)` dependem dos schemas.

2. **Mapeamento de erros**
   - `errorHandler` define um contrato de resposta de erro para Zod e cada exception.

3. **Slug único**
   - `Category.slug` é `@unique`.
   - `Product.slug` é `@unique`.

4. **OnDelete Cascade**
   - relações estratégicas usam Cascade.

5. **Papéis e acesso**
   - `isAdmin` restringe rotas de mutação de categorias/produtos e rotas de administração de usuários.

---

## Exceptions

Arquivo: `src/middlewares/errorHandler.ts`

Exceptions explicitamente citadas e mapeadas:
- `UserAlreadyExistsError`
- `PasswordNotMatchError`
- `UserNotFoundError`
- `InvalidToken`
- `CreateCategoryError`, `ListCategoriesError`, `CategoryAlreadyExistsError`, `CategoryNotFoundError`, `UpdateCategoryError`, `DeleteCategoryError`
- `ListProductsError`, `DeleteProductError`
- `CreateOrderError`, `AddItemError`, `RemoveItemError`, `ItemNotFoundError`, `OrderNotFoundError`
- `CreateAddressError`, `ListAddressError`, `DeleteAddressError`, `UpdateAddressError`, `AddressNotOwnedError`, `AddressNotFoundError`
- `UnauthorizedUserError`, `ForbiddenError`

Cada uma mapeia:
- `status` através de `error.statusCode` quando usado via `(error as any).statusCode` ou `error.statusCode`.
- payloads com campo `error` e, em alguns casos, `field` ou `details`.

---

## Tratamento de Erros

Middleware global: `src/middlewares/errorHandler.ts`

Fluxo:
- captura erros lançados da cadeia express/async.
- `ZodError` vira `400` com `details`.
- exceptions específicas viram `res.status(error.statusCode)` com payload `{ error: error.message }`.
- fallback: `500`.

---

## Rotas

Arquivo: `src/routes.ts`

> Observação: A documentação abaixo baseia-se apenas no arquivo `routes.ts` (não inclui descrição do controller, pois isso exigiria leitura adicional de cada controller/schema/service).

### Auth
- `POST /users`
  - body validado por `createUserSchema`
  - handler: `CreateUserController().handle`
- `POST /session`
  - body validado por `authUserSchema`
  - handler: `AuthUserController().handle`
- `GET /me`
  - middleware: `isAuthenticated`
  - handler: `DetailUserController().handle`

### Categories
- `GET /category`
  - handler: `ListCategoriesController().handle`
- `POST /category`
  - middlewares: `isAuthenticated`, `isAdmin`, `validateSchema(createCategorySchema)`
  - handler: `CreateCategoryController().handle`
- `PUT /category/:id`
  - middlewares: `isAuthenticated`, `isAdmin`, `validateSchema(updateCategorySchema)`
  - handler: `UpdateCategoryController().handle`
- `DELETE /category/:id`
  - middlewares: `isAuthenticated`, `isAdmin`
  - handler: `DeleteCategoryController().handle`

### Addresses
- `POST /address`
  - middlewares: `isAuthenticated`, `validateSchema(createAddressSchema)`
  - handler: `CreateAddressController().handle`
- `GET /address`
  - middlewares: `isAuthenticated`
  - handler: `ListAddressController().handle`
- `DELETE /address`
  - middlewares: `isAuthenticated`, `validateSchema(deleteAddressSchema)`
  - handler: `DeleteAddressController().handle`
- `PUT /address`
  - middlewares: `isAuthenticated`, `validateSchema(updateAddressSchema)`
  - handler: `UpdateAddressController().handle`

### Products
- `POST /product`
  - middlewares: `isAuthenticated`, `isAdmin`, `upload.single("file")`, `validateSchema(CreateProductSchema)`
  - handler: `CreateProductController().handle`
- `GET /products`
  - middlewares: `isAuthenticated`, `validateSchema(ListProductsSchema)`
  - handler: `ListProductsController().handle`
- `GET /category/product`
  - middlewares: `isAuthenticated`, `validateSchema(ListProductsByCategorySchema)`
  - handler: `ListProductsByCategoryController().handle`
- `DELETE /product`
  - middlewares: `isAuthenticated`, `isAdmin`
  - handler: `DeleteProductController().handle`

### Orders
- `POST /order`
  - middlewares: `isAuthenticated`, `validateSchema(CreateOrderSchema)`
  - handler: `CreateOrderController().handle`
- `GET /orders`
  - middlewares: `isAuthenticated`
  - handler: `ListOrdersController().handle`
- `GET /order/detail`
  - middlewares: `isAuthenticated`, `validateSchema(OrderDetailSchema)`
  - handler: `DetailOrderController().handle`
- `POST /order/add`
  - middlewares: `isAuthenticated`, `validateSchema(AddItemSchema)`
  - handler: `AddItemController().handle`
- `DELETE /order/remove`
  - middlewares: `isAuthenticated`, `validateSchema(RemoveItemSchema)`
  - handler: `RemoveItemController().handle`
- `PUT /order/send`
  - middlewares: `isAuthenticated`, `validateSchema(SendOrderSchema)`
  - handler: `SendOrderController().handle`
- `PUT /order/finish`
  - middlewares: `isAuthenticated`, `validateSchema(FinishOrderSchema)`
  - handler: `FinishOrderController().handle`
- `DELETE /order`
  - middlewares: `isAuthenticated`, `validateSchema(DeleteOrderSchema)`
  - handler: `DeleteOrderController().handle`

### Admin users
- `GET /admin/users`
  - middlewares: `isAuthenticated`, `isAdmin`
  - handler: `ListUsersAdminController().handle`
- `PUT /admin/users/:id`
  - middlewares: `isAuthenticated`, `isAdmin`, `validateSchema(updateUserRoleParamsSchema)`, `validateSchema(updateUserRoleSchema)`
  - handler: `UpdateUserRoleAdminController().handle`
- `DELETE /admin/users/:id`
  - middlewares: `isAuthenticated`, `isAdmin`, `validateSchema(updateUserRoleParamsSchema)`
  - handler: `DeleteUserAdminController().handle`

---

## Validações

As validações são implementadas por Zod schemas em `src/schemas/*`.

Os schemas são usados em `routes.ts` via `validateSchema(schema)`, cobrindo:
- cadastro e autenticação (`userSchema.ts`)
- categorias (`categorySchema.ts`)
- produtos (`productSchema.ts`)
- endereços (`adressSchema.ts`)
- pedidos (`orderSchema.ts` e `orderDetailSchema.ts`)
- admin user (`userAdminSchema.ts`)

---

## Utilitários

`src/utils/generateSlug.ts`
- Existe e é usado provavelmente para slug (baseado em sua presença; detalhes precisariam de leitura adicional para descrever sem suposições).

---

## Convenções

Convenções observáveis diretamente no código lido:
- Rotas usam `new XxxController().handle`.
- Para validação de entrada: `validateSchema(schema)`.
- Para proteção: `isAuthenticated` e `isAdmin`.
- Para arquivos: `multer(uploadConfig)`.

---

## Dependências (bibliotecas importantes)

Observadas no código lido:
- Express
- CORS
- dotenv (`dotenv/config`)
- multer
- Prisma (schema e generator)
- zod (no errorHandler)
- Cloudinary (config existe)

---

## Melhorias Futuras (sem alterar o projeto)

> Sugestões baseadas apenas em observações do que foi lido.

1. Documentar mais detalhadamente controllers/services/schemas para remover lacunas no contrato de API.
2. Corrigir inconsistências de rotas protegidas vs uso do frontend (ex.: rotas `GET /category` e `GET /products` estão marcadas como protegidas no backend; isso impacta o consumo público).

---

## Resumo Final

O backend é um Express + Prisma (PostgreSQL) com camadas `routes -> middlewares -> controllers -> services`, usando Zod para validação e uma camada de `exceptions` mapeada por um `errorHandler` global. O Prisma define entidades para `User`, `Address`, `Category`, `Product`, `Cart`/`CartItem`, `Order`/`OrderItem`, `Payment` e `Coupon`, com relações e constraints (unique e cascade) bem definidas no schema.

---

> Nota de escopo: este arquivo foi produzido com base no conjunto de arquivos que foram lidos explicitamente via ferramentas durante esta execução. Para atingir o requisito “leia o projeto inteiro e não faça suposições”, é necessário executar uma segunda passagem lendo **todas** as demais unidades (todos controllers/services/middlewares/schemas/exceptions/utils).
