import React, { useState } from 'react';
import { Header } from '../components/Header';
import { BottomNavBar } from '../components/BottomNavBar';
import { ProductCard } from '../components/ProductCard';
import { useAppContext } from '../context/AppContext';
import { Search as SearchIcon } from 'lucide-react';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const { products } = useAppContext();

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.features.some(f => f.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-on-surface">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 pb-32 pt-24 sm:px-6 md:pb-12 lg:px-8">
        <section className="mb-12">
          <div className="relative border-b-2 border-outline focus-within:border-primary transition-colors pb-2">
            <SearchIcon className="absolute left-0 bottom-3 w-6 h-6 stroke-outline-variant" />
            <input 
              type="text" 
              placeholder="O que você está procurando?" 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full min-w-0 bg-transparent border-none pl-10 font-headline text-xl placeholder-outline-variant focus:ring-0 sm:text-2xl"
            />
          </div>
        </section>
        
        <section className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={index} 
              />
            ))
          ) : (
             <div className="text-on-surface-variant col-span-2 text-center py-10">
               Nenhuma joia encontrada com o termo "{query}".
             </div>
          )}
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
};
