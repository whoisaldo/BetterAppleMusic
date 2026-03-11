import React, { useRef, useState, useCallback, useEffect } from 'react';
import { usePlayer } from '@renderer/context/PlayerContext';
import { useNavigation } from '@renderer/context/NavigationContext';
import { formatTime } from '@renderer/utils/formatTime';
import { getArtworkUrlFromString } from '@renderer/utils/artwork';
import { cn } from '@renderer/utils/cn';

export function NowPlayingBar() {
  const { state, controls } = usePlayer();
  const { navigate } = useNavigation();
  const { currentTrack, isPlaying, currentTime, duration, volume, shuffleMode, repeatMode, isQueueVisible } = state;
  const hasTrack = !!currentTrack;

  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState(0);

  const progressPercent = duration > 0 ? ((isDragging ? dragTime : currentTime) / duration) * 100 : 0;

  const getTimeFromEvent = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      if (!progressRef.current || duration <= 0) return 0;
      const rect = progressRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      return pct * duration;
    },
    [duration],
  );

  const handleProgressMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (duration <= 0) return;
      setIsDragging(true);
      setDragTime(getTimeFromEvent(e));
    },
    [duration, getTimeFromEvent],
  );

  useEffect(() => {
    if (!isDragging) return;

    function onMove(e: MouseEvent) {
      setDragTime(getTimeFromEvent(e));
    }
    function onUp(e: MouseEvent) {
      controls.seek(getTimeFromEvent(e));
      setIsDragging(false);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDragging, getTimeFromEvent, controls]);

  const handleProgressHover = (e: React.MouseEvent) => {
    if (duration <= 0) return;
    const rect = progressRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pct * duration);
    setHoverX(e.clientX - rect.left);
  };

  const artworkUrl = currentTrack?.artworkUrl
    ? getArtworkUrlFromString(currentTrack.artworkUrl, 120)
    : null;

  return (
    <div className="h-20 bg-surface-elevated/80 backdrop-blur-xl border-t border-white/[0.06] flex items-center px-4 gap-4 relative no-drag flex-shrink-0">
      {/* Progress bar at top edge */}
      <div
        ref={progressRef}
        onMouseDown={handleProgressMouseDown}
        onMouseMove={handleProgressHover}
        onMouseLeave={() => setHoverTime(null)}
        className="absolute top-0 left-0 right-0 h-1 bg-white/[0.06] cursor-pointer group hover:h-1.5 transition-all z-10"
      >
        <div
          className="h-full bg-gradient-to-r from-accent to-pink-400 relative"
          style={{ width: `${progressPercent}%`, transition: isDragging ? 'none' : undefined }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
        </div>

        {hoverTime !== null && (
          <div
            className="absolute -top-7 -translate-x-1/2 bg-black/90 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none"
            style={{ left: hoverX }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {/* Left: track info */}
      <div className="flex items-center gap-3 w-[280px] min-w-[180px]">
        <div
          className={cn(
            'w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-xl shadow-black/40 transition-transform cursor-pointer',
            isPlaying ? 'scale-100' : 'scale-95 opacity-80',
          )}
          onClick={() => {
            if (currentTrack?.albumId) navigate('album', { id: currentTrack.albumId });
          }}
        >
          {artworkUrl ? (
            <img src={artworkUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-white/10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}
        </div>
        {hasTrack ? (
          <div className="min-w-0">
            <p
              className="text-white/90 text-[13px] font-medium truncate leading-tight cursor-pointer hover:underline"
              onClick={() => navigate('now-playing')}
            >
              {currentTrack.name}
            </p>
            <p className="text-white/40 text-[11px] truncate mt-0.5">
              {currentTrack.artistId ? (
                <button
                  onClick={() => navigate('artist', { id: currentTrack.artistId! })}
                  className="hover:text-white/60 hover:underline transition-colors"
                >
                  {currentTrack.artistName}
                </button>
              ) : (
                currentTrack.artistName
              )}
            </p>
          </div>
        ) : (
          <p className="text-white/20 text-[13px]">Not Playing</p>
        )}
      </div>

      {/* Center: controls */}
      <div className="flex-1 flex items-center justify-center gap-5">
        <button
          onClick={controls.toggleShuffle}
          className={cn(
            'relative transition-colors',
            shuffleMode === 'on' ? 'text-accent' : 'text-white/30 hover:text-white/60',
          )}
          title="Shuffle"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
          </svg>
          {shuffleMode === 'on' && (
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
          )}
        </button>

        <button
          onClick={controls.previous}
          disabled={!hasTrack}
          className="text-white/60 hover:text-white transition-colors disabled:opacity-20"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
          </svg>
        </button>

        <button
          onClick={controls.toggle}
          disabled={!hasTrack}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/30 disabled:opacity-30 disabled:hover:scale-100"
        >
          {isPlaying ? (
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="black">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-[18px] h-[18px] ml-0.5" viewBox="0 0 24 24" fill="black">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={controls.next}
          disabled={!hasTrack}
          className="text-white/60 hover:text-white transition-colors disabled:opacity-20"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>

        <button
          onClick={controls.cycleRepeat}
          className={cn(
            'relative transition-colors',
            repeatMode !== 'none' ? 'text-accent' : 'text-white/30 hover:text-white/60',
          )}
          title={`Repeat: ${repeatMode}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            {repeatMode === 'one' ? (
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4z" />
            ) : (
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            )}
          </svg>
          {repeatMode !== 'none' && (
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
          )}
        </button>
      </div>

      {/* Right: queue + volume */}
      <div className="w-[200px] flex justify-end items-center gap-2">
        <div className="text-[10px] text-white/25 font-mono tabular-nums mr-2 hidden sm:block">
          {formatTime(isDragging ? dragTime : currentTime)} / {formatTime(duration)}
        </div>

        <button
          onClick={controls.toggleQueuePanel}
          className={cn(
            'p-1.5 rounded transition-colors',
            isQueueVisible ? 'text-accent' : 'text-white/30 hover:text-white/60',
          )}
          title="Queue"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
          </svg>
        </button>

        <button
          onClick={() => controls.setVolume(volume > 0 ? 0 : 0.7)}
          className="text-white/40 hover:text-white/60 transition-colors flex-shrink-0"
          title={volume > 0 ? 'Mute' : 'Unmute'}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            {volume > 0.5 ? (
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            ) : volume > 0 ? (
              <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
            ) : (
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            )}
          </svg>
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => controls.setVolume(parseFloat(e.target.value))}
          className="w-24 custom-slider"
          title={`Volume: ${Math.round(volume * 100)}%`}
        />
      </div>
    </div>
  );
}
