import React from 'react';
import type { Product } from '../data/mockData';
import { Heart, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
  index: number;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  index, 
  className = '' 
}) => {
  const { addToCart, toggleSaved, isSaved } = useAppContext();
  const saved = isSaved(product.id);

  // Add asymmetric spacing for even items matching the original design
  const asymmetricClass = index % 2 !== 0 ? 'md:mt-24' : '';

  return (
    <article className={`group ${asymmetricClass} ${className}`}>
      <div className="relative mb-6 aspect-[4/5] overflow-hidden bg-surface-container-low transition-colors duration-300 md:group-hover:bg-surface-variant/30">
        <img 
          alt={product.name} 
          className="interactive-media h-full w-full object-cover grayscale md:group-hover:scale-105 md:group-hover:grayscale-0" 
          src={product.imageUrl}
        />
        
        {product.collectionId && (
          <div className="absolute top-4 left-4 bg-surface-container-highest px-3 py-1 text-[0.6rem] tracking-[0.1rem] uppercase">
            {product.collectionId}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex flex-col">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h3 className="break-words font-headline text-xl text-on-surface">
              {product.name}
            </h3>
            <p className="break-words font-label text-[0.75rem] text-outline tracking-wider uppercase">
              {product.features.join(' • ')}
            </p>
          </div>
          <span className="shrink-0 font-body text-lg font-light text-on-surface">
            {product.price}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => toggleSaved(product)}
            className={`interactive-surface flex flex-1 items-center justify-center border py-3 ${
              saved 
                ? 'border-error text-error bg-error/5' 
                : 'border-outline-variant text-on-surface-variant active:border-primary active:text-primary'
            }`}
          >
            <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''} stroke-[1.5]`} />
          </button>
          
          <button 
            onClick={() => addToCart(product)}
            className="interactive-surface flex min-w-0 flex-[3] items-center justify-center gap-2 bg-primary py-3 text-on-primary active:bg-primary-dim"
          >
            <Plus className="w-5 h-5 stroke-[1.5]" />
            <span className="truncate font-label text-[0.65rem] tracking-[0.15em] uppercase">Adicionar</span>
          </button>
        </div>
      </div>
    </article>
  );
};
