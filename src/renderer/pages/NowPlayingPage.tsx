import React from 'react';
import { usePlayer } from '@renderer/context/PlayerContext';
import { useNavigation } from '@renderer/context/NavigationContext';
import { getArtworkUrlFromString } from '@renderer/utils/artwork';
import { formatTime } from '@renderer/utils/formatTime';

export function NowPlayingPage() {
  const { state, controls } = usePlayer();
  const { navigate } = useNavigation();
  const { currentTrack, isPlaying, currentTime, duration } = state;

  if (!currentTrack) {
    return (
      <div className="flex items-center justify-center h-full text-white/20 animate-view-enter">
        <div className="text-center">
          <svg className="w-20 h-20 mx-auto mb-4 text-white/10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
          <p className="text-lg font-medium">No track playing</p>
          <p className="text-sm text-white/10 mt-1">Play something to see it here</p>
        </div>
      </div>
    );
  }

  const artworkUrl = getArtworkUrlFromString(currentTrack.artworkUrl, 600);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 animate-view-enter">
      <div className="w-72 h-72 lg:w-80 lg:h-80 rounded-xl overflow-hidden shadow-2xl shadow-black/60 mb-8 bg-white/[0.04]">
        {artworkUrl ? (
          <img src={artworkUrl} alt={currentTrack.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <svg className="w-20 h-20 text-white/10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
      </div>

      <div className="text-center max-w-md w-full mb-6">
        <h2 className="text-[22px] font-bold text-white truncate">{currentTrack.name}</h2>
        <p className="text-white/50 text-[14px] mt-1">
          {currentTrack.artistId ? (
            <button
              onClick={() => navigate('artist', { id: currentTrack.artistId! })}
              className="hover:underline hover:text-white/70 transition-colors"
            >
              {currentTrack.artistName}
            </button>
          ) : (
            currentTrack.artistName
          )}
          {currentTrack.albumId && (
            <>
              {' — '}
              <button
                onClick={() => navigate('album', { id: currentTrack.albumId! })}
                className="hover:underline hover:text-white/70 transition-colors"
              >
                {currentTrack.albumName}
              </button>
            </>
          )}
        </p>
      </div>

      {/* Progress */}
      <div className="w-full max-w-md mb-6">
        <div
          className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            controls.seek(pct * duration);
          }}
        >
          <div
            className="h-full bg-white/60 rounded-full"
            style={{ width: `${progressPercent}%`, transition: 'width 100ms linear' }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[11px] text-white/30 tabular-nums font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-8">
        <button
          onClick={controls.toggleShuffle}
          className={state.shuffleMode === 'on' ? 'text-accent' : 'text-white/30 hover:text-white/60'}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
          </svg>
        </button>

        <button onClick={controls.previous} className="text-white/70 hover:text-white">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
          </svg>
        </button>

        <button
          onClick={controls.toggle}
          className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-xl"
        >
          {isPlaying ? (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="black">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 ml-0.5" viewBox="0 0 24 24" fill="black">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button onClick={controls.next} className="text-white/70 hover:text-white">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>

        <button
          onClick={controls.cycleRepeat}
          className={state.repeatMode !== 'none' ? 'text-accent' : 'text-white/30 hover:text-white/60'}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            {state.repeatMode === 'one' ? (
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4z" />
            ) : (
              <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}
