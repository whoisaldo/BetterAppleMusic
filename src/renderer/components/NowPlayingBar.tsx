import React from 'react';
import type { NowPlayingState } from '../hooks/useNowPlaying';

interface Props {
  nowPlaying: NowPlayingState;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function NowPlayingBar({ nowPlaying, onPlay, onPause, onNext, onPrevious }: Props) {
  const { title, artist, artworkUrl, isPlaying, currentTime, duration } = nowPlaying;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hasTrack = !!title;

  return (
    <div className="h-20 bg-[#181818] border-t border-white/5 flex items-center px-4 gap-4 relative no-drag">
      {/* Progress bar at top edge */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5 group cursor-pointer">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-1000 ease-linear relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
        </div>
      </div>

      {/* Left: track info */}
      <div className="flex items-center gap-3 w-72 min-w-0">
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 shadow-lg">
          {artworkUrl ? (
            <img src={artworkUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white/20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          )}
        </div>
        {hasTrack && (
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{title}</p>
            <p className="text-white/50 text-xs truncate">{artist}</p>
          </div>
        )}
      </div>

      {/* Center: controls */}
      <div className="flex-1 flex flex-col items-center gap-1">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={onPrevious}
            className="text-white/50 hover:text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
            </svg>
          </button>

          <button
            type="button"
            onClick={isPlaying ? onPause : onPlay}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg"
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="black" className="ml-0.5">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={onNext}
            className="text-white/50 hover:text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>

        {hasTrack && (
          <div className="flex items-center gap-2 text-[10px] text-white/30">
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/40 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="w-8">{formatTime(duration)}</span>
          </div>
        )}
      </div>

      {/* Right: volume placeholder */}
      <div className="w-72 flex justify-end items-center gap-2">
        <svg className="w-4 h-4 text-white/40" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
        <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white/40 rounded-full w-3/4" />
        </div>
      </div>
    </div>
  );
}
