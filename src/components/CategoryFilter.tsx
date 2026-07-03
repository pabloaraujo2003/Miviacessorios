import React, { useState } from 'react';
import { CATEGORIES, matchesCategory } from '../data/mockData';
import { useAppContext } from '../context/appContextValue';

interface CategoryFilterProps {
  className?: string;
  onSelectCategory?: (id: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  className = '',
  onSelectCategory
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { products } = useAppContext();

  const handleSelect = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    e.preventDefault();
    setActiveCategory(id);
    if (onSelectCategory) {
      onSelectCategory(id);
    }
  };

  return (
    <nav className={`mb-14 overflow-x-auto no-scrollbar whitespace-nowrap border-y hairline py-4 ${className}`} aria-label="Filtro de categorias">
      <div className="flex min-w-max items-baseline justify-start gap-7 px-2 sm:justify-center sm:gap-10 sm:px-4">
        {CATEGORIES.map((cat, index) => {
          const isActive = cat.id === activeCategory;
          const count = products.filter(p => matchesCategory(p, cat.id)).length;
          return (
            <button
              key={cat.id}
              type="button"
              aria-pressed={isActive}
              onClick={(e) => handleSelect(e, cat.id)}
              className={`interactive-text group flex items-baseline gap-1.5 px-1 py-1 active:scale-[0.98] ${
                isActive ? 'text-on-surface' : 'text-on-surface-variant'
              }`}
            >
              <span className={`font-body text-[0.55rem] tabular-nums transition-opacity ${isActive ? 'text-primary opacity-100' : 'text-outline opacity-60'}`}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={isActive
                ? 'font-headline italic text-base leading-none'
                : 'font-label text-[0.6875rem] uppercase tracking-[0.15rem] leading-none'
              }>
                {cat.label}
              </span>
              {count > 0 && (
                <sup className={`font-body text-[0.55rem] tabular-nums ${isActive ? 'text-primary' : 'text-outline-variant'}`}>
                  {count}
                </sup>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
