import React from 'react';
import { TrackRow } from './TrackRow';
import type { Track } from '@renderer/context/PlayerContext';
import { usePlayer } from '@renderer/context/PlayerContext';
import { useNavigation } from '@renderer/context/NavigationContext';
import { useContextMenu } from '@renderer/components/common/ContextMenu';

interface TrackListProps {
  tracks: Track[];
  showAlbum?: boolean;
  showArtwork?: boolean;
  showHeader?: boolean;
  onPlayTrack?: (track: Track, queue: Track[]) => void;
}

export function TrackList({
  tracks,
  showAlbum = true,
  showArtwork = true,
  showHeader = true,
  onPlayTrack,
}: TrackListProps) {
  const { state, controls } = usePlayer();
  const { navigate } = useNavigation();
  const { handleContextMenu, ContextMenuPortal } = useContextMenu();

  const handlePlay = (track: Track) => {
    if (onPlayTrack) {
      onPlayTrack(track, tracks);
    } else {
      controls.playTrack(track, tracks);
    }
  };

  return (
    <div>
      {showHeader && (
        <div className="flex items-center gap-4 text-[11px] text-white/20 uppercase tracking-wider font-medium px-3 py-2 border-b border-white/[0.04] mb-1">
          <span className="w-8 text-center">#</span>
          {showArtwork && <span className="w-10" />}
          <span className="flex-1">Title</span>
          {showAlbum && <span className="w-[200px] hidden lg:block">Album</span>}
          <span className="w-12 text-right">
            <svg className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
          </span>
        </div>
      )}

      {tracks.map((track, i) => (
        <TrackRow
          key={`${track.id}-${i}`}
          track={track}
          index={i}
          showAlbum={showAlbum}
          showArtwork={showArtwork}
          isActive={state.currentTrack?.id === track.id}
          isPlaying={state.isPlaying && state.currentTrack?.id === track.id}
          onPlay={() => handlePlay(track)}
          onContextMenu={(e) => handleContextMenu(e, track)}
          onArtistClick={track.artistId ? () => navigate('artist', { id: track.artistId! }) : undefined}
          onAlbumClick={track.albumId ? () => navigate('album', { id: track.albumId! }) : undefined}
        />
      ))}

      {ContextMenuPortal}
    </div>
  );
}
