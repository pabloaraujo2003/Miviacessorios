import React from 'react';
import { createPortal } from 'react-dom';
import type { Product } from '../data/mockData';
import { CATEGORIES } from '../data/mockData';
import { Heart, Plus, Share2 } from 'lucide-react';
import { useAppContext } from '../context/appContextValue';
import { optimizedImageUrl, optimizedSrcSet } from '../lib/images';

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
  const productFeatures = product.features ?? [];
  const bundledProducts = product.bundledProducts ?? [];
  const hasBundleOptions = Boolean(product.isBundle && bundledProducts.length > 0);
  const isOutOfStock = product.stock === 0;
  const isLowStock = typeof product.stock === 'number' && product.stock > 0 && product.stock <= 3;
  const indexLabel = String(index + 1).padStart(2, '0');
  const categoryLabel = CATEGORIES.find(c => c.id === product.category)?.label ?? product.category;

  // Add asymmetric spacing for even items matching the original design
  const asymmetricClass = index % 2 !== 0 ? 'md:mt-24' : '';
  const closeZoom = React.useCallback(() => setIsZoomed(false), []);
  const openZoom = React.useCallback(() => setIsZoomed(true), []);

  React.useEffect(() => {
    if (!isZoomed) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeZoom();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeZoom, isZoomed]);

  const handleAddClick = (): void => {
    if (isOutOfStock) {
      return;
    }
    if (hasBundleOptions) {
      setShowBundleMenu(prev => !prev);
    } else {
      addToCart(product);
    }
  };

  const handleAddAll = (): void => {
    bundledProducts.forEach(p => {
      addToCart({
        id: p.id,
        name: p.name,
        price: p.price,
        features: p.features ?? [],
        category: product.category,
        imageUrl: product.imageUrl
      });
    });
    setShowBundleMenu(false);
  };

  const handleShare = async (): Promise<void> => {
    const shareData = {
      title: product.name,
      text: `${product.name} — ${product.price}\n${productFeatures.join(' • ')}`,
      url: window.location.href,
    };
    if (navigator.share && navigator.canShare?.(shareData)) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
    }
  };

  const zoomModal = isZoomed
    ? createPortal(
        <div
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-300"
          onClick={closeZoom}
          role="dialog"
        >
          <button
            aria-label="Fechar imagem ampliada"
            type="button"
            className="absolute right-4 top-4 z-[110] flex h-12 w-12 items-center justify-center text-white/80 transition-colors hover:text-white sm:right-6 sm:top-6"
            onClick={(event) => {
              event.stopPropagation();
              closeZoom();
            }}
          >
            <Plus className="h-8 w-8 rotate-45 stroke-[1.5]" />
          </button>
          <div className="flex h-full w-full items-center justify-center p-4 sm:p-8">
            <img
              src={optimizedImageUrl(product.imageUrl, 1600, 82)}
              alt={product.name}
              decoding="async"
              className="max-h-full max-w-full object-contain animate-in zoom-in-95 duration-500"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
          <div className="pointer-events-none absolute bottom-8 left-0 right-0 text-center">
            <p className="font-label text-[0.6rem] uppercase tracking-[0.3em] text-white/60">Toque para fechar</p>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <article
        className={`group animate-fade-up ${asymmetricClass} ${className}`}
        style={{ animationDelay: `${Math.min(index, 6) * 90}ms` }}
      >
        <div className="relative mb-6 aspect-[4/5] overflow-hidden bg-surface-container-low">
          <button
            type="button"
            aria-label={`Ampliar imagem de ${product.name}`}
            className="block h-full w-full cursor-zoom-in overflow-hidden text-left"
            onClick={openZoom}
          >
            <img
              alt={product.name}
              className={`interactive-media h-full w-full object-cover duration-700 md:group-hover:scale-[1.04] ${isOutOfStock ? 'grayscale opacity-80' : ''}`}
              src={optimizedImageUrl(product.imageUrl, 640)}
              srcSet={optimizedSrcSet(product.imageUrl, 640)}
              sizes="(min-width: 768px) 50vw, 100vw"
              loading={index < 2 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : undefined}
              decoding="async"
            />
          </button>
        
        {product.collectionId && (
          <div className="absolute top-4 left-4 bg-surface-container-highest px-3 py-1 text-[0.6rem] tracking-[0.1rem] uppercase">
            {product.collectionId}
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute top-4 right-4 bg-error text-on-error px-3 py-1 text-[0.6rem] tracking-[0.1rem] uppercase">
            Esgotado
          </div>
        )}

        {isLowStock && (
          <div className="absolute top-4 right-4 bg-surface-container-highest text-error px-3 py-1 text-[0.6rem] tracking-[0.1rem] uppercase">
            {product.stock === 1 ? 'Última unidade' : `Restam ${product.stock}`}
          </div>
        )}

        {hasBundleOptions && showBundleMenu && (
          <div className="absolute bottom-0 left-0 right-0 bg-surface-container-highest p-4 pt-5 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-300 rounded-t-xl max-h-[85%] z-20">
            <div className="flex justify-between items-center mb-3">
              <p className="font-label text-[0.65rem] tracking-[0.2em] uppercase text-primary font-bold">Itens Disponíveis</p>
              <button type="button" aria-label="Fechar opções do conjunto" onClick={() => setShowBundleMenu(false)} className="text-on-surface-variant hover:text-primary p-1">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <div className="space-y-3 overflow-y-auto no-scrollbar mb-4">
              {bundledProducts.map(p => (
                <div key={p.id} className="flex justify-between items-center gap-3 border-b border-outline-variant/30 pb-2 last:border-0">
                   <div className="min-w-0">
                     <p className="font-body text-[0.75rem] leading-tight truncate text-on-surface font-medium">{p.name}</p>
                     <p className="font-body text-[0.65rem] text-on-surface-variant mt-0.5">{p.price}</p>
                   </div>
                   <button 
                    type="button"
                    aria-label={`Adicionar ${p.name}`}
                    onClick={() => addToCart({...p, features: p.features ?? [], category: product.category, imageUrl: product.imageUrl})}
                    className="shrink-0 bg-primary text-on-primary p-2 rounded-sm active:scale-90 transition-transform shadow-sm"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                </div>
              ))}
            </div>
            <button 
              type="button"
              aria-label={`Adicionar conjunto ${product.name}`}
              onClick={handleAddAll}
              className="w-full bg-primary text-on-primary py-2.5 text-[0.6rem] font-label uppercase tracking-widest active:bg-primary-dim transition-all rounded-sm shadow-md"
            >
              Adicionar Conjunto
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex flex-col">
        <p className="mb-2 flex items-baseline gap-2 font-label text-[0.6rem] uppercase tracking-[0.25em] text-outline">
          <span className="font-body tabular-nums text-primary">{indexLabel}</span>
          <span aria-hidden="true" className="h-px w-6 self-center bg-outline-variant/60" />
          {categoryLabel}
        </p>
        <div className="mb-4 flex flex-col gap-3 border-b hairline pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h3 className="break-words font-headline text-xl text-on-surface">
              {product.name}
            </h3>
            <p className="break-words font-label text-[0.75rem] text-outline tracking-wider uppercase">
              {productFeatures.join(' • ')}
            </p>
          </div>
          <span className={`shrink-0 font-body text-lg font-light ${isOutOfStock ? 'text-outline-variant line-through decoration-1' : 'text-on-surface'}`}>
            {product.price}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            aria-label={`Compartilhar ${product.name}`}
            onClick={() => { void handleShare(); }}
            className="interactive-surface flex items-center justify-center border border-outline-variant text-on-surface-variant py-3 px-3 active:border-primary active:text-primary"
          >
            <Share2 className="w-4 h-4 stroke-[1.5]" />
          </button>

          <button
            type="button"
            aria-label={saved ? `Remover ${product.name} dos favoritos` : `Salvar ${product.name} nos favoritos`}
            aria-pressed={saved}
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
            type="button"
            aria-expanded={hasBundleOptions ? showBundleMenu : undefined}
            aria-label={isOutOfStock ? `${product.name} esgotado` : hasBundleOptions ? `${showBundleMenu ? 'Fechar opções de' : 'Ver opções de'} ${product.name}` : `Adicionar ${product.name} à sacola`}
            disabled={isOutOfStock}
            onClick={handleAddClick}
            className={`interactive-surface flex min-w-0 flex-[3] items-center justify-center gap-2 py-3 text-on-primary transition-colors ${
              isOutOfStock
                ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-60'
                : showBundleMenu ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary active:bg-primary-dim'
            }`}
          >
            {!isOutOfStock && <Plus className={`w-5 h-5 stroke-[1.5] transition-transform duration-300 ${showBundleMenu ? 'rotate-45' : ''}`} />}
            <span className="truncate font-label text-[0.65rem] tracking-[0.15em] uppercase">
              {isOutOfStock ? 'Esgotado' : product.isBundle ? (showBundleMenu ? 'Fechar Seleção' : 'Ver Opções') : 'Adicionar'}
            </span>
          </button>
        </div>
      </div>
      </article>
      {zoomModal}
    </>
  );
};
