import React from 'react';
import { cn } from '@renderer/utils/cn';
import { getArtworkUrl } from '@renderer/utils/artwork';
import type { MKArtwork } from '@renderer/types/musickit';

interface AlbumCardProps {
  id: string;
  name: string;
  artistName: string;
  artwork?: MKArtwork;
  onClick?: () => void;
  onPlay?: () => void;
  className?: string;
}

export function AlbumCard({ id, name, artistName, artwork, onClick, onPlay, className }: AlbumCardProps) {
  const artworkUrl = getArtworkUrl(artwork, 300);

  return (
    <button
      onClick={onClick}
      className={cn(
        'group text-left rounded-lg p-3 transition-all duration-150 hover:bg-white/[0.04] w-full',
        className,
      )}
    >
      <div className="relative aspect-square rounded-lg overflow-hidden bg-white/[0.04] mb-3 shadow-lg shadow-black/30">
        {artworkUrl ? (
          <img src={artworkUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white/10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
        {onPlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
            <button
              onClick={(e) => { e.stopPropagation(); onPlay(); }}
              className="w-12 h-12 rounded-full bg-accent/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 transform scale-90 group-hover:scale-100 shadow-xl hover:bg-accent"
            >
              <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <h4 className="text-[14px] font-medium text-white/90 truncate">{name}</h4>
      <p className="text-[12px] text-white/40 truncate mt-0.5">{artistName}</p>
    </button>
  );
}
