import React, { useEffect, useState } from 'react';
import { cn } from '@renderer/utils/cn';
import { useNavigation, type ViewType } from '@renderer/context/NavigationContext';
import { useMusicKitContext } from '@renderer/context/MusicKitContext';
import type { MKPlaylist } from '@renderer/types/musickit';

interface NavItemDef {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
}

const mainNav: NavItemDef[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />,
  },
  {
    id: 'search',
    label: 'Search',
    icon: <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />,
  },
  {
    id: 'library',
    label: 'Library',
    icon: <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z" />,
  },
];

const libraryNav: NavItemDef[] = [
  {
    id: 'recently-played',
    label: 'Recently Played',
    icon: <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />,
  },
];

export function Sidebar() {
  const { currentView, navigate } = useNavigation();
  const { mk } = useMusicKitContext();
  const [playlists, setPlaylists] = useState<MKPlaylist[]>([]);

  useEffect(() => {
    if (!mk) return;
    let cancelled = false;

    async function fetchPlaylists() {
      try {
        const resp = await mk!.api.music('/v1/me/library/playlists', { limit: 50 });
        const data = resp.data as { data?: MKPlaylist[] };
        if (!cancelled && data.data) {
          setPlaylists(data.data);
        }
      } catch {
        // Ignore — playlists just won't show
      }
    }

    fetchPlaylists();
    return () => { cancelled = true; };
  }, [mk]);

  function isActive(view: ViewType) {
    return currentView === view;
  }

  return (
    <div className="w-[240px] bg-surface flex flex-col flex-shrink-0 border-r border-white/[0.04]">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">BAM</span>
        </div>
      </div>

      <nav className="px-2 space-y-0.5">
        {mainNav.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={cn(
              'flex items-center gap-3 px-3 py-[7px] rounded-lg text-left transition-all text-[13px] w-full',
              isActive(item.id)
                ? 'bg-white/[0.08] text-white font-medium'
                : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]',
            )}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              {item.icon}
            </svg>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-5 px-5 mb-1">
        <p className="text-white/15 text-[10px] font-bold uppercase tracking-[0.15em]">Your Library</p>
      </div>

      <nav className="px-2 space-y-0.5">
        {libraryNav.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={cn(
              'flex items-center gap-3 px-3 py-[7px] rounded-lg text-left transition-all text-[13px] w-full',
              isActive(item.id)
                ? 'bg-white/[0.08] text-white font-medium'
                : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]',
            )}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              {item.icon}
            </svg>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {playlists.length > 0 && (
        <>
          <div className="mt-5 px-5 mb-1">
            <p className="text-white/15 text-[10px] font-bold uppercase tracking-[0.15em]">Playlists</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-3">
            {playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => navigate('playlist', { id: pl.id })}
                className={cn(
                  'flex items-center gap-3 px-3 py-[6px] rounded-lg text-left transition-all text-[12px] w-full truncate',
                  currentView === 'playlist' &&
                    'bg-white/[0.08] text-white/80',
                  currentView !== 'playlist' &&
                    'text-white/30 hover:text-white/60 hover:bg-white/[0.04]',
                )}
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                </svg>
                <span className="truncate">{pl.attributes.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
