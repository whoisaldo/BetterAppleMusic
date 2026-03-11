import React, { useEffect, useState } from 'react';
import { useMusicKitContext } from '@renderer/context/MusicKitContext';
import { usePlayer, type Track } from '@renderer/context/PlayerContext';
import { useNavigation } from '@renderer/context/NavigationContext';
import { TrackList } from '@renderer/components/tracks/TrackList';
import { AlbumCard } from '@renderer/components/cards/AlbumCard';
import { SkeletonSection, SkeletonLine, SkeletonCard } from '@renderer/components/common/Skeleton';
import { getArtworkUrl } from '@renderer/utils/artwork';
import type { MKArtist, MKAlbum, MKSong } from '@renderer/types/musickit';

function songToTrack(s: MKSong, artistId: string): Track {
  return {
    id: s.id,
    name: s.attributes.name,
    artistName: s.attributes.artistName,
    albumName: s.attributes.albumName,
    artworkUrl: getArtworkUrl(s.attributes.artwork, 300),
    durationMs: s.attributes.durationInMillis,
    albumId: s.relationships?.albums?.data?.[0]?.id,
    artistId,
  };
}

export function ArtistPage() {
  const { mk, storefront } = useMusicKitContext();
  const { controls } = usePlayer();
  const { viewParams, navigate } = useNavigation();
  const artistId = viewParams.id;

  const [artist, setArtist] = useState<MKArtist | null>(null);
  const [topSongs, setTopSongs] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<MKAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mk || !artistId) return;
    let cancelled = false;

    async function fetchArtist() {
      setLoading(true);
      setError(null);
      try {
        const resp = await mk!.api.music(`/v1/catalog/${storefront}/artists/${artistId}`, {
          include: ['albums'],
          'views': ['top-songs'],
        });
        const data = resp.data as {
          data?: Array<MKArtist & { views?: { 'top-songs'?: { data: MKSong[] } } }>;
        };
        const a = data.data?.[0];
        if (!cancelled && a) {
          setArtist(a);
          const topSongData = a.views?.['top-songs']?.data ?? [];
          setTopSongs(topSongData.map((s) => songToTrack(s, artistId)));
          setAlbums(a.relationships?.albums?.data ?? []);
        }
      } catch {
        // Fallback: fetch artist basic info and albums separately
        try {
          const resp = await mk!.api.music(`/v1/catalog/${storefront}/artists/${artistId}`);
          const data = resp.data as { data?: MKArtist[] };
          if (!cancelled && data.data?.[0]) setArtist(data.data[0]);
        } catch (err) {
          if (!cancelled) setError('Failed to load artist');
          console.error('[ArtistPage] error:', err);
        }

        try {
          const resp = await mk!.api.music(`/v1/catalog/${storefront}/artists/${artistId}/albums`, { limit: 20 });
          const data = resp.data as { data?: MKAlbum[] };
          if (!cancelled) setAlbums(data.data ?? []);
        } catch {
          // Non-critical
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchArtist();
    return () => { cancelled = true; };
  }, [mk, artistId, storefront]);

  if (loading) {
    return (
      <div className="p-6 animate-view-enter">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-48 h-48 rounded-full bg-white/[0.04] animate-pulse" />
          <div className="space-y-3">
            <SkeletonLine className="h-8 w-48" />
            <SkeletonLine className="h-4 w-32" />
          </div>
        </div>
        <SkeletonSection rows={5} />
        <div className="mt-8">
          <SkeletonSection showCards />
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="flex items-center justify-center h-full text-white/30 text-sm">
        {error || 'Artist not found'}
      </div>
    );
  }

  const artworkUrl = getArtworkUrl(artist.attributes.artwork, 400);
  const genres = artist.attributes.genreNames?.join(', ');

  return (
    <div className="h-full overflow-y-auto custom-scrollbar animate-view-enter">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-6">
          <div className="w-48 h-48 rounded-full overflow-hidden shadow-2xl shadow-black/60 flex-shrink-0 bg-white/[0.04]">
            {artworkUrl ? (
              <img src={artworkUrl} alt={artist.attributes.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-violet-600/20 flex items-center justify-center">
                <svg className="w-16 h-16 text-white/15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <p className="text-white/40 text-[12px] uppercase tracking-wider font-medium mb-1">Artist</p>
            <h1 className="text-[36px] font-bold text-white tracking-tight">
              {artist.attributes.name}
            </h1>
            {genres && <p className="text-white/40 text-[14px] mt-1">{genres}</p>}
          </div>
        </div>

        {/* Top Songs */}
        {topSongs.length > 0 && (
          <section>
            <h2 className="text-[20px] font-semibold text-white/90 mb-4">Top Songs</h2>
            <TrackList tracks={topSongs.slice(0, 10)} showAlbum />
          </section>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <section>
            <h2 className="text-[20px] font-semibold text-white/90 mb-4">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {albums.map((a) => (
                <AlbumCard
                  key={a.id}
                  id={a.id}
                  name={a.attributes.name}
                  artistName={a.attributes.artistName}
                  artwork={a.attributes.artwork}
                  onClick={() => navigate('album', { id: a.id })}
                  onPlay={() => controls.playAlbum(a.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
