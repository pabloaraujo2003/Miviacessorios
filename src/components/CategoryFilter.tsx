import React, { useState } from 'react';
import { CATEGORIES } from '../data/mockData';

interface CategoryFilterProps {
  className?: string;
  onSelectCategory?: (id: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  className = '', 
  onSelectCategory 
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleSelect = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    e.preventDefault();
    setActiveCategory(id);
    if (onSelectCategory) {
      onSelectCategory(id);
    }
  };

  return (
    <nav className={`mb-12 overflow-x-auto no-scrollbar whitespace-nowrap py-2 ${className}`}>
      <div className="flex min-w-max items-center justify-start space-x-6 px-2 sm:justify-center sm:space-x-10 sm:px-4">
        {CATEGORIES.map((cat) => {
          const isActive = cat.id === activeCategory;
          return (
            <button 
              key={cat.id}
              type="button"
              onClick={(e) => handleSelect(e, cat.id)}
              className={`interactive-text rounded-full px-1 py-2 font-label text-[0.6875rem] uppercase tracking-[0.15rem] active:scale-[0.98] ${
                isActive 
                  ? "text-primary font-semibold border-b border-primary/40 pb-1" 
                  : "text-on-surface-variant"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
