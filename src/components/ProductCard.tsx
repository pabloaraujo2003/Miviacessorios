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
      <div className="relative bg-surface-container-low aspect-[4/5] mb-6 overflow-hidden transition-colors duration-500 group-hover:bg-surface-variant/30">
        <img 
          alt={product.name} 
          className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0" 
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
            className={`flex-1 flex justify-center items-center py-3 border transition-all active:scale-95 ${
              saved 
                ? 'border-error text-error bg-error/5' 
                : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
            }`}
          >
            <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''} stroke-[1.5]`} />
          </button>
          
          <button 
            onClick={() => addToCart(product)}
            className="flex-[3] min-w-0 flex justify-center items-center gap-2 bg-primary text-on-primary py-3 hover:bg-primary-dim transition-colors active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[1.5]" />
            <span className="truncate font-label text-[0.65rem] tracking-[0.15em] uppercase">Adicionar</span>
          </button>
        </div>
      </div>
    </article>
  );
};
