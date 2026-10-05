# Mandala Cristais

E-commerce completo para uma loja de pedras naturais, cristais e minerais, com vitrine para o cliente e painel administrativo. Projeto freelance real, desenvolvido para um cliente.

**Demo:** https://mandala-crystais.vercel.app/


## Funcionalidades

**Loja (cliente)**
- Catálogo com categorias, busca, página de produto e carrossel de destaques
- Carrinho persistido por usuário
- Cadastro, login (JWT) e recuperação de senha por e-mail
- Gerenciamento de endereços e histórico de pedidos
- Checkout com cálculo de frete em tempo real e pagamento online
- Cupons de desconto (percentual ou valor fixo, primeira compra, cupons exclusivos por usuário)

**Painel administrativo**
- Dashboard com visão geral da loja
- CRUD de produtos (com upload de imagens), categorias e cupons
- Gestão de pedidos (atualização de status) e de usuários (papéis CUSTOMER / ADMIN)
- Configuração da vitrine (storefront) e da loja
- Disparo de e-mails de ofertas, com link de descadastro
- Botão "Pedir pra IA": gera descrição, meta description e texto alternativo da imagem do produto (Gemini)

## Integrações

| Serviço | Uso |
|---|---|
| Mercado Pago | Criação da preferência de pagamento e webhook de confirmação |
| Melhor Envio | Cotação de frete via OAuth2 (sandbox e produção) |
| Cloudinary | Armazenamento das imagens dos produtos |
| Brevo | E-mails transacionais (redefinição de senha) e de marketing |
| Google Gemini | Geração de textos e SEO dos produtos |

## Stack

**Frontend**
- React 19, TypeScript e Vite
- Tailwind CSS 4 e shadcn/ui (Radix)
- React Router 7 e Axios

**Backend**
- Node.js, Express 5 e TypeScript
- PostgreSQL com Prisma ORM 7
- Autenticação com JWT e bcrypt
- Validação de entrada com Zod
- Upload com Multer

## Arquitetura do backend

```
Rota → Middlewares (validação Zod, autenticação, admin) → Controller → Service → Prisma → PostgreSQL
```

- **Controllers**: recebem a requisição e devolvem a resposta.
- **Services**: concentram as regras de negócio (pedido, cupom, frete, pagamento).
- **Middlewares**: `validateSchema` (Zod), `isAuthenticated` (JWT), `isAdmin` e um `errorHandler` global que converte erros de validação e de domínio em respostas HTTP padronizadas.
- **Exceptions**: classes de erro por domínio (usuário, produto, pedido, endereço...).

```
backend/src
├── controllers/   # por domínio (product, order, coupon, payment...)
├── services/      # regras de negócio
├── schemas/       # validações Zod
├── middlewares/
├── exceptions/
├── config/        # Cloudinary, Multer, Melhor Envio, Brevo, Gemini
└── routes.ts
```

Modelo de dados principal: `User`, `Address`, `Category`, `Product`, `Cart`/`CartItem`, `Order`/`OrderItem`, `Payment`, `Coupon`, `StoreSettings` e `IntegrationToken`.

## Como rodar localmente

Pré-requisitos: Node.js 20+ e um banco PostgreSQL.

### Backend

```bash
cd backend
npm install
cp .env.example .env      # preencha as variáveis (veja abaixo)
npx prisma generate
npx prisma migrate dev
npm run dev               # http://localhost:3000
```

Variáveis principais do `.env`:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão do PostgreSQL |
| `JWT_SECRET` | Segredo para assinar os tokens |
| `FRONTEND_URL` / `BACKEND_URL` | URLs usadas em links de e-mail e callbacks |
| `MERCADOPAGO_ACCESS_TOKEN` | Pagamentos |
| `CLOUDINARY_*` | Upload de imagens |
| `MELHORENVIO_*`, `STORE_ZIP_CODE` | Cotação de frete |
| `BREVO_*` | Envio de e-mails |
| `GEMINI_API_KEY` | Geração de textos com IA |

Todas estão documentadas em `backend/.env.example`.

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3000" > .env
npm run dev
```

## Scripts

| Pasta | Comando | O que faz |
|---|---|---|
| backend | `npm run dev` | Servidor com hot reload (tsx) |
| backend | `npm run build` / `npm start` | Gera o Prisma Client, compila e executa |
| frontend | `npm run dev` | Servidor de desenvolvimento (Vite) |
| frontend | `npm run build` | Build de produção |
| frontend | `npm run lint` | ESLint |

## Autor

Tiago Campos da Silva — [LinkedIn](https://linkedin.com/in/tiagocamposdasilva) · [GitHub](https://github.com/tiagoocampos)
