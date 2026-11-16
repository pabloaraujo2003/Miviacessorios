import React from 'react';
import { useCategoryOptions } from '../hooks/useCategoryOptions';

interface CategoryFilterProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  className?: string;
}

/**
 * Índice de categorias no topo do catálogo. No desktop gruda abaixo do header;
 * no celular rola com a página (lá o filtro fica no MobileCategorySheet).
 */
export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  activeCategory,
  onSelectCategory,
  className = '',
}) => {
  const options = useCategoryOptions();
  const regularOptions = options.filter(option => !option.isBlackFriday);
  const blackFriday = options.find(option => option.isBlackFriday);
  const isBlackFridaySelected = blackFriday?.id === activeCategory;

  const handleSelect = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    e.preventDefault();
    onSelectCategory(id);
  };

  return (
    <nav
      className={`z-30 -mx-4 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap border-y hairline bg-background/95 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:mb-14 sm:px-6 sm:py-4 md:sticky lg:-mx-8 lg:px-8 ${className}`}
      style={{ top: 'var(--header-h, 77px)' }}
      aria-label="Filtro de categorias"
    >
      <div className="flex min-w-max items-baseline justify-start gap-5 sm:justify-center sm:gap-10 sm:px-4">
        {blackFriday && (
          <button
            type="button"
            aria-pressed={isBlackFridaySelected}
            onClick={(e) => handleSelect(e, blackFriday.id)}
            className={`interactive-text flex items-baseline gap-1.5 self-center px-2 py-1 font-label sm:px-2.5 sm:py-1.5 text-[0.6875rem] uppercase leading-none tracking-[0.15rem] active:scale-[0.98] ${
              isBlackFridaySelected ? 'bg-[#0c0c0c] text-white' : 'border border-[#0c0c0c] text-[#0c0c0c] dark:border-white dark:text-white'
            }`}
          >
            {blackFriday.label}
            <sup className={`font-body text-[0.55rem] tabular-nums ${isBlackFridaySelected ? 'text-[#ff5a5f]' : 'text-outline'}`}>
              {blackFriday.count}
            </sup>
          </button>
        )}
        {regularOptions.map((option, index) => {
          const isActive = option.id === activeCategory;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              onClick={(e) => handleSelect(e, option.id)}
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
                {option.label}
              </span>
              {option.count > 0 && (
                <sup className={`font-body text-[0.55rem] tabular-nums ${isActive ? 'text-primary' : 'text-outline-variant'}`}>
                  {option.count}
                </sup>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
