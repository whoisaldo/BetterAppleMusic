import React from 'react';
import { usePlayer } from '@renderer/context/PlayerContext';
import { getArtworkUrlFromString } from '@renderer/utils/artwork';
import { formatDuration } from '@renderer/utils/formatTime';
import { cn } from '@renderer/utils/cn';

export function QueuePanel() {
  const { state, controls } = usePlayer();
  const { isQueueVisible, queue, queueIndex, currentTrack } = state;

  if (!isQueueVisible) return null;

  const upNext = queue.slice(queueIndex + 1);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={controls.toggleQueuePanel}
      />
      <div className="fixed right-0 top-8 bottom-20 w-[350px] bg-surface-elevated border-l border-white/[0.06] z-50 flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <h2 className="text-white/90 text-[16px] font-semibold">Queue</h2>
          <div className="flex items-center gap-2">
            {upNext.length > 0 && (
              <button
                onClick={controls.clearQueue}
                className="text-white/30 hover:text-white/60 text-[12px] transition-colors"
              >
                Clear All
              </button>
            )}
            <button
              onClick={controls.toggleQueuePanel}
              className="text-white/40 hover:text-white/70 transition-colors p-1"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {currentTrack && (
            <div className="px-4 pt-3 pb-2">
              <p className="text-white/25 text-[11px] font-medium uppercase tracking-wider mb-2">
                Now Playing
              </p>
              <QueueTrackRow
                track={currentTrack}
                isActive
                isPlaying={state.isPlaying}
              />
            </div>
          )}

          {upNext.length > 0 && (
            <div className="px-4 pt-3 pb-4">
              <p className="text-white/25 text-[11px] font-medium uppercase tracking-wider mb-2">
                Next Up ({upNext.length})
              </p>
              <div className="space-y-0.5">
                {upNext.map((track, i) => {
                  const absoluteIdx = queueIndex + 1 + i;
                  return (
                    <QueueTrackRow
                      key={`${track.id}-${absoluteIdx}`}
                      track={track}
                      onPlay={() => controls.playFromQueue(absoluteIdx)}
                      onRemove={() => controls.removeFromQueue(absoluteIdx)}
                      onMoveUp={
                        absoluteIdx > queueIndex + 1
                          ? () => controls.moveInQueue(absoluteIdx, absoluteIdx - 1)
                          : undefined
                      }
                      onMoveDown={
                        absoluteIdx < queue.length - 1
                          ? () => controls.moveInQueue(absoluteIdx, absoluteIdx + 1)
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </div>
          )}

          {!currentTrack && upNext.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-white/15 pb-10">
              <svg className="w-12 h-12 mb-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
              </svg>
              <p className="text-sm">Queue is empty</p>
              <p className="text-xs mt-1 text-white/10">Play something to get started</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function QueueTrackRow({
  track,
  isActive,
  isPlaying,
  onPlay,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  track: { name: string; artistName: string; artworkUrl: string | null; durationMs: number };
  isActive?: boolean;
  isPlaying?: boolean;
  onPlay?: () => void;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const artUrl = track.artworkUrl ? getArtworkUrlFromString(track.artworkUrl, 80) : null;

  return (
    <div
      className={cn(
        'group flex items-center gap-3 px-2 py-1.5 rounded-md transition-colors',
        isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04] cursor-pointer',
      )}
      onDoubleClick={onPlay}
    >
      <div className="w-9 h-9 rounded overflow-hidden bg-white/[0.04] flex-shrink-0">
        {artUrl ? (
          <img src={artUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-[12px] font-medium truncate', isActive ? 'text-accent' : 'text-white/80')}>
          {track.name}
        </p>
        <p className="text-white/30 text-[11px] truncate">{track.artistName}</p>
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {onMoveUp && (
          <button onClick={onMoveUp} className="p-0.5 text-white/30 hover:text-white/60" title="Move up">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
            </svg>
          </button>
        )}
        {onMoveDown && (
          <button onClick={onMoveDown} className="p-0.5 text-white/30 hover:text-white/60" title="Move down">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
            </svg>
          </button>
        )}
        {onRemove && (
          <button onClick={onRemove} className="p-0.5 text-white/30 hover:text-white/60" title="Remove">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        )}
      </div>

      {!(onMoveUp || onMoveDown || onRemove) && isPlaying && (
        <div className="flex items-end gap-[2px] h-3 mr-1">
          {[0, 150, 300].map((delay) => (
            <div
              key={delay}
              className="w-[2px] bg-accent rounded-full equalizer-bar"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
