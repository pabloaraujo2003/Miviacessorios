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
