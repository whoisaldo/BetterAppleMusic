import React, { useEffect, useState } from 'react';
import { useMusicKitContext } from '@renderer/context/MusicKitContext';
import { usePlayer, type Track } from '@renderer/context/PlayerContext';
import { useNavigation } from '@renderer/context/NavigationContext';
import { AlbumCard } from '@renderer/components/cards/AlbumCard';
import { PlaylistCard } from '@renderer/components/cards/PlaylistCard';
import { SkeletonCard } from '@renderer/components/common/Skeleton';

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

export function RecentlyPlayedPage() {
  const { mk } = useMusicKitContext();
  const { controls } = usePlayer();
  const { navigate } = useNavigation();

  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mk) return;
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      try {
        const resp = await mk!.api.music('/v1/me/recent/played', { limit: 30 });
        const data = resp.data as { data?: RecentItem[] };
        if (!cancelled) setItems(data.data ?? []);
      } catch (err) {
        console.error('[RecentlyPlayed] error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [mk]);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar animate-view-enter">
      <div className="p-6">
        <h1 className="text-[28px] font-bold text-white tracking-tight mb-6">Recently Played</h1>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {items.map((item) => {
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
                  onClick={() => navigate('album', { id: item.id })}
                  onPlay={() => controls.playAlbum(item.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white/15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
            </div>
            <p className="text-white/30 text-[14px] font-medium">No listening history yet</p>
            <p className="text-white/15 text-[12px] mt-1">Start playing music to build your history</p>
          </div>
        )}
      </div>
    </div>
  );
}
