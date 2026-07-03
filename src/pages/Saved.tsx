import React from 'react';
import { Header } from '../components/Header';
import { BottomNavBar } from '../components/BottomNavBar';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { useAppContext } from '../context/appContextValue';
import { Heart } from 'lucide-react';

export const Saved: React.FC = () => {
  const { savedItems, isLoadingProducts } = useAppContext();

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-on-surface">
      <Header />

      <main className="mx-auto max-w-7xl px-4 pb-32 pt-24 sm:px-6 md:pb-12 lg:px-8">
        <section className="mb-14">
          <p className="animate-fade-up font-label text-[0.65rem] tracking-[0.35em] text-on-surface-variant uppercase">
            Nº 03 <span className="mx-2 opacity-40">—</span> Salvos
          </p>
          <div className="animate-fade-up mt-6 flex items-baseline justify-between border-b hairline pb-6" style={{ animationDelay: '100ms' }}>
            <h2 className="break-words font-headline text-3xl italic text-on-surface sm:text-4xl">
              Meus Favoritos
            </h2>
            {!isLoadingProducts && savedItems.length > 0 && (
              <span className="font-label text-[0.6rem] uppercase tracking-[0.25em] text-on-surface-variant">
                {savedItems.length} {savedItems.length === 1 ? 'peça' : 'peças'}
              </span>
            )}
          </div>
        </section>

        {isLoadingProducts ? (
          <section className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
            {Array.from({ length: 2 }, (_, i) => <SkeletonCard key={i} index={i} />)}
          </section>
        ) : savedItems.length === 0 ? (
          <div className="animate-fade-up border-y hairline py-20 text-center">
            <Heart className="mx-auto mb-5 h-7 w-7 stroke-1 text-outline-variant" />
            <p className="font-headline italic text-xl text-on-surface-variant">Nenhuma peça guardada ainda</p>
            <p className="mt-3 font-label text-[0.65rem] uppercase tracking-[0.25em] text-outline">
              Toque no coração de uma joia para guardá-la aqui
            </p>
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
            {savedItems.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </section>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
};
