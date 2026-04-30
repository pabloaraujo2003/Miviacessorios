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
import { hasSupabaseKeys } from '../lib/supabase';
import type { Product } from '../data/mockData';

export const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { products, isLoadingProducts, refreshProducts } = useAppContext();

  const { pullDistance, isRefreshing, isTriggered } = usePullToRefresh({
    onRefresh: refreshProducts,
    enabled: hasSupabaseKeys,
  });

  const filteredProducts = useMemo<Product[]>(() => selectedCategory === 'all'
    ? products
    : products.filter(p => {
        if (selectedCategory === 'silver925') {
          return (p.features ?? []).some(f => f.toLowerCase().includes('prata 925'));
        }
        if (selectedCategory === 'goldplated') {
          return (p.features ?? []).some(f => f.toLowerCase().includes('banhado'));
        }
        return p.category === selectedCategory;
      }), [products, selectedCategory]);

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

        <section className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
          {showSkeletons
            ? Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} index={i} />)
            : filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
          }
        </section>

        <Footer />
      </main>

      <BottomNavBar />
    </div>
  );
};
