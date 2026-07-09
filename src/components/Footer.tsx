import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`mt-32 pb-24 ${className}`}>
      <div className="h-px w-full bg-surface-variant mb-14" />

      <div className="text-center space-y-6">
        <p className="font-headline italic text-3xl text-on-surface sm:text-4xl">Mivi</p>
        <p className="font-label text-[0.6rem] uppercase tracking-[0.3em] text-on-surface-variant">
          Prata 925 · Banhados
        </p>

        <div className="flex items-center justify-center gap-3" aria-hidden="true">
          <span className="h-px w-8 bg-outline-variant/60" />
          <span className="font-body text-[0.55rem] text-outline">◆</span>
          <span className="h-px w-8 bg-outline-variant/60" />
        </div>

        <p className="font-label text-[0.6rem] tracking-[0.2em] text-outline-variant uppercase">
          © 2026 Mivi Acessórios
        </p>
        <Link
          className="interactive-text inline-flex items-center justify-center space-x-2 font-label text-[0.6875rem] tracking-[0.1rem] text-on-surface-variant active:scale-[0.98]"
          to="/admin"
        >
          <span>ÁREA ADMINISTRATIVA</span>
          <Shield className="h-3.5 w-3.5 stroke-[1.5]" />
        </Link>
      </div>
    </footer>
  );
};
