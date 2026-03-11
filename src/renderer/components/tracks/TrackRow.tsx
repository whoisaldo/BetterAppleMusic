import React from 'react';
import { cn } from '@renderer/utils/cn';
import { formatDuration } from '@renderer/utils/formatTime';
import { getArtworkUrlFromString } from '@renderer/utils/artwork';
import type { Track } from '@renderer/context/PlayerContext';

interface TrackRowProps {
  track: Track;
  index: number;
  showAlbum?: boolean;
  showArtwork?: boolean;
  isActive?: boolean;
  isPlaying?: boolean;
  onPlay: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onArtistClick?: () => void;
  onAlbumClick?: () => void;
}

function EqualiserBars() {
  return (
    <div className="flex items-end gap-[2px] h-3">
      {[0, 150, 300, 450].map((delay) => (
        <div
          key={delay}
          className="w-[3px] bg-accent rounded-full equalizer-bar"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

export function TrackRow({
  track,
  index,
  showAlbum = true,
  showArtwork = true,
  isActive = false,
  isPlaying = false,
  onPlay,
  onContextMenu,
  onArtistClick,
  onAlbumClick,
}: TrackRowProps) {
  return (
    <div
      onDoubleClick={onPlay}
      onContextMenu={onContextMenu}
      className={cn(
        'group flex items-center gap-4 px-3 py-2 rounded-md cursor-default transition-colors',
        isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]',
      )}
    >
      <div className="w-8 flex items-center justify-center flex-shrink-0">
        {isActive && isPlaying ? (
          <EqualiserBars />
        ) : (
          <>
            <span
              className={cn(
                'text-sm tabular-nums group-hover:hidden',
                isActive ? 'text-accent' : 'text-white/25',
              )}
            >
              {index + 1}
            </span>
            <button
              onClick={onPlay}
              className="hidden group-hover:block text-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </>
        )}
      </div>

      {showArtwork && (
        <div className="w-10 h-10 rounded overflow-hidden bg-white/[0.04] flex-shrink-0">
          {track.artworkUrl ? (
            <img
              src={getArtworkUrlFromString(track.artworkUrl, 80)}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className={cn('text-[14px] font-medium truncate', isActive ? 'text-accent' : 'text-white/90')}>
          {track.name}
        </p>
        <p className="text-white/40 text-[12px] truncate">
          {onArtistClick ? (
            <button
              onClick={(e) => { e.stopPropagation(); onArtistClick(); }}
              className="hover:text-white/70 hover:underline transition-colors"
            >
              {track.artistName}
            </button>
          ) : (
            track.artistName
          )}
        </p>
      </div>

      {showAlbum && (
        <div className="w-[200px] hidden lg:block flex-shrink-0">
          {onAlbumClick ? (
            <button
              onClick={(e) => { e.stopPropagation(); onAlbumClick(); }}
              className="text-white/25 text-[12px] truncate hover:text-white/50 hover:underline transition-colors"
            >
              {track.albumName}
            </button>
          ) : (
            <p className="text-white/25 text-[12px] truncate">{track.albumName}</p>
          )}
        </div>
      )}

      <div className="w-12 text-right text-white/25 text-[12px] tabular-nums flex-shrink-0">
        {formatDuration(track.durationMs)}
      </div>
    </div>
  );
}
