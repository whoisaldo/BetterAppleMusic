import React, { useEffect, useState } from 'react';
import { useMusicKitContext } from '@renderer/context/MusicKitContext';
import { usePlayer, type Track } from '@renderer/context/PlayerContext';
import { useNavigation } from '@renderer/context/NavigationContext';
import { TrackList } from '@renderer/components/tracks/TrackList';
import { SkeletonSection, SkeletonLine } from '@renderer/components/common/Skeleton';
import { getArtworkUrl } from '@renderer/utils/artwork';
import { formatTotalDuration } from '@renderer/utils/formatTime';
import type { MKPlaylist, MKSong } from '@renderer/types/musickit';

function songToTrack(s: MKSong, playlistId: string): Track {
  return {
    id: s.id,
    name: s.attributes.name,
    artistName: s.attributes.artistName,
    albumName: s.attributes.albumName,
    artworkUrl: getArtworkUrl(s.attributes.artwork, 300),
    durationMs: s.attributes.durationInMillis,
    albumId: s.relationships?.albums?.data?.[0]?.id,
    artistId: s.relationships?.artists?.data?.[0]?.id,
  };
}

export function PlaylistPage() {
  const { mk, storefront } = useMusicKitContext();
  const { controls } = usePlayer();
  const { viewParams } = useNavigation();
  const playlistId = viewParams.id;

  const [playlist, setPlaylist] = useState<MKPlaylist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mk || !playlistId) return;
    let cancelled = false;

    async function fetchPlaylist() {
      setLoading(true);
      setError(null);
      try {
        const isLibrary = playlistId.startsWith('p.');
        const path = isLibrary
          ? `/v1/me/library/playlists/${playlistId}`
          : `/v1/catalog/${storefront}/playlists/${playlistId}`;
        const resp = await mk!.api.music(path, { include: ['tracks'] });
        const data = resp.data as { data?: MKPlaylist[] };
        const pl = data.data?.[0];
        if (!cancelled && pl) {
          setPlaylist(pl);
          const songData = pl.relationships?.tracks?.data ?? [];
          setTracks(songData.map((s) => songToTrack(s, playlistId)));
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load playlist');
        console.error('[PlaylistPage] error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPlaylist();
    return () => { cancelled = true; };
  }, [mk, playlistId, storefront]);

  if (loading) {
    return (
      <div className="p-6 animate-view-enter">
        <div className="flex gap-6 mb-8">
          <div className="w-60 h-60 bg-white/[0.04] rounded-lg animate-pulse" />
          <div className="flex flex-col justify-end space-y-3">
            <SkeletonLine className="h-8 w-64" />
            <SkeletonLine className="h-4 w-40" />
          </div>
        </div>
        <SkeletonSection rows={8} />
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="flex items-center justify-center h-full text-white/30 text-sm">
        {error || 'Playlist not found'}
      </div>
    );
  }

  const artworkUrl = getArtworkUrl(playlist.attributes.artwork, 480);
  const desc = playlist.attributes.description?.standard;
  const totalDuration = tracks.reduce((acc, t) => acc + t.durationMs, 0);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar animate-view-enter">
      <div className="p-6">
        <div className="flex gap-6 mb-6">
          <div className="w-60 h-60 rounded-lg overflow-hidden shadow-2xl shadow-black/60 flex-shrink-0 bg-white/[0.04]">
            {artworkUrl ? (
              <img src={artworkUrl} alt={playlist.attributes.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center">
                <svg className="w-16 h-16 text-white/20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end min-w-0">
            <p className="text-white/40 text-[12px] uppercase tracking-wider font-medium mb-1">Playlist</p>
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight mb-2 line-clamp-2">
              {playlist.attributes.name}
            </h1>
            {desc && (
              <p className="text-white/40 text-[13px] mb-2 line-clamp-2">{desc}</p>
            )}
            <div className="flex items-center gap-2 text-[13px] text-white/50">
              {playlist.attributes.curatorName && (
                <span>{playlist.attributes.curatorName}</span>
              )}
              <span className="text-white/20">·</span>
              <span>{tracks.length} songs, {formatTotalDuration(totalDuration)}</span>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  if (tracks.length > 0) controls.playTrack(tracks[0], tracks);
                }}
                className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-full text-[13px] font-semibold transition-colors shadow-lg shadow-accent/20"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
              </button>
              <button
                onClick={() => {
                  if (tracks.length > 0) {
                    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
                    controls.playTrack(shuffled[0], shuffled);
                  }
                }}
                className="flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.12] text-white/80 px-6 py-2.5 rounded-full text-[13px] font-medium transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                </svg>
                Shuffle
              </button>
            </div>
          </div>
        </div>

        <TrackList tracks={tracks} />
      </div>
    </div>
  );
}
