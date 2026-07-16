# Frontend — Mandala Cristais (base visual)

Este pacote contém a primeira leva de telas/componentes da loja, construída
em cima da mesma base técnica do Coffee Shop (Vite + React + TypeScript +
Tailwind v4 + shadcn/ui + lucide-react), com uma identidade visual própria.

## O que tem aqui

```
src/
├── mandala-theme.css                  → tokens de cor/tipografia (colar no index.css)
├── types/mandala.ts                    → tipo MandalaProduct (mescle no types/index.ts)
├── components/store/
│   ├── AnnouncementBar.tsx              → faixa de cupom no topo
│   ├── StoreHeader.tsx                   → cabeçalho + busca + categorias + carrinho
│   ├── Hero.tsx                           → banner principal (com o corte de "faceta")
│   ├── TrustStrip.tsx                      → faixa de confiança (frete, parcelamento...)
│   ├── CategoryStrip.tsx                    → atalhos por categoria
│   ├── ProductCard.tsx                       → card de produto
│   ├── ProductGrid.tsx                        → seção com título + grid de produtos
│   ├── PromoBanner.tsx                         → banner de promoção/kit em destaque
│   └── StoreFooter.tsx                          → rodapé com newsletter
├── pages/store/
│   └── Home.tsx                                  → página inicial, compõe tudo acima
└── routes.tsx                                      → exemplo de rota "/" apontando pra Home
```

## Como instalar na sua base do projeto Mandala Cristais

1. **Copie as pastas** `components/store`, `pages/store` e `types/mandala.ts`
   para dentro do seu `frontend/src/` já existente (o que veio do
   coffee-shop copiado).

2. **Adicione a fonte e os tokens de cor.** Abra seu `src/index.css` atual
   e cole o conteúdo de `mandala-theme.css` no final do arquivo (depois dos
   imports do Tailwind/shadcn que já existem lá). Isso cria as classes
   `bg-mc-violet-950`, `text-mc-gold-500`, `font-display`, etc., além da
   classe de assinatura `.facet-cut` (o corte de faceta usado no hero, nos
   cards de produto e nos botões principais).

3. **Mescle o tipo de produto.** Adicione o conteúdo de `types/mandala.ts`
   ao seu `types/index.ts`, ou apenas importe de `types/mandala.ts`
   diretamente como os componentes já fazem.

4. **Substitua (ou combine) o `routes.tsx`.** Se você já tem rotas de login/
   cadastro do módulo de usuário que construímos, adicione a rota da Home
   junto das suas:
   ```tsx
   import { MandalaHome } from "./pages/store/Home";
   // ...
   <Route path="/" element={<MandalaHome />} />
   ```

5. **Rode o projeto:**
   ```bash
   npm run dev
   ```

## Próximos passos (quando o backend estiver pronto)

- Trocar o `MOCK_PRODUCTS` em `pages/store/Home.tsx` por uma chamada real:
  ```ts
  const { data } = await api.get<MandalaProduct[]>("/products");
  ```
- Ligar o `onAddToCart` a um Context/Zustand de carrinho de verdade (hoje
  ele só mostra um toast e incrementa um contador local).
- Criar as páginas de detalhe do produto (`/produto/:slug`), listagem por
  categoria (`/categoria/:slug`) e o fluxo de carrinho/checkout.
- Trocar as fotos ilustrativas (hoje os cards mostram um emoji de fallback
  quando `banner` está vazio) pelas imagens reais assim que o upload via
  Cloudinary estiver funcionando no backend.

## Nota de design

A identidade usa ametista (`mc-violet`) como cor primária, dourado
(`mc-gold`) como destaque de ação, e um fundo areia quente (`mc-sand`) em
vez de branco puro. O elemento de assinatura é o "corte de faceta" — um
canto cortado em diagonal (clip-path), usado com moderação na moldura do
hero, nas imagens de produto e no botão principal, simulando o corte de
uma gema. É a única "ousadia" visual proposital; o resto do layout é
deliberadamente contido para não competir com esse elemento.
