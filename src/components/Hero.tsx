import React, { useEffect, useState } from 'react';
import { hasSupabaseKeys } from '../lib/env';
import { fetchHeroUrlRest, readCachedHeroUrl, writeCachedHeroUrl } from '../lib/products';
import { optimizedImageUrl, optimizedSrcSet } from '../lib/images';

interface HeroProps {
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({ className = '' }) => {
  // Stale-while-revalidate: mostra o hero da visita anterior de imediato
  // (o Service Worker já tem essa imagem em cache, então o <img> resolve
  // localmente) enquanto revalida a URL em background.
  const [heroUrl, setHeroUrl] = useState<string | null>(() => (hasSupabaseKeys ? readCachedHeroUrl() : null));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!hasSupabaseKeys) {
      return;
    }

    const abortController = new AbortController();

    const fetchHero = async (): Promise<void> => {
      const url = await fetchHeroUrlRest(abortController.signal);
      if (!abortController.signal.aborted && url) {
        setHeroUrl(url);
        writeCachedHeroUrl(url);
      }
    };

    void fetchHero();

    return () => abortController.abort();
  }, []);

  return (
    <section className={`relative mb-16 flex h-[300px] items-center justify-center overflow-hidden sm:h-[353px] ${className}`}>
      {/* Skeleton / Background Placeholder */}
      <div className={`absolute inset-0 bg-surface-container-high transition-colors duration-700 ${!isLoaded ? 'animate-pulse' : ''}`} />

      {heroUrl && (
        <div className="absolute inset-0">
          <img
            alt="Mivie jewelry hero"
            className={`w-full h-full object-cover mix-blend-multiply transition-opacity duration-700 ${
              isLoaded ? 'opacity-50' : 'opacity-0'
            }`}
            src={optimizedImageUrl(heroUrl, 1280)}
            srcSet={optimizedSrcSet(heroUrl, 1280)}
            sizes="100vw"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onLoad={() => setIsLoaded(true)}
            onError={() => setIsLoaded(false)}
          />
        </div>
      )}

      {/* Moldura capilar editorial */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-3 border hairline sm:inset-4" />

      <div className="relative z-10 space-y-5 px-8 text-center">
        <p className="animate-fade-up font-label text-[0.65rem] tracking-[0.35em] text-on-surface-variant uppercase">
          Nova Coleção
        </p>
        <h2 className="animate-fade-up font-headline italic text-4xl leading-[1.1] text-on-surface sm:text-5xl md:text-6xl" style={{ animationDelay: '120ms' }}>
          Elegância em
          <br />
          cada detalhe
        </h2>
        <div className="animate-line-grow h-px w-16 bg-primary mx-auto opacity-40" />
        <p className="animate-fade-up font-label text-[0.6rem] tracking-[0.25em] text-outline uppercase" style={{ animationDelay: '240ms' }}>
          Prata 925 · Banhados
        </p>
      </div>
    </section>
  );
};
