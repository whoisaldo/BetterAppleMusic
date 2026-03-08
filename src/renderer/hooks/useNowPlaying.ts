import { useState, useEffect } from 'react';

export interface NowPlayingState {
  title: string | null;
  artist: string | null;
  album: string | null;
  artworkUrl: string | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
}

interface MusicKitInstance {
  nowPlayingItem?: {
    attributes?: {
      name?: string;
      artistName?: string;
      albumName?: string;
      artwork?: { url?: string };
    };
  };
  playbackState?: number | string;
  currentPlaybackTime?: number;
  currentPlaybackDuration?: number;
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  removeEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  PlaybackStates?: Record<string, number>;
}

export function useNowPlaying(musicKit: unknown): NowPlayingState {
  const [state, setState] = useState<NowPlayingState>({
    title: null,
    artist: null,
    album: null,
    artworkUrl: null,
    isPlaying: false,
    duration: 0,
    currentTime: 0,
  });

  useEffect(() => {
    const mk = musicKit as MusicKitInstance | null | undefined;
    if (!mk || typeof mk.addEventListener !== 'function') return;

    function getArtworkUrl(artwork: { url?: string } | undefined): string | null {
      if (!artwork?.url) return null;
      return artwork.url.replace('{w}', '500').replace('{h}', '500');
    }

    function updateFromQueue() {
      const item = mk!.nowPlayingItem;
      if (!item) return;
      const attrs = item.attributes;
      setState((prev) => ({
        ...prev,
        title: attrs?.name ?? null,
        artist: attrs?.artistName ?? null,
        album: attrs?.albumName ?? null,
        artworkUrl: getArtworkUrl(attrs?.artwork),
      }));
    }

    function onPlaybackStateChange() {
      // MusicKit v3 playbackState can be a number (enum) or string
      const ps = mk!.playbackState;
      const isPlaying = ps === 'playing' || ps === 2;
      setState((prev) => ({ ...prev, isPlaying }));
      updateFromQueue();
    }

    function onTimeChange() {
      setState((prev) => ({
        ...prev,
        currentTime: mk!.currentPlaybackTime ?? 0,
        duration: mk!.currentPlaybackDuration ?? 0,
      }));
    }

    mk.addEventListener('playbackStateDidChange', onPlaybackStateChange);
    mk.addEventListener('nowPlayingItemDidChange', updateFromQueue);
    mk.addEventListener('playbackTimeDidChange', onTimeChange);

    // Initial sync
    updateFromQueue();
    onPlaybackStateChange();

    return () => {
      mk.removeEventListener('playbackStateDidChange', onPlaybackStateChange);
      mk.removeEventListener('nowPlayingItemDidChange', updateFromQueue);
      mk.removeEventListener('playbackTimeDidChange', onTimeChange);
    };
  }, [musicKit]);

  return state;
}
