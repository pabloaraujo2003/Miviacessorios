import { useMemo } from 'react';
import { CATEGORIES, matchesCategory } from '../data/mockData';
import { useAppContext } from '../context/appContextValue';
import { BLACK_FRIDAY_CATEGORY, isBlackFridayActive, isOnSale } from '../lib/campaign';

export interface CategoryOption {
  id: string;
  label: string;
  count: number;
  isBlackFriday: boolean;
}

/** Opções do filtro de categorias (com "Black Friday" na frente durante a campanha). */
export const useCategoryOptions = (): CategoryOption[] => {
  const { products } = useAppContext();
  const showBlackFriday = isBlackFridayActive();

  return useMemo(() => {
    const options: CategoryOption[] = CATEGORIES.map(cat => ({
      id: cat.id,
      label: cat.label,
      count: products.filter(p => matchesCategory(p, cat.id)).length,
      isBlackFriday: false,
    }));
    const blackFridayCount = showBlackFriday ? products.filter(isOnSale).length : 0;
    return blackFridayCount > 0
      ? [{ id: BLACK_FRIDAY_CATEGORY, label: 'Black Friday', count: blackFridayCount, isBlackFriday: true }, ...options]
      : options;
  }, [products, showBlackFriday]);
};
