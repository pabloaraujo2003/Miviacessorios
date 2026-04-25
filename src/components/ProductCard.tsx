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

  const handleAddBundle = () => {
    if (product.isBundle && product.bundledProducts) {
      product.bundledProducts.forEach(p => {
        addToCart({
          id: p.id,
          name: p.name,
          price: p.price,
          features: p.features,
          category: product.category,
          imageUrl: product.imageUrl
        });
      });
    } else {
      addToCart(product);
    }
  };

  return (
    <article className={`group ${asymmetricClass} ${className}`}>
      <div className="relative mb-6 aspect-[4/5] overflow-hidden bg-surface-container-low">
        <img 
          alt={product.name} 
          className="interactive-media h-full w-full object-cover" 
          src={product.imageUrl}
        />
        
        {product.collectionId && (
          <div className="absolute top-4 left-4 bg-surface-container-highest px-3 py-1 text-[0.6rem] tracking-[0.1rem] uppercase">
            {product.collectionId}
          </div>
        )}

        {product.isBundle && product.bundledProducts && (
          <div className="absolute bottom-4 left-4 right-4 bg-surface-container-highest/90 backdrop-blur-sm p-3">
            <p className="font-label text-[0.6rem] tracking-widest uppercase mb-2 text-primary">Nesta foto:</p>
            <div className="space-y-2">
              {product.bundledProducts.map(p => (
                <div key={p.id} className="flex justify-between items-center gap-2">
                   <span className="font-body text-[0.7rem] truncate">{p.name}</span>
                   <button 
                    onClick={() => addToCart({...p, category: product.category, imageUrl: product.imageUrl})}
                    className="shrink-0 bg-primary text-on-primary p-1 rounded-sm active:scale-95 transition-transform"
                   >
                     <Plus className="w-3 h-3" />
                   </button>
                </div>
              ))}
            </div>
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
            onClick={handleAddBundle}
            className="interactive-surface flex min-w-0 flex-[3] items-center justify-center gap-2 bg-primary py-3 text-on-primary active:bg-primary-dim"
          >
            <Plus className="w-5 h-5 stroke-[1.5]" />
            <span className="truncate font-label text-[0.65rem] tracking-[0.15em] uppercase">
              {product.isBundle ? 'Adicionar Tudo' : 'Adicionar'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};
