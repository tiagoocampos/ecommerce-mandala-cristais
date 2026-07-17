# PROJECT_CONTEXT.md — Mandala Cristais (E-commerce de Pedras, Cristais e Afins)

> Documento de contexto **baseado estritamente no que existe no repositório** (código e arquivos de documentação acessíveis), sem inferir regras de negócio não implementadas.
>
> Escopo do documento: descrever o produto como um sistema completo (visão de negócio e fluxo), sem entrar em “backend vs frontend” como foco.

---

## Visão Geral

### Objetivo do sistema
O sistema é uma plataforma de **e-commerce** voltada à venda de itens naturais e relacionados (pedras, cristais/minerais e categorias correlatas), com:
- navegação por catálogo e categorias;
- criação de conta, login e manutenção de sessão;
- cadastro e gestão de endereços do cliente;
- pedido com ciclo de vida de status (no domínio de pedidos/pagamentos) e integração de pagamento (por provedor configurado no modelo).

### Problema que resolve
- Centraliza o catálogo de produtos e facilita a compra **inteiramente pela internet**.
- Permite que o cliente gerencie dados essenciais para compras online (conta e endereços), reduzindo fricção no momento da compra.

### Público-alvo
- Clientes que desejam comprar online pedras/cristais/minerais e produtos correlatos.
- Usuários do tipo ADMIN que administram categorias e produtos e também gerenciam usuários.

### Tipo de negócio
- Loja virtual (e-commerce) com operação de catálogo, carrinho/pedido e fluxo de pagamento.

---

## Sobre o Projeto

O projeto representa um e-commerce especializado na venda de:
- **pedras naturais**;
- **cristais** e **minerais**;
- **acessórios relacionados** (refletidos pelo vocabulário do catálogo e categorias no front);
- demais produtos comercializados pela loja, conforme o catálogo que é mantido no sistema.

Todo o processo de compra é realizado **pela internet**, via navegação no site (front) e persistência/execução das operações do cliente no domínio (conta, endereços, pedidos e status).

### Propósito (experiência pretendida)
- Oferecer uma experiência de loja com identidade visual própria (“Mandala Cristais”), com navegação por categorias e apresentação de produtos.
- Para usuários logados, oferecer área de conta (“Minha conta / perfil”) com gerenciamento de endereços.

---

## Objetivos do Sistema

Os objetivos implementados/esperados, observados no repositório, incluem:
- **Permitir compras online** (criação de pedidos e itens do pedido).
- **Catálogo organizado** por categorias e produtos.
- **Autenticação e sessão** via JWT (login/cadastro e rota de perfil).
- **Gestão de conta e endereços** (cliente cadastrar/visualizar endereços).
- **Controle de pedidos**: criar pedido, adicionar/remover itens, enviar/ finalizar e acompanhar status.
- **Controle de estoque** no domínio do produto (campo `stock` e `disabled` no produto).
- **Administração**: criação/edição/exclusão de categorias e produtos; gerenciamento de usuários (papel/role).
- **Experiência de navegação e usabilidade** no front (paginação/grade, navegação por categorias e páginas de login/cadastro/perfil).

---

## Funcionalidades

Abaixo estão funcionalidades observadas no código.

### Identidade, conta e segurança
1. **Cadastro de usuários**
   - Rota de cadastro existe e valida payload.
2. **Login / sessão**
   - Emissão de token e persistência no navegador.
3. **Recuperação de acesso**
   - **Não encontrada** no repositório (sem rota/páginas/serviços de recuperação).
4. **Perfil do usuário**
   - Rota protegida de detalhes do usuário autenticado.

### Endereços (área do cliente)
5. **CRUD de endereços (parcialmente implementado no front)**
   - O backend possui rotas para:
     - criar endereço;
     - listar endereços;
     - atualizar endereço;
     - deletar endereço.
   - No front, a página **Profile** implementa:
     - criação de endereço;
     - listagem de endereços.
   - **Edição e remoção no front**: não estão evidenciadas nas páginas abertas no repositório (podem existir mas não foram lidas explicitamente nesta execução).

