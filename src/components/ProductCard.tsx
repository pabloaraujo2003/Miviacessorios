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
  const [showBundleMenu, setShowBundleMenu] = React.useState(false);
  const [isZoomed, setIsZoomed] = React.useState(false);
  const saved = isSaved(product.id);

  // Add asymmetric spacing for even items matching the original design
  const asymmetricClass = index % 2 !== 0 ? 'md:mt-24' : '';

  const handleAddClick = () => {
    if (product.isBundle && product.bundledProducts) {
      setShowBundleMenu(!showBundleMenu);
    } else {
      addToCart(product);
    }
  };

  const handleAddAll = () => {
    if (product.bundledProducts) {
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
      setShowBundleMenu(false);
    }
  };

  return (
    <article className={`group ${asymmetricClass} ${className}`}>
      <div className="relative mb-6 aspect-[4/5] overflow-hidden bg-surface-container-low">
        <img 
          alt={product.name} 
          onClick={() => setIsZoomed(true)}
          className="interactive-media h-full w-full object-cover cursor-zoom-in" 
          src={product.imageUrl}
        />
        
        {product.collectionId && (
          <div className="absolute top-4 left-4 bg-surface-container-highest px-3 py-1 text-[0.6rem] tracking-[0.1rem] uppercase">
            {product.collectionId}
          </div>
        )}

        {product.isBundle && product.bundledProducts && showBundleMenu && (
          <div className="absolute bottom-0 left-0 right-0 bg-surface-container-highest p-4 pt-5 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-300 rounded-t-xl max-h-[85%] z-20">
            <div className="flex justify-between items-center mb-3">
              <p className="font-label text-[0.65rem] tracking-[0.2em] uppercase text-primary font-bold">Itens Disponíveis</p>
              <button onClick={() => setShowBundleMenu(false)} className="text-on-surface-variant hover:text-primary p-1">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto no-scrollbar mb-4">
              {product.bundledProducts.map(p => (
                <div key={p.id} className="flex justify-between items-center gap-3 border-b border-outline-variant/30 pb-2 last:border-0">
                   <div className="min-w-0">
                     <p className="font-body text-[0.75rem] leading-tight truncate text-on-surface font-medium">{p.name}</p>
                     <p className="font-body text-[0.65rem] text-on-surface-variant mt-0.5">{p.price}</p>
                   </div>
                   <button 
                    onClick={() => addToCart({...p, category: product.category, imageUrl: product.imageUrl})}
                    className="shrink-0 bg-primary text-on-primary p-2 rounded-sm active:scale-90 transition-transform shadow-sm"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                </div>
              ))}
            </div>
            <button 
              onClick={handleAddAll}
              className="w-full bg-primary text-on-primary py-2.5 text-[0.6rem] font-label uppercase tracking-widest active:bg-primary-dim transition-all rounded-sm shadow-md"
            >
              Adicionar Conjunto
            </button>
          </div>
        )}

        {/* Zoom Modal */}
        {isZoomed && (
          <div 
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 animate-in fade-in duration-300"
            onClick={() => setIsZoomed(false)}
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 z-[70]"
              onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
            >
              <Plus className="w-8 h-8 rotate-45 stroke-[1.5]" />
            </button>
            <div className="relative w-full h-full p-4 flex items-center justify-center">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="max-w-full max-h-full object-contain animate-in zoom-in-95 duration-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="absolute bottom-10 left-0 right-0 text-center">
              <p className="text-white/60 font-label text-[0.6rem] tracking-[0.3em] uppercase">Toque para fechar</p>
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
            onClick={handleAddClick}
            className={`interactive-surface flex min-w-0 flex-[3] items-center justify-center gap-2 py-3 text-on-primary transition-colors ${
              showBundleMenu ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary active:bg-primary-dim'
            }`}
          >
            <Plus className={`w-5 h-5 stroke-[1.5] transition-transform duration-300 ${showBundleMenu ? 'rotate-45' : ''}`} />
            <span className="truncate font-label text-[0.65rem] tracking-[0.15em] uppercase">
              {product.isBundle ? (showBundleMenu ? 'Fechar Seleção' : 'Ver Opções') : 'Adicionar'}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};
