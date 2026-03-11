import React from 'react';
import { cn } from '@renderer/utils/cn';

interface SkeletonProps {
  className?: string;
}

export function SkeletonLine({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse bg-white/[0.06] rounded', className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="animate-pulse bg-white/[0.06] aspect-square rounded-lg" />
      <SkeletonLine className="h-3 w-3/4" />
      <SkeletonLine className="h-2.5 w-1/2" />
    </div>
  );
}

export function SkeletonTrackRow({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center gap-4 px-3 py-2', className)}>
      <div className="w-8 h-4 animate-pulse bg-white/[0.06] rounded" />
      <div className="w-10 h-10 animate-pulse bg-white/[0.06] rounded" />
      <div className="flex-1 space-y-1.5">
        <SkeletonLine className="h-3.5 w-48" />
        <SkeletonLine className="h-2.5 w-32" />
      </div>
      <SkeletonLine className="h-3 w-10" />
    </div>
  );
}

export function SkeletonSection({ rows = 5, showCards = false }: { rows?: number; showCards?: boolean }) {
  if (showCards) {
    return (
      <div className="space-y-4">
        <SkeletonLine className="h-6 w-40" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTrackRow key={i} />
      ))}
    </div>
  );
}