### Catálogo e navegação
6. **Categorias**
   - Existência de categorias no domínio.
   - No front, há navegação por categorias em formato de strip visual.
7. **Produtos**
   - Existência de listagem de produtos e filtro por “categoria”.
   - O front homepage busca e exibe produtos.
8. **Promoções/destaques**
   - O front exibe seções com recorte do array de produtos (ex.: “top picks” e “para iniciantes”), sem evidência explícita de um mecanismo de promoção no front além de `promo_price` existir no domínio.

### Pedidos e ciclo de vida
9. **Criação de pedidos**
   - Rota protegida para criar pedido.
10. **Itens do pedido**
   - Rotas para adicionar e remover itens.
11. **Envio e finalização do pedido**
   - Rotas para “send” e “finish”.
12. **Listagem e detalhes do pedido**
   - Rotas para listar pedidos e consultar detalhes.
13. **Cancelamento**
   - Existe status `CANCELED` no domínio (enum), mas nesta execução **não foi localizada** uma rota específica de cancelamento.

### Pagamentos
14. **Pagamento online (domínio de pagamento)**
   - Modelo `Payment` com `provider` (default “mercado_pago”) e campos de status, método e payload.
   - Statuses suportados: `PENDING`, `APPROVED`, `REJECTED`, `REFUNDED`.
   - O front exibido não evidencia UI completa de pagamento (checkout não foi lido nesta execução).

### Admin (gestão interna)
15. **Autorização por role (ADMIN)**
   - Rotas de administração são protegidas.
16. **Gerenciamento de categorias**
   - criação, atualização e exclusão (rotas admin).
17. **Gerenciamento de produtos**
   - criação com upload de imagem (multer) e exclusão (rotas admin).
18. **Gerenciamento de usuários**
   - listar usuários admin, atualizar role e excluir usuário (rotas admin).

---

## Fluxo de Compra (jornada do cliente)

> Observação: o front lido nesta execução mostra homepage e fluxo de login/cadastro e “Minha conta”. O checkout completo (carrinho/checkout/pagamento) não está visível nas páginas lidas explicitamente. Assim, o fluxo abaixo descreve o ciclo **até onde o projeto evidencia**, e inclui o ciclo do domínio de pedidos conforme existe na API.

### 1) Acesso e navegação
- O cliente acessa a homepage (“MandalaHome”).
- A página:
  - carrega categorias (CategoryStrip) e produtos (busca por `/products?disabled=false`).

### 2) Exploração do catálogo por categorias
- O componente de categorias navega para uma rota de categoria no formato:
  - `/categoria/<slug>`.

### 3) Visualização de produtos
- Os produtos são exibidos em grade (ProductGrid) a partir da listagem retornada pela API.
- A homepage também usa recortes para compor seções.

### 4) Login / cadastro (para ações autenticadas)
- Se o usuário precisa acessar a área autenticada:
  - ele faz login em `/login`.
  - ou cria conta em `/register`.
- Ao fazer login:
  - o token é armazenado em `localStorage`.
- Ao fazer cadastro:
  - ocorre cadastro e login automático (o front chama `/users` e depois `/session`).

### 5) Acesso à área do cliente (“Minha conta”)
- A rota “/profile” é protegida via componente `ProtectedRoute`.
- A página Profile:
  - carrega `/me` e `/address` em paralelo.
  - exibe dados do usuário e lista de endereços.

### 6) Cadastro de endereço
- O cliente preenche um formulário de endereço e envia para `POST /address`.
- O sistema valida e, se houver erro de validação, retorna detalhes no formato Zod (mapeado no front para erros de campos).

### 7) Pedido (domínio)
Conforme as rotas do domínio, o ciclo de pedidos suportado inclui:
- `POST /order` cria o pedido.
- `POST /order/add` adiciona itens.
- `DELETE /order/remove` remove itens.
- `PUT /order/send` altera estado para envio.
- `PUT /order/finish` finaliza pedido.
- `GET /orders` lista pedidos.
- `GET /order/detail` consulta detalhes.
- `DELETE /order` remove pedido.

---

## Perfis de Usuário

