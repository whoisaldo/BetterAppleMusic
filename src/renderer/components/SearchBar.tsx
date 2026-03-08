import React, { useState, useRef } from 'react';
import type { Track } from '../hooks/useAudioPlayer';

interface MKInstance {
  api: {
    music: (path: string, options?: Record<string, unknown>) => Promise<{
      data: {
        results?: {
          songs?: {
            data: Array<{
              id: string;
              attributes: {
                name: string;
                artistName: string;
                albumName: string;
                artwork?: { url?: string };
                previews?: Array<{ url?: string }>;
              };
            }>;
          };
        };
      };
    }>;
  };
}

interface Props {
  musicKit: unknown;
  onPlayTrack: (track: Track, queue: Track[]) => void;
  currentTrackId?: string | null;
  isPlaying?: boolean;
}

export function SearchBar({ musicKit, onPlayTrack, currentTrackId, isPlaying }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const mk = musicKit as MKInstance | null;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!mk || !query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const response = await mk.api.music('/v1/catalog/us/search', {
        term: query,
        types: ['songs'],
        limit: 25,
      });

      const songs = response.data.results?.songs?.data ?? [];
      setResults(
        songs.map((s) => ({
          id: s.id,
          name: s.attributes.name,
          artistName: s.attributes.artistName,
          albumName: s.attributes.albumName,
          artworkUrl: s.attributes.artwork?.url
            ? s.attributes.artwork.url.replace('{w}', '120').replace('{h}', '120')
            : null,
          previewUrl: s.attributes.previews?.[0]?.url ?? null,
        })),
      );
    } catch (err) {
      console.error('[Search] error:', err);
    } finally {
      setLoading(false);
    }
  }

  function handlePlay(track: Track) {
    onPlayTrack(track, results);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search header */}
      <div className="p-6 pb-3 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white mb-4">Search</h1>
        <form onSubmit={handleSearch} className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full bg-white/[0.07] text-white text-sm pl-12 pr-4 py-3.5 rounded-full border border-white/[0.04] focus:border-white/20 focus:bg-white/10 focus:outline-none placeholder-white/25 transition-all"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
          )}
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {!searched && (
          <div className="flex flex-col items-center justify-center h-full text-white/15 pb-20">
            <svg className="w-20 h-20 mb-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <p className="text-sm font-medium">Search for songs to play</p>
            <p className="text-xs mt-1 text-white/10">Previews available for all tracks</p>
          </div>
        )}

        {searched && results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-white/20 pb-20">
            <p className="text-sm">No results found</p>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <div className="flex items-center gap-4 text-[11px] text-white/20 uppercase tracking-wider font-medium px-3 py-2 border-b border-white/5 mb-1">
              <span className="w-8 text-center">#</span>
              <span className="flex-1">Title</span>
              <span className="w-[180px] hidden lg:block">Album</span>
            </div>

            {results.map((song, i) => {
              const isCurrent = currentTrackId === song.id;
              return (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => handlePlay(song)}
                  className={`w-full flex items-center gap-4 px-3 py-2 rounded-md text-left group transition-colors ${
                    isCurrent ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]'
                  }`}
                >
                  {/* Track number / play icon */}
                  <div className="w-8 flex items-center justify-center">
                    {isCurrent && isPlaying ? (
                      <div className="flex items-end gap-[2px] h-3">
                        <div className="w-[3px] bg-pink-500 rounded-full animate-pulse" style={{ height: '60%', animationDelay: '0ms' }} />
                        <div className="w-[3px] bg-pink-500 rounded-full animate-pulse" style={{ height: '100%', animationDelay: '150ms' }} />
                        <div className="w-[3px] bg-pink-500 rounded-full animate-pulse" style={{ height: '40%', animationDelay: '300ms' }} />
                        <div className="w-[3px] bg-pink-500 rounded-full animate-pulse" style={{ height: '80%', animationDelay: '450ms' }} />
                      </div>
                    ) : (
                      <>
                        <span className={`text-sm group-hover:hidden ${isCurrent ? 'text-pink-500' : 'text-white/20'}`}>
                          {i + 1}
                        </span>
                        <svg className="w-4 h-4 text-white hidden group-hover:block" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </>
                    )}
                  </div>

                  {/* Artwork */}
                  <div className="w-10 h-10 rounded overflow-hidden bg-white/5 flex-shrink-0">
                    {song.artworkUrl ? (
                      <img src={song.artworkUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-[13px] font-medium truncate ${isCurrent ? 'text-pink-500' : 'text-white'}`}>
                      {song.name}
                    </p>
                    <p className="text-white/35 text-[11px] truncate">{song.artistName}</p>
                  </div>

                  {/* Album */}
                  <p className="text-white/20 text-[12px] truncate w-[180px] hidden lg:block">
                    {song.albumName}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
