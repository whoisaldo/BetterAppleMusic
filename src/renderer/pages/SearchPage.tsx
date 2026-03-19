import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useMusicKitContext } from '@renderer/context/MusicKitContext';
import { usePlayer, type Track } from '@renderer/context/PlayerContext';
import { useNavigation } from '@renderer/context/NavigationContext';
import { TrackList } from '@renderer/components/tracks/TrackList';
import { AlbumCard } from '@renderer/components/cards/AlbumCard';
import { ArtistCard } from '@renderer/components/cards/ArtistCard';
import { PlaylistCard } from '@renderer/components/cards/PlaylistCard';
import { SkeletonSection, SkeletonTrackRow } from '@renderer/components/common/Skeleton';
import { getArtworkUrl } from '@renderer/utils/artwork';
import { cn } from '@renderer/utils/cn';
import type { MKSong, MKAlbum, MKArtist, MKPlaylist } from '@renderer/types/musickit';

type SearchTab = 'songs' | 'albums' | 'artists' | 'playlists';

function songToTrack(s: MKSong): Track {
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

const TABS: { id: SearchTab; label: string }[] = [
  { id: 'songs', label: 'Songs' },
  { id: 'albums', label: 'Albums' },
  { id: 'artists', label: 'Artists' },
  { id: 'playlists', label: 'Playlists' },
];

const GENRE_CARDS = [
  { name: 'Pop', gradient: 'from-pink-500 to-rose-600' },
  { name: 'Hip-Hop', gradient: 'from-orange-500 to-red-600' },
  { name: 'R&B/Soul', gradient: 'from-purple-500 to-violet-700' },
  { name: 'Rock', gradient: 'from-gray-600 to-gray-900' },
  { name: 'Electronic', gradient: 'from-cyan-500 to-blue-600' },
  { name: 'Country', gradient: 'from-amber-500 to-orange-700' },
  { name: 'Latin', gradient: 'from-green-500 to-emerald-700' },
  { name: 'Indie', gradient: 'from-teal-500 to-cyan-700' },
  { name: 'Classical', gradient: 'from-yellow-600 to-amber-800' },
  { name: 'Jazz', gradient: 'from-indigo-500 to-blue-800' },
  { name: 'K-Pop', gradient: 'from-fuchsia-500 to-pink-700' },
  { name: 'Metal', gradient: 'from-slate-700 to-slate-950' },
];

export function SearchPage() {
  const { mk, storefront } = useMusicKitContext();
  const { controls } = usePlayer();
  const { navigate } = useNavigation();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('songs');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [songs, setSongs] = useState<MKSong[]>([]);
  const [albums, setAlbums] = useState<MKAlbum[]>([]);
  const [artists, setArtists] = useState<MKArtist[]>([]);
  const [playlists, setPlaylists] = useState<MKPlaylist[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = useCallback(
    async (term: string) => {
      if (!mk || !term.trim()) return;
      setLoading(true);
      setSearched(true);
      try {
        const resp = await mk.api.music(`/v1/catalog/${storefront}/search`, {
          term,
          types: ['songs', 'albums', 'artists', 'playlists'],
          limit: 25,
        });
        const results = (resp.data as { results?: Record<string, { data: unknown[] }> }).results ?? {};
        setSongs((results.songs?.data as MKSong[]) ?? []);
        setAlbums((results.albums?.data as MKAlbum[]) ?? []);
        setArtists((results.artists?.data as MKArtist[]) ?? []);
        setPlaylists((results.playlists?.data as MKPlaylist[]) ?? []);
      } catch (err) {
        console.error('[Search] error:', err);
      } finally {
        setLoading(false);
      }
    },
    [mk, storefront],
  );

  useEffect(() => {
    if (!query.trim()) {
      setSearched(false);
      setSongs([]);
      setAlbums([]);
      setArtists([]);
      setPlaylists([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  const handleGenreSearch = (genre: string) => {
    setQuery(genre);
  };

  const trackResults = songs.map(songToTrack);

  return (
    <div className="flex flex-col h-full animate-view-enter">
      <div className="p-6 pb-3 flex-shrink-0">
        <h1 className="text-[28px] font-bold text-white tracking-tight mb-4">Search</h1>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full bg-white/[0.07] text-white text-[14px] pl-12 pr-10 py-3 rounded-xl border border-white/[0.04] focus:border-white/20 focus:bg-white/10 focus:outline-none placeholder-white/25 transition-all"
            data-search-input
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          )}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
          )}
        </div>

        {searched && (
          <div className="flex gap-2 mt-3">
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
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
        {!searched && (
          <div className="pt-2">
            <h2 className="text-[20px] font-semibold text-white/90 mb-4">Browse All</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {GENRE_CARDS.map((g) => (
                <button
                  key={g.name}
                  onClick={() => handleGenreSearch(g.name)}
                  className={`bg-gradient-to-br ${g.gradient} rounded-lg p-4 h-24 flex items-end text-left hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg`}
                >
                  <span className="text-white font-bold text-[16px]">{g.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && searched && (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonTrackRow key={i} />
            ))}
          </div>
        )}

        {searched && !loading && (
          <>
            {activeTab === 'songs' && (
              songs.length > 0 ? (
                <TrackList
                  tracks={trackResults}
                  onPlayTrack={(track, queue) => controls.playTrack(track, queue)}
                />
              ) : (
                <EmptyResults />
              )
            )}

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
                <EmptyResults />
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
                <EmptyResults />
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
                <EmptyResults />
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-white/20">
      <svg className="w-14 h-14 mb-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
      <p className="text-sm">No results found</p>
    </div>
  );
}
