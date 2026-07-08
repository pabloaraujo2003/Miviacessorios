import React, { useEffect, useState } from 'react';
import { hasSupabaseKeys, supabase } from '../lib/supabase';

interface HeroProps {
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({ className = '' }) => {
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!hasSupabaseKeys) {
      return;
    }

    const abortController = new AbortController();

    const fetchHero = async (): Promise<void> => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('value')
          .eq('id', 'hero_image_url')
          .abortSignal(abortController.signal)
          .single();

        if (!abortController.signal.aborted && data && typeof data.value === 'string') {
          setHeroUrl(data.value);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('Error fetching hero image:', error);
        }
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
            src={heroUrl}
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
