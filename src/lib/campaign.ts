import type { Product } from '../data/mockData';
import { hasDiscount } from './pricing';

/**
 * Black Friday: ligada por datas fixas (horário de Brasília). Para mudar o
 * período, edite aqui e faça deploy. Só entram os produtos com desconto
 * cadastrado no Admin ("discountPercent").
 */
export const BLACK_FRIDAY = {
  start: new Date('2026-11-16T00:00:00-03:00'),
  end: new Date('2026-11-30T23:59:59-03:00'),
};

// Em dev, ?bf=1 na URL força a campanha para pré-visualizar antes das datas
const isForcedInDev = (): boolean =>
  import.meta.env.DEV && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('bf') === '1';

export const isBlackFridayActive = (now: Date = new Date()): boolean =>
  isForcedInDev() || (now >= BLACK_FRIDAY.start && now <= BLACK_FRIDAY.end);

// "30/11", no fuso de Brasília
export const blackFridayEndLabel = BLACK_FRIDAY.end.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

export const BLACK_FRIDAY_CATEGORY = 'blackfriday';

// Em promoção = tem desconto e não está esgotado
export const isOnSale = (product: Product): boolean =>
  hasDiscount(product.discountPercent) && product.stock !== 0;

export const maxDiscountOf = (products: Product[]): number | null => {
  const discounts = products.filter(isOnSale).map(p => p.discountPercent as number);
  return discounts.length > 0 ? Math.max(...discounts) : null;
};

// Produtos em promoção primeiro; a ordem original (mais recentes) é mantida em cada grupo
export const onSaleFirst = (products: Product[]): Product[] => [
  ...products.filter(isOnSale),
  ...products.filter(p => !isOnSale(p)),
];
