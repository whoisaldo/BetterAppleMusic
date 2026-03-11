import React, { useEffect, useState, useCallback } from 'react';
import { useMusicKitContext } from '@renderer/context/MusicKitContext';
import { usePlayer, type Track } from '@renderer/context/PlayerContext';
import { useNavigation } from '@renderer/context/NavigationContext';
import { TrackList } from '@renderer/components/tracks/TrackList';
import { AlbumCard } from '@renderer/components/cards/AlbumCard';
import { PlaylistCard } from '@renderer/components/cards/PlaylistCard';
import { ArtistCard } from '@renderer/components/cards/ArtistCard';
import { SkeletonSection, SkeletonCard } from '@renderer/components/common/Skeleton';
import { getArtworkUrl } from '@renderer/utils/artwork';
import { cn } from '@renderer/utils/cn';
import type { MKAlbum, MKPlaylist, MKSong, MKArtist } from '@renderer/types/musickit';

type LibraryTab = 'albums' | 'playlists' | 'songs' | 'artists';

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

const TABS: { id: LibraryTab; label: string }[] = [
  { id: 'albums', label: 'Albums' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'songs', label: 'Songs' },
  { id: 'artists', label: 'Artists' },
];

export function LibraryPage() {
  const { mk } = useMusicKitContext();
  const { controls } = usePlayer();
  const { navigate } = useNavigation();

  const [activeTab, setActiveTab] = useState<LibraryTab>('albums');
  const [loading, setLoading] = useState(true);

  const [albums, setAlbums] = useState<MKAlbum[]>([]);
  const [playlists, setPlaylists] = useState<MKPlaylist[]>([]);
  const [songs, setSongs] = useState<MKSong[]>([]);
  const [artists, setArtists] = useState<MKArtist[]>([]);

  const fetchTab = useCallback(
    async (tab: LibraryTab) => {
      if (!mk) return;
      setLoading(true);
      try {
        const pathMap: Record<LibraryTab, string> = {
          albums: '/v1/me/library/albums',
          playlists: '/v1/me/library/playlists',
          songs: '/v1/me/library/songs',
          artists: '/v1/me/library/artists',
        };
        const resp = await mk.api.music(pathMap[tab], { limit: 100 });
        const data = resp.data as { data?: unknown[] };
        const items = data.data ?? [];

        switch (tab) {
          case 'albums':
            setAlbums(items as MKAlbum[]);
            break;
          case 'playlists':
            setPlaylists(items as MKPlaylist[]);
            break;
          case 'songs':
            setSongs(items as MKSong[]);
            break;
          case 'artists':
            setArtists(items as MKArtist[]);
            break;
        }
      } catch (err) {
        console.error(`[Library] Failed to fetch ${tab}:`, err);
      } finally {
        setLoading(false);
      }
    },
    [mk],
  );

  useEffect(() => {
    fetchTab(activeTab);
  }, [activeTab, fetchTab]);

  const songTracks = songs.map(songToTrack);

  return (
    <div className="flex flex-col h-full animate-view-enter">
      <div className="p-6 pb-0 flex-shrink-0">
        <h1 className="text-[28px] font-bold text-white tracking-tight mb-4">Your Library</h1>
        <div className="flex gap-2 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-1.5 rounded-full text-[12px] font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-white text-black'
                  : 'bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white/80',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
        {loading ? (
          activeTab === 'songs' ? (
            <SkeletonSection rows={10} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )
        ) : (
          <>
            {activeTab === 'albums' && (
              albums.length > 0 ? (
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
              ) : (
                <EmptyLibrary type="albums" />
              )
            )}

            {activeTab === 'playlists' && (
              playlists.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                  {playlists.map((p) => (
                    <PlaylistCard
                      key={p.id}
                      id={p.id}
                      name={p.attributes.name}
                      curatorName={p.attributes.curatorName}
                      artwork={p.attributes.artwork}
                      onClick={() => navigate('playlist', { id: p.id })}
                      onPlay={() => controls.playPlaylist(p.id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyLibrary type="playlists" />
              )
            )}

            {activeTab === 'songs' && (
              songTracks.length > 0 ? (
                <TrackList tracks={songTracks} />
              ) : (
                <EmptyLibrary type="songs" />
              )
            )}

            {activeTab === 'artists' && (
              artists.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                  {artists.map((a) => (
                    <ArtistCard
                      key={a.id}
                      id={a.id}
                      name={a.attributes.name}
                      artwork={a.attributes.artwork}
                      onClick={() => navigate('artist', { id: a.id })}
                    />
                  ))}
                </div>
              ) : (
                <EmptyLibrary type="artists" />
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyLibrary({ type }: { type: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-white/15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z" />
        </svg>
      </div>
      <p className="text-white/30 text-[14px] font-medium">No {type} in your library</p>
      <p className="text-white/15 text-[12px] mt-1">Add music to your library to see it here</p>
    </div>
  );
}
