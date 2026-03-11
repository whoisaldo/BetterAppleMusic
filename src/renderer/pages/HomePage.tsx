import React, { useEffect, useState } from 'react';
import { useMusicKitContext } from '@renderer/context/MusicKitContext';
import { usePlayer, type Track } from '@renderer/context/PlayerContext';
import { useNavigation } from '@renderer/context/NavigationContext';
import { AlbumCard } from '@renderer/components/cards/AlbumCard';
import { PlaylistCard } from '@renderer/components/cards/PlaylistCard';
import { SkeletonSection, SkeletonCard } from '@renderer/components/common/Skeleton';
import { getArtworkUrl } from '@renderer/utils/artwork';
import type { MKSong, MKAlbum, MKPlaylist } from '@renderer/types/musickit';
import { formatDuration } from '@renderer/utils/formatTime';
import { cn } from '@renderer/utils/cn';

interface RecentItem {
  id: string;
  type: string;
  attributes: {
    name: string;
    artistName?: string;
    curatorName?: string;
    artwork?: { url: string };
  };
}

function songToTrack(s: MKSong): Track {
  return {
    id: s.id,
    name: s.attributes.name,
    artistName: s.attributes.artistName,
    albumName: s.attributes.albumName,
    artworkUrl: getArtworkUrl(s.attributes.artwork, 300),
    durationMs: s.attributes.durationInMillis,
  };
}

export function HomePage() {
  const { mk, storefront } = useMusicKitContext();
  const { controls } = usePlayer();
  const { navigate } = useNavigation();

  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentItem[]>([]);
  const [topSongs, setTopSongs] = useState<MKSong[]>([]);
  const [topAlbums, setTopAlbums] = useState<MKAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!mk) return;
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      const errors: Record<string, boolean> = {};

      try {
        const resp = await mk!.api.music('/v1/me/recent/played', { limit: 12 });
        const data = resp.data as { data?: RecentItem[] };
        if (!cancelled) setRecentlyPlayed(data.data ?? []);
      } catch {
        errors.recent = true;
      }

      try {
        const resp = await mk!.api.music(`/v1/catalog/${storefront}/charts`, {
          types: ['songs'],
          limit: 10,
        });
        const data = resp.data as { results?: { songs?: Array<{ data: MKSong[] }> } };
        if (!cancelled) setTopSongs(data.results?.songs?.[0]?.data ?? []);
      } catch {
        errors.topSongs = true;
      }

      try {
        const resp = await mk!.api.music(`/v1/catalog/${storefront}/charts`, {
          types: ['albums'],
          limit: 12,
        });
        const data = resp.data as { results?: { albums?: Array<{ data: MKAlbum[] }> } };
        if (!cancelled) setTopAlbums(data.results?.albums?.[0]?.data ?? []);
      } catch {
        errors.topAlbums = true;
      }

      if (!cancelled) {
        setError(errors);
        setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [mk, storefront]);

  const topSongTracks = topSongs.map(songToTrack);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar animate-view-enter">
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight">Home</h1>
          <p className="text-white/40 text-[14px] mt-1">Good {getGreeting()}. Here&apos;s what&apos;s trending.</p>
        </div>

        {/* Recently Played */}
        <section>
          <h2 className="text-[20px] font-semibold text-white/90 mb-4">Recently Played</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error.recent ? (
            <p className="text-white/20 text-sm py-8 text-center">Could not load recently played</p>
          ) : recentlyPlayed.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {recentlyPlayed.map((item) => {
                const isAlbum = item.type === 'albums' || item.type === 'library-albums';
                const isPlaylist = item.type === 'playlists' || item.type === 'library-playlists';

                if (isPlaylist) {
                  return (
                    <PlaylistCard
                      key={item.id}
                      id={item.id}
                      name={item.attributes.name}
                      curatorName={item.attributes.curatorName}
                      artwork={item.attributes.artwork as { url: string } | undefined}
                      onClick={() => navigate('playlist', { id: item.id })}
                      onPlay={() => controls.playPlaylist(item.id)}
                    />
                  );
                }

                return (
                  <AlbumCard
                    key={item.id}
                    id={item.id}
                    name={item.attributes.name}
                    artistName={item.attributes.artistName ?? ''}
                    artwork={item.attributes.artwork as { url: string } | undefined}
                    onClick={() => navigate(isAlbum ? 'album' : 'playlist', { id: item.id })}
                    onPlay={() => {
                      if (isAlbum) controls.playAlbum(item.id);
                      else controls.playPlaylist(item.id);
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/20 text-sm">No listening history yet</p>
              <p className="text-white/10 text-xs mt-1">Start playing music to see your history here</p>
            </div>
          )}
        </section>

        {/* Top Songs */}
        <section>
          <h2 className="text-[20px] font-semibold text-white/90 mb-4">Top Songs</h2>
          {loading ? (
            <SkeletonSection rows={5} />
          ) : error.topSongs ? (
            <p className="text-white/20 text-sm py-4 text-center">Could not load top songs</p>
          ) : topSongs.length > 0 ? (
            <div className="space-y-0.5">
              {topSongTracks.slice(0, 10).map((track, i) => (
                <button
                  key={track.id}
                  onClick={() => controls.playTrack(track, topSongTracks)}
                  className="w-full flex items-center gap-4 px-3 py-2 rounded-md hover:bg-white/[0.04] transition-colors group"
                >
                  <span className="w-6 text-right text-white/20 text-[14px] font-medium tabular-nums">
                    {i + 1}
                  </span>
                  <div className="w-10 h-10 rounded overflow-hidden bg-white/[0.04] flex-shrink-0">
                    {track.artworkUrl ? (
                      <img src={track.artworkUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-white/[0.04]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[14px] font-medium text-white/90 truncate">{track.name}</p>
                    <p className="text-[12px] text-white/40 truncate">{track.artistName}</p>
                  </div>
                  <span className="text-white/20 text-[12px] tabular-nums">
                    {formatDuration(track.durationMs)}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </section>

        {/* Top Albums */}
        <section>
          <h2 className="text-[20px] font-semibold text-white/90 mb-4">Top Albums</h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error.topAlbums ? (
            <p className="text-white/20 text-sm py-4 text-center">Could not load top albums</p>
          ) : topAlbums.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {topAlbums.map((a) => (
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
          ) : null}
        </section>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
