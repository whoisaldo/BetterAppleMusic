import React from 'react';
import { cn } from '@renderer/utils/cn';
import { getArtworkUrl } from '@renderer/utils/artwork';
import type { MKArtwork } from '@renderer/types/musickit';

interface ArtistCardProps {
  id: string;
  name: string;
  artwork?: MKArtwork;
  onClick?: () => void;
  className?: string;
}

export function ArtistCard({ name, artwork, onClick, className }: ArtistCardProps) {
  const artworkUrl = getArtworkUrl(artwork, 300);

  return (
    <button
      onClick={onClick}
      className={cn(
        'group text-left rounded-lg p-3 transition-all duration-150 hover:bg-white/[0.04] w-full flex flex-col items-center',
        className,
      )}
    >
      <div className="relative w-full aspect-square rounded-full overflow-hidden bg-white/[0.04] mb-3 shadow-lg shadow-black/30">
        {artworkUrl ? (
          <img src={artworkUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-violet-600/20">
            <svg className="w-12 h-12 text-white/15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>
      <h4 className="text-[14px] font-medium text-white/90 truncate text-center w-full">{name}</h4>
      <p className="text-[12px] text-white/30 mt-0.5">Artist</p>
    </button>
  );
}
