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
    <section className={`relative mb-12 flex h-[300px] items-center justify-center overflow-hidden sm:h-[353px] ${className}`}>
      {/* Skeleton / Background Placeholder */}
      <div className="absolute inset-0 bg-surface-container-high transition-colors duration-700 animate-pulse" />
      
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
      
      <div className="relative z-10 space-y-4 px-6 text-center">
        <p className="font-body text-xs tracking-[0.3em] text-on-surface-variant uppercase">
          Nova Coleção
        </p>
        <h2 className="font-headline italic text-3xl text-on-surface sm:text-4xl md:text-5xl">
          Elegância em cada detalhe
        </h2>
        <div className="h-px w-12 bg-primary mx-auto opacity-40"></div>
      </div>
    </section>
  );
};
