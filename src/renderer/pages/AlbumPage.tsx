import React, { useEffect, useState } from 'react';
import { useMusicKitContext } from '@renderer/context/MusicKitContext';
import { usePlayer, type Track } from '@renderer/context/PlayerContext';
import { useNavigation } from '@renderer/context/NavigationContext';
import { TrackList } from '@renderer/components/tracks/TrackList';
import { SkeletonSection, SkeletonLine } from '@renderer/components/common/Skeleton';
import { getArtworkUrl } from '@renderer/utils/artwork';
import { formatTotalDuration } from '@renderer/utils/formatTime';
import type { MKAlbum, MKSong } from '@renderer/types/musickit';

function songToTrack(s: MKSong, albumId: string, artistId?: string): Track {
  return {
    id: s.id,
    name: s.attributes.name,
    artistName: s.attributes.artistName,
    albumName: s.attributes.albumName,
    artworkUrl: getArtworkUrl(s.attributes.artwork, 300),
    durationMs: s.attributes.durationInMillis,
    albumId,
    artistId,
  };
}

export function AlbumPage() {
  const { mk, storefront } = useMusicKitContext();
  const { controls } = usePlayer();
  const { viewParams, navigate } = useNavigation();
  const albumId = viewParams.id;

  const [album, setAlbum] = useState<MKAlbum | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mk || !albumId) return;
    let cancelled = false;

    async function fetchAlbum() {
      setLoading(true);
      setError(null);
      try {
        const isLibrary = albumId.startsWith('l.');
        const path = isLibrary
          ? `/v1/me/library/albums/${albumId}`
          : `/v1/catalog/${storefront}/albums/${albumId}`;
        const resp = await mk!.api.music(path, { include: ['tracks', 'artists'] });
        const data = resp.data as { data?: MKAlbum[] };
        const albumData = data.data?.[0];
        if (!cancelled && albumData) {
          setAlbum(albumData);
          const artistId = albumData.relationships?.artists?.data?.[0]?.id;
          const songData = albumData.relationships?.tracks?.data ?? [];
          setTracks(songData.map((s) => songToTrack(s, albumId, artistId)));
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load album');
        console.error('[AlbumPage] error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAlbum();
    return () => { cancelled = true; };
  }, [mk, albumId, storefront]);

  if (loading) {
    return (
      <div className="p-6 animate-view-enter">
        <div className="flex gap-6 mb-8">
          <div className="w-60 h-60 bg-white/[0.04] rounded-lg animate-pulse" />
          <div className="flex flex-col justify-end space-y-3">
            <SkeletonLine className="h-8 w-64" />
            <SkeletonLine className="h-4 w-40" />
            <SkeletonLine className="h-4 w-32" />
          </div>
        </div>
        <SkeletonSection rows={8} />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="flex items-center justify-center h-full text-white/30 text-sm">
        {error || 'Album not found'}
      </div>
    );
  }

  const artworkUrl = getArtworkUrl(album.attributes.artwork, 480);
  const artistId = album.relationships?.artists?.data?.[0]?.id;
  const releaseYear = album.attributes.releaseDate?.slice(0, 4);
  const totalDuration = tracks.reduce((acc, t) => acc + t.durationMs, 0);
  const genres = album.attributes.genreNames?.join(', ');

  return (
    <div className="h-full overflow-y-auto custom-scrollbar animate-view-enter">
      <div className="p-6">
        {/* Header */}
        <div className="flex gap-6 mb-6">
          <div className="w-60 h-60 rounded-lg overflow-hidden shadow-2xl shadow-black/60 flex-shrink-0 bg-white/[0.04]">
            {artworkUrl ? (
              <img src={artworkUrl} alt={album.attributes.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-16 h-16 text-white/10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end min-w-0">
            <p className="text-white/40 text-[12px] uppercase tracking-wider font-medium mb-1">
              {album.attributes.isSingle ? 'Single' : 'Album'}
            </p>
            <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight mb-2 line-clamp-2">
              {album.attributes.name}
            </h1>
            <div className="flex items-center gap-2 text-[13px] text-white/60 flex-wrap">
              {artistId ? (
                <button
                  onClick={() => navigate('artist', { id: artistId })}
                  className="font-medium text-white/80 hover:underline"
                >
                  {album.attributes.artistName}
                </button>
              ) : (
                <span className="font-medium text-white/80">{album.attributes.artistName}</span>
              )}
              {releaseYear && (
                <>
                  <span className="text-white/20">·</span>
                  <span>{releaseYear}</span>
                </>
              )}
              {genres && (
                <>
                  <span className="text-white/20">·</span>
                  <span>{genres}</span>
                </>
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

        {/* Track list */}
        <TrackList tracks={tracks} showAlbum={false} />
      </div>
    </div>
  );
}
