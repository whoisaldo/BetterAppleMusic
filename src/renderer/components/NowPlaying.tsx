import React from 'react';
import type { NowPlayingState } from '../hooks/useNowPlaying';

interface Props {
  nowPlaying: NowPlayingState;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function NowPlaying({ nowPlaying, onPlay, onPause, onNext, onPrevious }: Props) {
  const { title, artist, album, artworkUrl, isPlaying, currentTime, duration } = nowPlaying;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm mx-auto">
      {/* Artwork */}
      <div className="w-64 h-64 rounded-xl overflow-hidden shadow-xl mb-6 bg-zinc-800 flex items-center justify-center">
        {artworkUrl ? (
          <img src={artworkUrl} alt={album ?? 'Album Art'} className="w-full h-full object-cover" />
        ) : (
          <div className="text-zinc-600 text-5xl">♪</div>
        )}
      </div>

      {/* Track info */}
      <div className="text-center mb-6 w-full px-2">
        <p className="text-white text-xl font-semibold truncate">{title ?? 'Not Playing'}</p>
        <p className="text-zinc-400 text-sm mt-1 truncate">{artist ?? '—'}</p>
        <p className="text-zinc-600 text-xs mt-0.5 truncate">{album ?? '—'}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full mb-2">
        <div className="w-full bg-zinc-700 rounded-full h-1">
          <div
            className="bg-pink-500 h-1 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-zinc-500 text-xs mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8 mt-4">
        <button
          type="button"
          onClick={onPrevious}
          className="text-zinc-400 hover:text-white text-2xl transition-colors"
        >
          ⏮
        </button>
        <button
          type="button"
          onClick={isPlaying ? onPause : onPlay}
          className="w-14 h-14 bg-pink-500 hover:bg-pink-400 rounded-full flex items-center justify-center text-white text-2xl shadow-lg transition-all"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="text-zinc-400 hover:text-white text-2xl transition-colors"
        >
          ⏭
        </button>
      </div>
    </div>
  );
}
