import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BottomNavBar } from '../components/BottomNavBar';
import { Hero } from '../components/Hero';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { useAppContext } from '../context/appContextValue';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { hasSupabaseKeys } from '../lib/env';
import { matchesCategory } from '../data/mockData';
import type { Product } from '../data/mockData';

export const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { products, isLoadingProducts, refreshProducts } = useAppContext();

  const { pullDistance, isRefreshing, isTriggered } = usePullToRefresh({
    onRefresh: refreshProducts,
    enabled: hasSupabaseKeys,
  });

  const filteredProducts = useMemo<Product[]>(
    () => products.filter(p => matchesCategory(p, selectedCategory)),
    [products, selectedCategory]
  );

  const showSkeletons = isLoadingProducts || isRefreshing;

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-on-surface">
      <Header />

      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="fixed top-0 left-0 right-0 z-30 flex items-end justify-center overflow-hidden transition-all duration-200"
          style={{ height: isRefreshing ? 56 : pullDistance }}
        >
          <div className={`mb-2 flex items-center gap-2 font-label text-xs uppercase tracking-widest text-on-surface-variant transition-opacity ${isTriggered || isRefreshing ? 'opacity-100' : 'opacity-50'}`}>
            <span className={`inline-block h-4 w-4 rounded-full border-2 border-current ${isRefreshing ? 'animate-spin border-t-transparent' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Solte para atualizar'}
          </div>
        </div>
      )}

      <main
        className="mx-auto max-w-7xl px-4 pb-32 pt-24 sm:px-6 md:pb-12 lg:px-8"
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
          transition: pullDistance > 0 ? 'none' : 'transform 0.3s ease',
        }}
      >
        <Hero />
        <CategoryFilter onSelectCategory={setSelectedCategory} />

        <div className="mb-12 flex items-baseline justify-end">
          {!showSkeletons && (
            <span className="font-label text-[0.6rem] uppercase tracking-[0.25em] text-on-surface-variant">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'peça' : 'peças'}
            </span>
          )}
        </div>

        <section className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
          {showSkeletons
            ? Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} index={i} />)
            : filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
          }
        </section>

        {!showSkeletons && filteredProducts.length === 0 && (
          <div className="animate-fade-up border-y hairline py-20 text-center">
            <p className="font-headline italic text-xl text-on-surface-variant">Nenhuma peça nesta seleção</p>
            <p className="mt-3 font-label text-[0.65rem] uppercase tracking-[0.25em] text-outline">
              Explore outra categoria do índice
            </p>
          </div>
        )}

        <Footer />
      </main>

      <BottomNavBar />
    </div>
  );
};
