import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BottomNavBar } from '../components/BottomNavBar';
import { Hero } from '../components/Hero';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProductCard } from '../components/ProductCard';
import { useAppContext } from '../context/AppContext';

export const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { products } = useAppContext();

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-on-surface">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 pb-32 pt-24 sm:px-6 md:pb-12 lg:px-8">
        <Hero />
        
        <CategoryFilter onSelectCategory={setSelectedCategory} />
        
        <section className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2">
          {filteredProducts.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              index={index} 
            />
          ))}
        </section>
        
        <Footer />
      </main>

      <BottomNavBar />
    </div>
  );
};