### Cliente (Role: CUSTOMER)
Responsabilidades no sistema:
- cadastrar conta e fazer login;
- manter sessão via token;
- acessar `/me` e visualizar dados;
- gerenciar seus endereços (criar e listar; edição/remoção no front não está evidenciada nesta execução, mas existe no backend);
- interagir com pedidos (criar pedido e acompanhar status) — por meio das rotas protegidas de order.

### Administrador (Role: ADMIN)
Responsabilidades no sistema:
- administrar **categorias**:
  - criar, atualizar e deletar.
- administrar **produtos**:
  - criar (com upload de imagem) e deletar (edição no domínio pode existir mas não foi lida nesta execução).
- administrar **usuários**:
  - listar usuários,
  - atualizar role,
  - excluir usuários.

---

## Catálogo

### Organização de categorias
- O domínio possui entidade `Category` com:
  - `name`;
  - `slug` único.
- No front, a navegação por categoria usa `slug` para compor a URL.

### Organização de produtos
- O domínio possui `Product` com:
  - `name`;
  - `slug` único;
  - `price` (inteiro);
  - `promo_price` opcional;
  - `description`;
  - `banner` (string, presumidamente URL de imagem);
  - `stock` (inteiro, padrão 0);
  - `disabled` (boolean), usado no front para filtrar disponibilidade.
- Produtos pertencem a uma `Category` via `category_id`.

### Imagens/banners
- O produto possui campo `banner` no banco.
- A criação de produto usa upload via `multer` (config existe no backend), e existe integração com Cloudinary.

---

## Carrinho

O repositório registra entidades de **cart** no banco:
- `Cart` (1-1 com `User`) e `CartItem` (quantidade e associação com `Product`).

Porém, nesta execução:
- as rotas de carrinho **não foram identificadas** no `routes.ts` lido (não há endpoints “cart” explícitos no arquivo de rotas exibido).
- o front lido não mostra uma página de carrinho/checkout.

Conclusão documental (sem suposição):
- o domínio suporta cart no modelo, mas a interface/rotas específicas de carrinho não foram descritas com base no que foi lido nesta execução.

---

## Checkout

O fluxo de checkout (UI) não foi evidenciado nas páginas lidas nesta execução.

No domínio de API, há rotas e entidades relacionadas ao processo de pedido e pagamento:
- `Order` com cálculos de `subtotal`, `discount`, `shipping_cost` e `total`.
- `Payment` com status e provider (default `mercado_pago`).

---

## Pagamentos

### Integração e status
- O modelo `Payment` suporta:
  - `provider` (default `mercado_pago`);
  - `provider_payment_id` (opcional);
  - `status` com enum `PaymentStatus`.
- Existem campos para:
  - método (`method` opcional)
  - payload bruto (`raw_payload` como JSON opcional).

### Confirmação e atualização de pedido
- O mecanismo de confirmação está ligado ao ciclo de vida do `Order` e à associação opcional `Order.payment`.
- Nesta execução, as rotas relacionadas a pagamento foram inferidas **somente** pela existência de rotas de ordem `send/finish` e dos modelos `Order`/`Payment`.
- Não foi lido explicitamente código de webhooks do provedor.

---

## Pedidos

### Status do pedido
- Enum `OrderStatus`: `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELED`.

### Ciclo de vida suportado pelas rotas
Com base no `routes.ts`:
- `POST /order` — criar pedido.
- `POST /order/add` — adicionar item.
- `DELETE /order/remove` — remover item.
- `PUT /order/send` — enviar pedido.
- `PUT /order/finish` — finalizar pedido.
- `GET /orders` — listar pedidos.
- `GET /order/detail` — detalhes do pedido (rota com schema de validação).
- `DELETE /order` — deletar pedido.

---

## Área Administrativa

A área administrativa é protegida por papel `ADMIN`.

### Endpoints admin do domínio (rotas)
- Categorias:
  - `POST /category`
  - `PUT /category/:id`
  - `DELETE /category/:id`
- Produtos:
  - `POST /product` (com upload de imagem)
  - `DELETE /product`
- Usuários admin:
  - `GET /admin/users`
  - `PUT /admin/users/:id`
  - `DELETE /admin/users/:id`

---

