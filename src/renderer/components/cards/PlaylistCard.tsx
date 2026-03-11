import React from 'react';
import { cn } from '@renderer/utils/cn';
import { getArtworkUrl } from '@renderer/utils/artwork';
import type { MKArtwork } from '@renderer/types/musickit';

interface PlaylistCardProps {
  id: string;
  name: string;
  curatorName?: string;
  description?: string;
  artwork?: MKArtwork;
  onClick?: () => void;
  onPlay?: () => void;
  className?: string;
}

export function PlaylistCard({ name, curatorName, artwork, onClick, onPlay, className }: PlaylistCardProps) {
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
          <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center">
            <svg className="w-12 h-12 text-white/20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
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
      {curatorName && <p className="text-[12px] text-white/40 truncate mt-0.5">{curatorName}</p>}
    </button>
  );
}
