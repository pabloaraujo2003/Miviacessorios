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

  const showSkeletons = isLoadingProducts && !normalizedQuery;

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-on-surface">
      <Header />

      <main className="mx-auto max-w-7xl px-4 pb-32 pt-24 sm:px-6 md:pb-12 lg:px-8">
        <section className="mb-14">
          <p className="animate-fade-up font-label text-[0.65rem] tracking-[0.35em] text-on-surface-variant uppercase">
            Nº 02 <span className="mx-2 opacity-40">—</span> Busca
          </p>
          <div className="animate-fade-up relative mt-6 border-b hairline focus-within:border-primary/40 transition-colors pb-3" style={{ animationDelay: '100ms' }}>
            <SearchIcon className="absolute left-0 bottom-4 w-6 h-6 stroke-outline-variant stroke-[1.5]" />
            <input
              aria-label="Buscar joias"
              type="text"
              placeholder="O que você está procurando?"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full min-w-0 bg-transparent border-none pl-10 font-headline italic text-2xl placeholder:italic placeholder-outline-variant focus:ring-0 focus:outline-none sm:text-3xl"
            />
          </div>
          {normalizedQuery && !showSkeletons && (
            <p className="mt-4 font-label text-[0.6rem] uppercase tracking-[0.25em] text-outline">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'peça encontrada' : 'peças encontradas'}
            </p>
          )}
        </section>

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
            <p className="font-headline italic text-xl text-on-surface-variant">
              {normalizedQuery ? `Nada encontrado para “${query}”` : 'Explore a coleção'}
            </p>
            <p className="mt-3 font-label text-[0.65rem] uppercase tracking-[0.25em] text-outline">
              {normalizedQuery ? 'Tente outro nome ou material' : 'Busque por nome ou material'}
            </p>
          </div>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
};
