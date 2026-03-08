import React, { useState, useRef } from 'react';

interface Song {
  id: string;
  name: string;
  artistName: string;
  albumName: string;
  artworkUrl: string | null;
  previewUrl: string | null;
}

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
  setQueue: (options: { song: string }) => Promise<void>;
  play: () => Promise<void>;
}

interface Props {
  musicKit: unknown;
  onPlayPreview?: (url: string, song: Song) => void;
}

export function SearchBar({ musicKit, onPlayPreview }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const mk = musicKit as MKInstance | null;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!mk || !query.trim()) return;

    setLoading(true);
    try {
      const response = await mk.api.music('/v1/catalog/us/search', {
        term: query,
        types: ['songs'],
        limit: 20,
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

  async function playSong(song: Song) {
    if (!mk) return;
    setPlayingId(song.id);

    // Try MusicKit playback first, fall back to preview URL
    try {
      await mk.setQueue({ song: song.id });
      await mk.play();
    } catch (err) {
      console.warn('[Play] MusicKit playback failed, trying preview:', err);
      if (song.previewUrl && onPlayPreview) {
        onPlayPreview(song.previewUrl, song);
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search header */}
      <div className="p-6 pb-4">
        <form onSubmit={handleSearch} className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full bg-white/10 text-white text-sm pl-12 pr-4 py-3 rounded-full border border-white/5 focus:border-white/20 focus:bg-white/15 focus:outline-none placeholder-white/30 transition-all"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          )}
        </form>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-white/20">
            <svg className="w-16 h-16 mb-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <p className="text-sm">Search for songs to play</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-1">
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">
              Songs
            </p>
            {results.map((song, i) => (
              <button
                key={song.id}
                type="button"
                onClick={() => playSong(song)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover-card text-left group"
              >
                <span className="w-5 text-white/20 text-sm text-right group-hover:hidden">
                  {i + 1}
                </span>
                <span className="w-5 hidden group-hover:flex items-center justify-center text-white">
                  {playingId === song.id ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </span>

                <div className="w-10 h-10 rounded overflow-hidden bg-white/5 flex-shrink-0">
                  {song.artworkUrl ? (
                    <img src={song.artworkUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${playingId === song.id ? 'text-pink-400' : 'text-white'}`}>
                    {song.name}
                  </p>
                  <p className="text-white/40 text-xs truncate">{song.artistName}</p>
                </div>

                <p className="text-white/20 text-xs truncate max-w-[160px] hidden sm:block">
                  {song.albumName}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
