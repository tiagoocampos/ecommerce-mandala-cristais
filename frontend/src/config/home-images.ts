// Fotos reais da loja para a Home. Enquanto a lista estiver vazia, a Home usa um
// fundo neutro da marca (nunca imagem quebrada).
//
// COMO TROCAR: coloque os arquivos em frontend/public/home/ (ex.: hero-1.webp) e preencha abaixo.
//  - Hero: horizontais (~2400x1200), sujeito à direita e área limpa à esquerda. Com 2 ou mais,
//    aparecem pontos e a troca automática.
//  - Sobre: foto horizontal (~1600x1000).
export type HomeImage = { src: string; alt: string; width: number; height: number };

export const HERO_IMAGES: HomeImage[] = [
    // { src: "/home/hero-1.webp", alt: "Drusa de ametista sobre bancada de pedra", width: 2400, height: 1200 },
];

export const ABOUT_IMAGE: HomeImage | null = null;
// export const ABOUT_IMAGE: HomeImage = { src: "/home/sobre.webp", alt: "…", width: 1600, height: 1000 };
