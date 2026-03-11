import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useMusicKitContext } from './MusicKitContext';
import type { MKSong } from '@renderer/types/musickit';
import { getArtworkUrl } from '@renderer/utils/artwork';

export interface Track {
  id: string;
  name: string;
  artistName: string;
  albumName: string;
  artworkUrl: string | null;
  durationMs: number;
  type?: string;
  albumId?: string;
  artistId?: string;
}

export type ShuffleMode = 'off' | 'on';
export type RepeatMode = 'none' | 'one' | 'all';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  queueIndex: number;
  shuffleMode: ShuffleMode;
  repeatMode: RepeatMode;
  isQueueVisible: boolean;
}

interface PlayerControls {
  playTrack: (track: Track, queue?: Track[]) => void;
  playAlbum: (albumId: string) => void;
  playPlaylist: (playlistId: string) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  moveInQueue: (from: number, to: number) => void;
  toggleQueuePanel: () => void;
  playFromQueue: (index: number) => void;
}

interface PlayerContextValue {
  state: PlayerState;
  controls: PlayerControls;
}

const PlayerCtx = createContext<PlayerContextValue | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerCtx);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

function songToTrack(song: MKSong): Track {
  return {
    id: song.id,
    name: song.attributes.name,
    artistName: song.attributes.artistName,
    albumName: song.attributes.albumName,
    artworkUrl: getArtworkUrl(song.attributes.artwork, 300),
    durationMs: song.attributes.durationInMillis,
    type: song.type,
  };
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { mk, storefront } = useMusicKitContext();

  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    queue: [],
    queueIndex: -1,
    shuffleMode: 'off',
    repeatMode: 'none',
    isQueueVisible: false,
  });

  const queueRef = useRef<Track[]>([]);
  const queueIndexRef = useRef(-1);
  const shuffleRef = useRef<ShuffleMode>('off');
  const repeatRef = useRef<RepeatMode>('none');

  useEffect(() => {
    if (!mk) return;

    function onPlaybackStateChange() {
      const playing = mk!.playbackState === 2;
      setState((s) => ({ ...s, isPlaying: playing }));
    }

    function onTimeChange() {
      setState((s) => ({
        ...s,
        currentTime: mk!.currentPlaybackTime ?? 0,
        duration: mk!.currentPlaybackDuration ?? 0,
      }));
    }

    function onNowPlayingChange() {
      const item = mk!.nowPlayingItem;
      if (!item?.attributes) return;
      const a = item.attributes;
      setState((s) => ({
        ...s,
        currentTrack: s.currentTrack
          ? {
              ...s.currentTrack,
              name: a.name ?? s.currentTrack.name,
              artistName: a.artistName ?? s.currentTrack.artistName,
              albumName: a.albumName ?? s.currentTrack.albumName,
              artworkUrl: a.artwork?.url
                ? a.artwork.url.replace('{w}', '300').replace('{h}', '300')
                : s.currentTrack.artworkUrl,
              durationMs: a.durationInMillis ?? s.currentTrack.durationMs,
            }
          : null,
        duration: (a.durationInMillis ?? 0) / 1000,
      }));
    }

    function onMediaItemDidChange() {
      handleAutoAdvance();
    }

    mk.addEventListener('playbackStateDidChange', onPlaybackStateChange);
    mk.addEventListener('playbackTimeDidChange', onTimeChange);
    mk.addEventListener('nowPlayingItemDidChange', onNowPlayingChange);
    mk.addEventListener('mediaItemStateDidChange', onMediaItemDidChange);

    return () => {
      mk.removeEventListener('playbackStateDidChange', onPlaybackStateChange);
      mk.removeEventListener('playbackTimeDidChange', onTimeChange);
      mk.removeEventListener('nowPlayingItemDidChange', onNowPlayingChange);
      mk.removeEventListener('mediaItemStateDidChange', onMediaItemDidChange);
    };
  }, [mk]);

  function handleAutoAdvance() {
    if (!mk) return;
    if (mk.playbackState !== 10 && mk.playbackState !== 5) return;

    const repeat = repeatRef.current;
    if (repeat === 'one') {
      mk.seekToTime(0).then(() => mk.play()).catch(console.error);
      return;
    }

    const q = queueRef.current;
    let nextIdx = queueIndexRef.current + 1;

    if (nextIdx >= q.length) {
      if (repeat === 'all') {
        nextIdx = 0;
      } else {
        setState((s) => ({ ...s, isPlaying: false }));
        return;
      }
    }

    if (nextIdx < q.length) {
      const nextTrack = q[nextIdx];
      queueIndexRef.current = nextIdx;
      setState((s) => ({ ...s, currentTrack: nextTrack, queueIndex: nextIdx, currentTime: 0 }));
      mk.setQueue({ song: nextTrack.id, startPlaying: true } as Record<string, unknown>).catch(console.error);
    }
  }

  const playTrack = useCallback(
    async (track: Track, queue?: Track[]) => {
      if (!mk) return;
      const newQueue = queue || [track];
      const idx = newQueue.findIndex((t) => t.id === track.id);
      const realIdx = idx >= 0 ? idx : 0;

      let finalQueue = newQueue;
      if (shuffleRef.current === 'on' && newQueue.length > 1) {
        const before = newQueue[realIdx];
        const rest = newQueue.filter((_, i) => i !== realIdx);
        for (let i = rest.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [rest[i], rest[j]] = [rest[j], rest[i]];
        }
        finalQueue = [before, ...rest];
      }

      queueRef.current = finalQueue;
      const newIdx = shuffleRef.current === 'on' ? 0 : realIdx;
      queueIndexRef.current = newIdx;

      setState((s) => ({
        ...s,
        currentTrack: finalQueue[newIdx],
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        queue: finalQueue,
        queueIndex: newIdx,
      }));

      try {
        await mk.setQueue({ song: finalQueue[newIdx].id, startPlaying: true } as Record<string, unknown>);
      } catch (err: unknown) {
        const msg = String(err);
        if (!msg.includes('interrupted') && !msg.includes('abort')) {
          console.error('[Player] playback error:', err);
        }
      }
    },
    [mk],
  );

  const playAlbum = useCallback(
    async (albumId: string) => {
      if (!mk) return;
      try {
        const resp = await mk.api.music(`/v1/catalog/${storefront}/albums/${albumId}`, {
          include: ['tracks'],
        });
        const data = resp.data as { data?: Array<{ relationships?: { tracks?: { data: MKSong[] } } }> };
        const tracks = data.data?.[0]?.relationships?.tracks?.data;
        if (tracks && tracks.length > 0) {
          const queue = tracks.map(songToTrack);
          await playTrack(queue[0], queue);
        }
      } catch (err) {
        console.error('[Player] playAlbum error:', err);
      }
    },
    [mk, storefront, playTrack],
  );

  const playPlaylist = useCallback(
    async (playlistId: string) => {
      if (!mk) return;
      try {
        const isLibrary = playlistId.startsWith('p.');
        const path = isLibrary
          ? `/v1/me/library/playlists/${playlistId}`
          : `/v1/catalog/${storefront}/playlists/${playlistId}`;
        const resp = await mk.api.music(path, { include: ['tracks'] });
        const data = resp.data as { data?: Array<{ relationships?: { tracks?: { data: MKSong[] } } }> };
        const tracks = data.data?.[0]?.relationships?.tracks?.data;
        if (tracks && tracks.length > 0) {
          const queue = tracks.map(songToTrack);
          await playTrack(queue[0], queue);
        }
      } catch (err) {
        console.error('[Player] playPlaylist error:', err);
      }
    },
    [mk, storefront, playTrack],
  );

  const toggle = useCallback(() => {
    if (!mk) return;
    if (mk.playbackState === 2) mk.pause();
    else mk.play().catch(console.error);
  }, [mk]);

  const next = useCallback(async () => {
    if (!mk) return;
    const nextIdx = queueIndexRef.current + 1;
    if (nextIdx < queueRef.current.length) {
      const nextTrack = queueRef.current[nextIdx];
      queueIndexRef.current = nextIdx;
      setState((s) => ({ ...s, currentTrack: nextTrack, queueIndex: nextIdx, currentTime: 0 }));
      try {
        await mk.setQueue({ song: nextTrack.id, startPlaying: true } as Record<string, unknown>);
      } catch (err) {
        const msg = String(err);
        if (!msg.includes('interrupted') && !msg.includes('abort')) console.error('[Player] next error:', err);
      }
    } else if (repeatRef.current === 'all' && queueRef.current.length > 0) {
      const firstTrack = queueRef.current[0];
      queueIndexRef.current = 0;
      setState((s) => ({ ...s, currentTrack: firstTrack, queueIndex: 0, currentTime: 0 }));
      try {
        await mk.setQueue({ song: firstTrack.id, startPlaying: true } as Record<string, unknown>);
      } catch (err) {
        console.error('[Player] next wrap error:', err);
      }
    }
  }, [mk]);

  const previous = useCallback(async () => {
    if (!mk) return;
    if ((mk.currentPlaybackTime ?? 0) > 3) {
      mk.seekToTime(0).catch(console.error);
      return;
    }
    const prevIdx = queueIndexRef.current - 1;
    if (prevIdx >= 0) {
      const prevTrack = queueRef.current[prevIdx];
      queueIndexRef.current = prevIdx;
      setState((s) => ({ ...s, currentTrack: prevTrack, queueIndex: prevIdx, currentTime: 0 }));
      try {
        await mk.setQueue({ song: prevTrack.id, startPlaying: true } as Record<string, unknown>);
      } catch (err) {
        const msg = String(err);
        if (!msg.includes('interrupted') && !msg.includes('abort')) console.error('[Player] prev error:', err);
      }
    } else {
      mk.seekToTime(0).catch(console.error);
    }
  }, [mk]);

  const seek = useCallback((time: number) => {
    mk?.seekToTime(time).catch(console.error);
  }, [mk]);

  const setVolume = useCallback((vol: number) => {
    const v = Math.max(0, Math.min(1, vol));
    if (mk) mk.volume = v;
    setState((s) => ({ ...s, volume: v }));
  }, [mk]);

  const toggleShuffle = useCallback(() => {
    setState((s) => {
      const next: ShuffleMode = s.shuffleMode === 'off' ? 'on' : 'off';
      shuffleRef.current = next;
      if (mk) mk.shuffleMode = next === 'on' ? 1 : 0;
      return { ...s, shuffleMode: next };
    });
  }, [mk]);

  const cycleRepeat = useCallback(() => {
    setState((s) => {
      const order: RepeatMode[] = ['none', 'all', 'one'];
      const idx = order.indexOf(s.repeatMode);
      const next = order[(idx + 1) % order.length];
      repeatRef.current = next;
      if (mk) mk.repeatMode = next === 'none' ? 0 : next === 'one' ? 1 : 2;
      return { ...s, repeatMode: next };
    });
  }, [mk]);

  const addToQueue = useCallback((track: Track) => {
    queueRef.current = [...queueRef.current, track];
    setState((s) => ({ ...s, queue: [...s.queue, track] }));
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    const q = [...queueRef.current];
    q.splice(index, 1);
    queueRef.current = q;
    let newIdx = queueIndexRef.current;
    if (index < newIdx) newIdx--;
    else if (index === newIdx) newIdx = Math.min(newIdx, q.length - 1);
    queueIndexRef.current = newIdx;
    setState((s) => ({ ...s, queue: q, queueIndex: newIdx }));
  }, []);

  const clearQueue = useCallback(() => {
    const current = queueRef.current[queueIndexRef.current];
    if (current) {
      queueRef.current = [current];
      queueIndexRef.current = 0;
      setState((s) => ({ ...s, queue: [current], queueIndex: 0 }));
    } else {
      queueRef.current = [];
      queueIndexRef.current = -1;
      setState((s) => ({ ...s, queue: [], queueIndex: -1 }));
    }
  }, []);

  const moveInQueue = useCallback((from: number, to: number) => {
    const q = [...queueRef.current];
    const [item] = q.splice(from, 1);
    q.splice(to, 0, item);
    queueRef.current = q;
    let newIdx = queueIndexRef.current;
    if (from === newIdx) newIdx = to;
    else {
      if (from < newIdx && to >= newIdx) newIdx--;
      else if (from > newIdx && to <= newIdx) newIdx++;
    }
    queueIndexRef.current = newIdx;
    setState((s) => ({ ...s, queue: q, queueIndex: newIdx }));
  }, []);

  const toggleQueuePanel = useCallback(() => {
    setState((s) => ({ ...s, isQueueVisible: !s.isQueueVisible }));
  }, []);

  const playFromQueue = useCallback(async (index: number) => {
    if (!mk || index < 0 || index >= queueRef.current.length) return;
    const track = queueRef.current[index];
    queueIndexRef.current = index;
    setState((s) => ({ ...s, currentTrack: track, queueIndex: index, currentTime: 0 }));
    try {
      await mk.setQueue({ song: track.id, startPlaying: true } as Record<string, unknown>);
    } catch (err) {
      console.error('[Player] playFromQueue error:', err);
    }
  }, [mk]);

  const controls: PlayerControls = {
    playTrack,
    playAlbum,
    playPlaylist,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
    addToQueue,
    removeFromQueue,
    clearQueue,
    moveInQueue,
    toggleQueuePanel,
    playFromQueue,
  };

  return (
    <PlayerCtx.Provider value={{ state, controls }}>
      {children}
    </PlayerCtx.Provider>
  );
}
