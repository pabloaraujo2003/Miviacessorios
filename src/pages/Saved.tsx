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
        <section className="mb-12">
          <h2 className="flex items-center gap-4 break-words font-headline text-3xl italic text-on-surface sm:text-4xl">
            Meus Favoritos
            <Heart className="w-8 h-8 stroke-[1.5]" />
          </h2>
          <div className="h-px w-12 bg-primary opacity-40 mt-6" />
        </section>

        {isLoadingProducts ? (
          <section className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
            {Array.from({ length: 2 }, (_, i) => <SkeletonCard key={i} index={i} />)}
          </section>
        ) : savedItems.length === 0 ? (
          <div className="flex justify-center items-center h-48 opacity-50">
            Você ainda não curtiu nenhuma joia. Explore a coleção!
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