## Experiência do Usuário

### Mobile/Desktop
- O front utiliza componentes responsivos (classes Tailwind-like, ex.: `lg:` e breakpoints), e a navegação da StoreHeader tem comportamento de menu mobile.

### Facilidade de navegação
- Navegação principal:
  - homepage (`/`)
  - login (`/login`)
  - cadastro (`/register`)
  - perfil (`/profile`)
  - categorias (`/categoria/:slug`) — para navegação visual e descoberta.

### Desempenho
- Homepage busca produtos em `useEffect` e trata carregamento com estado `loadingProducts`.
- Categorias também carregam e possuem fallback caso haja erro.

### Acessibilidade/usabilidade
- Uso de componentes de UI e feedback (toast) via `sonner`.
- Formulários têm mensagens de erro por campo quando a API retorna `details` (Zod).

---

## Identidade Visual

### Conceito visual
- Paleta e componentes refletem uma identidade “mandala”:
  - destaque em cores como `mc-violet-950` e `mc-gold-500`/`mc-gold-600`.
- Tipografia e estilo:
  - logotipo/branding com “font-display” e texto italic no nome “Mandala Cristais”.

### Componentes e layout
- StoreHeader sticky com barra de busca (desktop) e menu (mobile).
- Seções com Hero, TrustStrip, CategoryStrip, ProductGrid e banners.

---

## Regras de Negócio

As regras abaixo são documentadas com base no que é possível observar no código/arquivos lidos (sem inferir além do que existe).

1. **Validação de payloads via Zod**
   - O sistema valida entrada para diversas rotas usando Zod.
   - Em caso de `ZodError`, retorna HTTP 400 com `details`.

2. **Autenticação via JWT**
   - Rotas protegidas requerem header `Authorization` com token Bearer.
   - Token é verificado com `process.env.JWT_SECRET`.
   - Se ausente ou inválido, lança `InvalidToken`.

3. **Autorização por role ADMIN**
   - Rotas admin exigem que o usuário autenticado tenha `role === "ADMIN"`.

4. **Unicidade de slug e email**
   - Banco: `Category.slug` é `@unique`.
   - Banco: `Product.slug` é `@unique`.
   - Banco: `User.email` é `@unique`.

5. **Estoque e disponibilidade do produto**
   - Produto possui `stock` e `disabled`.
   - O front filtra produtos por `disabled=false` ao buscar em `/products?disabled=false`.

6. **Associar endereço ao usuário**
   - Endereços são relacionados a `User`.
   - O backend possui tratamento de erros específicos (incluindo “not owned”/“not found”), indicando que endereços são scoped ao proprietário.

7. **Estados de pedido e de pagamento**
   - `OrderStatus` e `PaymentStatus` determinam o ciclo de vida no domínio.

---

## Funcionalidades Futuras (não implementadas — apenas identificáveis)

O repositório contém indícios de funcionalidades futuras/pendências em arquivos como `frontend/TODO.md`, porém esta execução não leu o conteúdo completo de TODOS os módulos.

Do que foi visto em `frontend/TODO.md`, existem itens planejados, por exemplo:
- ajustes de integração de API (VITE_API_URL) no front;
- normalização da autenticação e rotas no front;
- páginas de store (login/register/minha-conta) e ajustes de header;
- completar CRUD de endereços no front (editar/remover) e validações.

Como requisito, este documento **não implementa** nada; apenas registra como “futuro/planejado” conforme o arquivo de TODO.

---

## Resumo Final

O Mandala Cristais é um e-commerce especializado na venda de pedras naturais, cristais/minerais e itens correlatos, com operação 100% online. Ele oferece:
- catálogo com categorias e produtos (incluindo banner/imagem e controle de disponibilidade);
- autenticação e sessão via JWT;
- área do cliente para visualizar dados e gerenciar endereços;
- domínio de pedidos com itens e ciclo de vida de status;
- domínio de pagamentos com provider configurado no modelo (mercado_pago) e estados de pagamento.

O sistema é organizado por camadas no backend (middlewares/validação/exceções/services/controllers) e consome/representa essas capacidades no front por páginas como Home, Login, Register e Profile.

