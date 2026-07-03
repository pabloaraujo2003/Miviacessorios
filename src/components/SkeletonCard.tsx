import React from 'react';

interface SkeletonCardProps {
  index?: number;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ index = 0, className = '' }) => {
  const asymmetricClass = index % 2 !== 0 ? 'md:mt-24' : '';

  return (
    <article className={`group ${asymmetricClass} ${className} animate-pulse`} aria-hidden="true">
      <div className="bg-surface-container-low aspect-[4/5] mb-6 rounded-sm" />
      <div className="mt-4 flex flex-col gap-4">
        <div className="h-3 w-24 rounded bg-surface-container-low" />
        <div className="flex justify-between items-start gap-4 border-b hairline pb-4">
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-5 w-3/4 rounded bg-surface-container-low" />
            <div className="h-3 w-1/2 rounded bg-surface-container-low" />
          </div>
          <div className="h-5 w-16 rounded bg-surface-container-low shrink-0" />
        </div>
        <div className="flex gap-2">
          <div className="h-11 flex-1 rounded bg-surface-container-low" />
          <div className="h-11 flex-[3] rounded bg-surface-container-low" />
        </div>
      </div>
    </article>
  );
};
