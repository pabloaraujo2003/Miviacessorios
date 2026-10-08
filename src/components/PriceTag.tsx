import React from 'react';
import { formatPrice, getDiscountedValue, hasDiscount } from '../lib/pricing';

interface PriceTagProps {
  price: string;
  discountPercent?: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: { original: 'text-[0.65rem]', final: 'text-sm', badge: 'text-[0.55rem]' },
  md: { original: 'text-xs', final: 'text-base', badge: 'text-[0.6rem]' },
  lg: { original: 'text-sm', final: 'text-xl', badge: 'text-[0.6rem]' },
};

export const PriceTag: React.FC<PriceTagProps> = ({ price, discountPercent, size = 'md', className = '' }) => {
  const s = SIZES[size];

  if (!hasDiscount(discountPercent)) {
    return <span className={`font-body font-light text-on-surface ${s.final} ${className}`}>{price}</span>;
  }

  return (
    <span className={`inline-flex flex-col items-start leading-tight ${className}`}>
      <span className={`font-body text-red-600 line-through decoration-red-600 dark:text-red-400 dark:decoration-red-400 ${s.original}`}>
        {price}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className={`rounded-sm bg-red-600 px-1.5 py-0.5 font-label font-bold uppercase tracking-wider text-white ${s.badge}`}>
          -{discountPercent}%
        </span>
        <span className={`font-body font-semibold text-on-surface ${s.final}`}>
          {formatPrice(getDiscountedValue(price, discountPercent))}
        </span>
      </span>
    </span>
  );
};
