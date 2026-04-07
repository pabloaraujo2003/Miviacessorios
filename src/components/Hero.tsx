import React from 'react';

interface HeroProps {
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({ className = '' }) => {
  return (
    <section className={`relative mb-12 flex h-[300px] items-center justify-center overflow-hidden sm:h-[353px] ${className}`}>
      <div className="absolute inset-0 bg-surface-container-high">
        <img 
          alt="close-up of polished 925 silver jewelry" 
          className="w-full h-full object-cover mix-blend-multiply opacity-30" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDurTmdj5zRtfXV8tvf9bslQk-akC3N4ftHzvoOdUME6wNL-jQUv4ZkT4C7kI9VL0xiXZIqey15bqfsGuBtPvG_LXmIgOySPR8C3GVvn8D8b0ljtatG2BMO5Yttu8jEWTIIhMr-TSa64Xt5wZXJyX-HNYf9VY9ZZZX70sckzsLFb18a2ZG2Pd1F-YMcNrK41yO1yttB7UFLVCXvMuurZ6sFdsJCUHRcK0XV4taqEcHM8ODw5bpUxiy-iUuqnWw7K0DIcqpWvVY_KQsz"
        />
      </div>
      
      <div className="relative z-10 space-y-4 px-6 text-center">
        <p className="font-body text-xs tracking-[0.3em] text-on-surface-variant uppercase">
          Silver Curation
        </p>
        <h2 className="font-headline italic text-3xl text-on-surface sm:text-4xl md:text-5xl">
          Elegância em cada detalhe
        </h2>
        <div className="h-px w-12 bg-primary mx-auto opacity-40"></div>
      </div>
    </section>
  );
};
