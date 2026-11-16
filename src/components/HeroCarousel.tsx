import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Product } from '../data/mockData';
import { useAppContext } from '../context/appContextValue';
import { optimizedImageUrl, optimizedSrcSet } from '../lib/images';
import { displayPriceOf, formatPrice, getDiscountedValue, hasDiscount } from '../lib/pricing';
import { isBlackFridayActive, isOnSale } from '../lib/campaign';

const MAX_SLIDES = 5;
const AUTOPLAY_MS = 5000;

interface HeroCarouselProps {
  // Chamado pelo botão do slide: na Black Friday abre o filtro de ofertas
  onShopClick: () => void;
  className?: string;
}

/**
 * Destaques do topo montados com as fotos dos próprios produtos: na Black
 * Friday, as peças em promoção; fora dela, as mais recentes em estoque.
 * Rolagem nativa com scroll-snap (o deslizar do dedo é do navegador) e
 * avanço automático, pausado enquanto a pessoa interage.
 */
export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onShopClick, className = '' }) => {
  const { products, isLoadingProducts } = useAppContext();
  const isBlackFriday = isBlackFridayActive();
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = useMemo<Product[]>(() => {
    const onSale = isBlackFriday ? products.filter(isOnSale) : [];
    const pool = onSale.length > 0 ? onSale : products.filter(p => p.stock !== 0);
    return pool.slice(0, MAX_SLIDES);
  }, [products, isBlackFriday]);

  // No celular cabe 1 slide por vez; no desktop, 3 lado a lado. positions = paradas possíveis
  const [perView, setPerView] = useState(1);
  const positions = Math.max(1, slides.length - perView + 1);

  const slideStep = (track: HTMLDivElement): number => {
    const [first, second] = track.children as unknown as HTMLElement[];
    if (!first) return track.clientWidth;
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => setPerView(Math.max(1, Math.round(track.clientWidth / slideStep(track))));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => observer.disconnect();
  }, [slides.length]);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * slideStep(track), behavior: 'smooth' });
  }, []);

  const handleScroll = (): void => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setActiveIndex(Math.round(track.scrollLeft / slideStep(track)));
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isPaused || reduceMotion || positions < 2) return;
    const timer = window.setTimeout(() => {
      if (document.visibilityState === 'visible') {
        goTo((activeIndex + 1) % positions);
      }
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, isPaused, positions, goTo]);

  const heightClass = 'h-[440px] sm:h-[520px] md:h-auto';

  if (slides.length === 0) {
    return isLoadingProducts
      ? <div className={`-mx-4 mb-12 animate-pulse bg-surface-container-high sm:mx-0 md:aspect-[12/5] ${heightClass} ${className}`} />
      : null;
  }

  const showsOffers = isBlackFriday && slides.some(isOnSale);

  return (
    <section
      className={`relative -mx-4 mb-12 overflow-hidden sm:mx-0 ${heightClass} ${className}`}
      aria-roledescription="carrossel"
      aria-label={showsOffers ? 'Ofertas da Black Friday' : 'Novidades'}
      onPointerDown={() => setIsPaused(true)}
      onPointerUp={() => setIsPaused(false)}
      onPointerCancel={() => setIsPaused(false)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain md:gap-2"
      >
        {slides.map((product, index) => {
          const { price, isFrom } = displayPriceOf(product);
          const discounted = hasDiscount(product.discountPercent);
          return (
            <article
              key={product.id}
              className="relative h-full w-full shrink-0 snap-start bg-surface-container-high md:aspect-[4/5] md:h-auto md:w-[calc((100%-1rem)/3)]"
              aria-roledescription="slide"
              aria-label={`${index + 1} de ${slides.length}: ${product.name}`}
            >
              <img
                alt={product.name}
                className="h-full w-full object-cover"
                src={optimizedImageUrl(product.imageUrl, 1280)}
                srcSet={optimizedSrcSet(product.imageUrl, 1280)}
                sizes="(min-width: 768px) 33vw, 100vw"
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : undefined}
                decoding="async"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute inset-x-5 bottom-7 text-white sm:inset-x-10 sm:bottom-10 md:inset-x-6 md:bottom-7">
                <p className="font-label text-[0.6rem] uppercase tracking-[0.3em] opacity-85">
                  {showsOffers ? 'Black Friday' : 'Novidade'}
                </p>
                <h2 className="mt-2 max-w-[80%] break-words font-headline text-3xl italic leading-tight sm:text-5xl md:max-w-none md:text-3xl">
                  {product.name}
                </h2>
                <p className="mt-3 flex flex-wrap items-baseline gap-x-2 font-body text-sm sm:text-base">
                  {isFrom && <span className="font-label text-[0.6rem] uppercase tracking-[0.2em] opacity-80">a partir de</span>}
                  {discounted && <s className="text-xs opacity-70">{price}</s>}
                  <span className="font-semibold">
                    {discounted ? formatPrice(getDiscountedValue(price, product.discountPercent)) : price}
                  </span>
                  {discounted && <span className="font-bold text-[#ff8a8d]">-{product.discountPercent}%</span>}
                </p>
                <button
                  type="button"
                  onClick={onShopClick}
                  className="interactive-surface mt-5 bg-white px-5 py-3 font-label text-[0.6rem] uppercase tracking-[0.25em] text-[#0c0c0c] active:scale-[0.98]"
                >
                  {showsOffers ? 'Ver ofertas' : 'Ver coleção'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {positions > 1 && (
        <div className="absolute bottom-6 right-3 flex items-center sm:bottom-9 sm:right-8">
          {slides.slice(0, positions).map((product, index) => (
            <button
              key={product.id}
              type="button"
              aria-label={`Ir para o destaque ${index + 1}`}
              aria-current={index === activeIndex}
              onClick={() => goTo(index)}
              className="p-1.5"
            >
              <span className={`block h-1.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
