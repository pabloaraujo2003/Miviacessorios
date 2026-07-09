export interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  imageUrl: string;
  /** Cor dominante da foto (hex), usada como placeholder de fundo enquanto a imagem carrega */
  dominantColor?: string;
  collectionId?: string;
  features: string[];
  /** null/undefined = estoque não controlado; número = quantidade disponível */
  stock?: number | null;
  isBundle?: boolean;
  bundledProducts?: {
    id: string;
    name: string;
    price: string;
    features: string[];
  }[];
}

export const matchesCategory = (product: Product, categoryId: string): boolean => {
  if (categoryId === 'all') return true;
  if (categoryId === 'silver925') {
    return (product.features ?? []).some(f => f.toLowerCase().includes('prata 925'));
  }
  if (categoryId === 'goldplated') {
    return (product.features ?? []).some(f => f.toLowerCase().includes('banhado'));
  }
  return product.category === categoryId;
};

export const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'rings', label: 'Anéis' },
  { id: 'earrings', label: 'Brincos' },
  { id: 'necklaces', label: 'Colares' },
  { id: 'bracelets', label: 'Pulseiras' },
  { id: 'silver925', label: 'Prata 925' },
  { id: 'goldplated', label: 'Banhados' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Anel Horizonte Fluido',
    category: 'rings',
    price: 'R$ 289,00',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0PbLeJ1bq6KruCdv0rWz-17ZPqf92kOShmPFF7T3JFFWEHf8LMR57pi3r4NuYLInaD5zSWiuXJghOknHysaFNsJ-F5KGMx4mt_CgrsCRBTrf7LPQEI5qdLleUEKskuVamlBzKOGSvB9Xy_cGAoY-CmuRnld2Q3kjX9qNseSIdfDEy4XMg4MloKw9dv5j0esTRNy-8g_SWaLbIbpexzqqXOpdrhlVpJzf3ov1LW3sCKnwKoUrLgmYhFcICo9Ot4xjmrWFYcLl7XJTl',
    collectionId: 'Coleção Mivi',
    features: ['Prata 925', 'Esculpido']
  },
  {
    id: 'p-2',
    name: 'Brincos Gota de Orvalho',
    category: 'earrings',
    price: 'R$ 175,00',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdvtuZngiYnPrwaMOmuBFW6t3LiAVnGC9fu6KXqa5fCQPHkXQVsPx3zMfAbas875QXhETVzegdbkx6Rs1eI6BdUyo-2_U9A5NO_TmzHpAKOtZ9Ok8s0IqqXDqwWcBp_t1nQKazc7c-x7lUBRr4SPy6i6n1SDssZ6LSECuIrxE2OAogH3mkYTTy8TWgYlc9O0eJwK5v9suX5o2ALNpwVOz8Ucb1kaLp_ciNXiA3AoZ1hi-PF77XkqlIocaeqgQlIAev-RWwdoOyu46i',
    features: ['Prata 925', 'Polido'],
    stock: 2
  },
  {
    id: 'p-3',
    name: 'Colar Minimalista Nó',
    category: 'necklaces',
    price: 'R$ 342,00',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTV579xSLdvoF0JoHzqVjLRAmkb2n_fcbGBABy80ebzb6Zc8HsDklDGlmo39zWQ11AqhgZjc3X5s7Id20qszVeQEP3nW0L1kOiyFlcVrzsByrwynqg0DjfbtH8mRrMnQ_v5aS1QBmT12Hwa0x5zyQMUrdEyHTD6Iz2g8_EobciG9kDl5FbgguQTvrM0tTwUnbFJ6vsHHRaTpBbatDidrCB7xMh3NeFoSZ9S7xmq9Kc9mEIUOWxvhcwDKecObgn7kkgf3Zh54SMO0N5',
    features: ['Banhado a Ródio']
  },
  {
    id: 'p-4',
    name: 'Pulseira Elo Infinito',
    category: 'bracelets',
    price: 'R$ 510,00',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArcLMgUjjG3WmfPZz0IkhOIWoGcSOxQW1rCFNqczt72LrQiWCf7al5tP7cUXiisCELkogDFhPh80uL_pprjgMQnG905_YImD3L7Mr1IhZegwJrGA9XEYrlS_KdXZIyzYAkdmzPr4zfwP4trW1NZ1SdIN1FgPmTs518JsO1hjKq5P6D0SksLwJ4lI0iSnrL04dsLxIeafEvQy2kwyRnhWmFwwV6EwlfYSBsGEK-pIodoAE7PgKxo-H02RarSpBMJYBPHTg56zqSHneD',
    features: ['Prata 925', 'Geométrico'],
    stock: 0
  }
];
