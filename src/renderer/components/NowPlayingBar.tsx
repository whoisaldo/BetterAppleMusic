import React, { useState, useRef, useEffect } from 'react';
import type { AudioPlayerState, AudioPlayerControls } from '../hooks/useAudioPlayer';

interface Props {
  player: AudioPlayerState;
  controls: AudioPlayerControls;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function NowPlayingBar({ player, controls }: Props) {
  const { currentTrack, isPlaying, currentTime, duration } = player;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hasTrack = !!currentTrack;

  const [volume, setVolumeLocal] = useState(0.7);
  const progressBarRef = useRef<HTMLDivElement>(null);

  function handleProgressClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    controls.seek(pct * duration);
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolumeLocal(v);
    controls.setVolume(v);
  }

  // Artwork URL for large display
  const artworkLarge = currentTrack?.artworkUrl
    ? currentTrack.artworkUrl.replace(/\d+x\d+/, '500x500')
    : null;

  return (
    <div className="h-[88px] bg-gradient-to-r from-[#181818] via-[#181818] to-[#181818] border-t border-white/[0.06] flex items-center px-5 gap-4 relative no-drag flex-shrink-0">
      {/* Progress bar at top edge */}
      <div
        ref={progressBarRef}
        onClick={handleProgressClick}
        className="absolute top-0 left-0 right-0 h-1 bg-white/[0.06] cursor-pointer group hover:h-1.5 transition-all"
      >
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-rose-400 relative transition-none"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg shadow-black/50" />
        </div>
      </div>

      {/* Left: track info */}
      <div className="flex items-center gap-4 w-[280px] min-w-[200px]">
        <div className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-xl shadow-black/40 transition-transform ${isPlaying ? 'scale-100' : 'scale-95 opacity-80'}`}>
          {artworkLarge ? (
            <img src={artworkLarge} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          )}
        </div>
        {hasTrack ? (
          <div className="min-w-0">
            <p className="text-white text-[13px] font-medium truncate leading-tight">
              {currentTrack.name}
            </p>
            <p className="text-white/40 text-[11px] truncate mt-0.5">
              {currentTrack.artistName}
            </p>
          </div>
        ) : (
          <div className="min-w-0">
            <p className="text-white/20 text-[13px]">No track selected</p>
          </div>
        )}
      </div>

      {/* Center: controls */}
      <div className="flex-1 flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-6">
          {/* Shuffle */}
          <button type="button" className="text-white/30 hover:text-white/60 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
            </svg>
          </button>

          {/* Previous */}
          <button
            type="button"
            onClick={controls.previous}
            className="text-white/50 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
            </svg>
          </button>

          {/* Play/Pause */}
          <button
            type="button"
            onClick={controls.toggle}
            disabled={!hasTrack}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/30 disabled:opacity-30 disabled:hover:scale-100"
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="black">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="black" className="ml-0.5">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={controls.next}
            className="text-white/50 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>

          {/* Repeat */}
          <button type="button" className="text-white/30 hover:text-white/60 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
            </svg>
          </button>
        </div>

        {/* Time display */}
        <div className="flex items-center gap-3 text-[10px] text-white/30 font-mono">
          <span className="w-8 text-right">{formatTime(currentTime)}</span>
          <div className="w-[300px] h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-white/40 rounded-full"
              style={{ width: `${progressPercent}%`, transition: 'none' }}
            />
          </div>
          <span className="w-8">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: volume */}
      <div className="w-[200px] flex justify-end items-center gap-2">
        {/* Queue icon */}
        <button type="button" className="text-white/30 hover:text-white/60 transition-colors mr-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>
          </svg>
        </button>

        {/* Volume */}
        <svg className="w-4 h-4 text-white/40 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          {volume > 0.5 ? (
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          ) : volume > 0 ? (
            <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
          ) : (
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          )}
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-20 h-1 appearance-none bg-white/10 rounded-full cursor-pointer accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
        />
      </div>
    </div>
  );
}
