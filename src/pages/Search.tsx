import React, { useMemo, useState } from 'react';
import { Header } from '../components/Header';
import { BottomNavBar } from '../components/BottomNavBar';
import { ProductCard } from '../components/ProductCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { useAppContext } from '../context/appContextValue';
import { Search as SearchIcon } from 'lucide-react';
import type { Product } from '../data/mockData';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const { products, isLoadingProducts } = useAppContext();

  const normalizedQuery = query.trim().toLowerCase();
  const filteredProducts = useMemo<Product[]>(() => products.filter(p => (
    p.name.toLowerCase().includes(normalizedQuery) ||
    (p.features ?? []).some(f => f.toLowerCase().includes(normalizedQuery))
  )), [normalizedQuery, products]);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-on-surface">
      <Header />

      <main className="mx-auto max-w-7xl px-4 pb-32 pt-24 sm:px-6 md:pb-12 lg:px-8">
        <section className="mb-12">
          <div className="relative border-b-2 border-outline focus-within:border-primary transition-colors pb-2">
            <SearchIcon className="absolute left-0 bottom-3 w-6 h-6 stroke-outline-variant" />
            <input
              aria-label="Buscar joias"
              type="text"
              placeholder="O que você está procurando?"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full min-w-0 bg-transparent border-none pl-10 font-headline text-xl placeholder-outline-variant focus:ring-0 sm:text-2xl"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
          {isLoadingProducts && !normalizedQuery ? (
            Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} index={i} />)
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))
          ) : (
            <div className="text-on-surface-variant col-span-2 text-center py-10">
              {normalizedQuery
                ? `Nenhuma joia encontrada com o termo "${query}".`
                : 'Explore a coleção buscando por nome ou material.'}
            </div>
          )}
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
};
