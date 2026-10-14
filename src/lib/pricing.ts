// Convert R$ strings to numbers. e.g "R$ 1.289,00" -> 1289
export const parsePrice = (priceStr: string) => {
  const num = priceStr.replace(/[^\d,.]/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(num) || 0;
};

export const formatPrice = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const hasDiscount = (discountPercent?: number | null): discountPercent is number =>
  typeof discountPercent === 'number' && discountPercent > 0 && discountPercent < 100;

export const getDiscountedValue = (price: string, discountPercent?: number | null) => {
  const original = parsePrice(price);
  if (!hasDiscount(discountPercent)) return original;
  return Math.round(original * (100 - discountPercent)) / 100;
};

interface PricedProduct {
  price: string;
  isBundle?: boolean;
  bundledProducts?: { price: string }[];
}

/**
 * Preço de vitrine. Produto com várias opções (isBundle) costuma ter o preço
 * principal vazio ("R$ ") — cada opção tem o seu —, então exibe o menor preço
 * entre as opções; isFrom indica que há opções mais caras ("a partir de").
 */
export const displayPriceOf = (product: PricedProduct): { price: string; isFrom: boolean } => {
  const optionValues = product.isBundle
    ? (product.bundledProducts ?? []).map(option => parsePrice(option.price)).filter(value => value > 0)
    : [];

  if (optionValues.length === 0) {
    return { price: product.price, isFrom: false };
  }

  const min = Math.min(...optionValues);
  return { price: formatPrice(min), isFrom: optionValues.some(value => value !== min) };
};
