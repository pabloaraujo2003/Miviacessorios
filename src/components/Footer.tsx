import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`mt-32 pb-24 text-center ${className}`}>
      <div className="h-px w-full bg-surface-variant mb-12"></div>
      <p className="font-label text-[0.6rem] tracking-[0.2em] text-outline-variant mb-4 uppercase">
        © 2026 Mivi Acessórios
      </p>
      <Link 
        className="font-label text-[0.6875rem] tracking-[0.1rem] text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center space-x-2" 
        to="/admin"
      >
        <span>ÁREA ADMINISTRATIVA</span>
        <span className="material-symbols-outlined text-sm">shield_person</span>
      </Link>
    </footer>
  );
};
