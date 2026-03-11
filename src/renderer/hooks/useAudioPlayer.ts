import { useState, useEffect, useCallback, useRef } from 'react';

export interface Track {
  id: string;
  name: string;
  artistName: string;
  albumName: string;
  artworkUrl: string | null;
  previewUrl: string | null;
}

export interface AudioPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  queue: Track[];
  queueIndex: number;
}

export interface AudioPlayerControls {
  playTrack: (track: Track, queue?: Track[]) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
}

interface MKInstance {
  setQueue: (options: Record<string, unknown>) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  skipToNextItem: () => Promise<void>;
  skipToPreviousItem: () => Promise<void>;
  seekToTime: (time: number) => Promise<void>;
  volume: number;
  isPlaying: boolean;
  nowPlayingItem?: {
    attributes?: {
      name?: string;
      artistName?: string;
      albumName?: string;
      artwork?: { url?: string };
      durationInMillis?: number;
    };
  };
  currentPlaybackTime?: number;
  currentPlaybackDuration?: number;
  playbackState: number | string;
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  removeEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

export function useAudioPlayer(musicKit: unknown): [AudioPlayerState, AudioPlayerControls] {
  const mk = musicKit as MKInstance | null;
  const [state, setState] = useState<AudioPlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    queue: [],
    queueIndex: -1,
  });
  const queueRef = useRef<Track[]>([]);
  const queueIndexRef = useRef(-1);

  // Subscribe to MusicKit playback events
  useEffect(() => {
    if (!mk || typeof mk.addEventListener !== 'function') return;

    function onPlaybackStateChange() {
      const playing = mk!.playbackState === 2 || mk!.playbackState === 'playing';
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
      const attrs = item.attributes;
      setState((s) => ({
        ...s,
        currentTrack: s.currentTrack
          ? {
              ...s.currentTrack,
              name: attrs.name ?? s.currentTrack.name,
              artistName: attrs.artistName ?? s.currentTrack.artistName,
              albumName: attrs.albumName ?? s.currentTrack.albumName,
              artworkUrl: attrs.artwork?.url
                ? attrs.artwork.url.replace('{w}', '500').replace('{h}', '500')
                : s.currentTrack.artworkUrl,
            }
          : null,
        duration: (attrs.durationInMillis ?? 0) / 1000,
      }));
    }

    function onQueueEnd() {
      // Auto-advance to next track in our queue
      const nextIdx = queueIndexRef.current + 1;
      if (nextIdx < queueRef.current.length) {
        const nextTrack = queueRef.current[nextIdx];
        queueIndexRef.current = nextIdx;
        mk!.setQueue({ song: nextTrack.id, startPlaying: true } as Record<string, unknown>)
          .catch(console.error);
        setState((s) => ({
          ...s,
          currentTrack: nextTrack,
          queueIndex: nextIdx,
          currentTime: 0,
        }));
      }
    }

    mk.addEventListener('playbackStateDidChange', onPlaybackStateChange);
    mk.addEventListener('playbackTimeDidChange', onTimeChange);
    mk.addEventListener('nowPlayingItemDidChange', onNowPlayingChange);
    mk.addEventListener('queueIsReady', onQueueEnd);

    return () => {
      mk.removeEventListener('playbackStateDidChange', onPlaybackStateChange);
      mk.removeEventListener('playbackTimeDidChange', onTimeChange);
      mk.removeEventListener('nowPlayingItemDidChange', onNowPlayingChange);
      mk.removeEventListener('queueIsReady', onQueueEnd);
    };
  }, [musicKit]);

  const playTrack = useCallback(
    async (track: Track, queue?: Track[]) => {
      if (!mk) return;

      const newQueue = queue || [track];
      const idx = newQueue.findIndex((t) => t.id === track.id);
      queueRef.current = newQueue;
      queueIndexRef.current = idx >= 0 ? idx : 0;

      setState({
        currentTrack: track,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        queue: newQueue,
        queueIndex: idx >= 0 ? idx : 0,
      });

      try {
        await mk.setQueue({ song: track.id, startPlaying: true } as Record<string, unknown>);
      } catch (err: unknown) {
        const msg = String(err);
        // Ignore "interrupted" errors — these are benign race conditions
        if (!msg.includes('interrupted') && !msg.includes('abort')) {
          console.error('[Player] playback error:', err);
        }
      }
    },
    [musicKit],
  );

  const play = useCallback(() => {
    mk?.play().catch(console.error);
  }, [musicKit]);

  const pause = useCallback(() => {
    mk?.pause();
  }, [musicKit]);

  const toggle = useCallback(() => {
    if (!mk) return;
    const playing = mk.playbackState === 2 || mk.playbackState === 'playing';
    if (playing) mk.pause();
    else mk.play().catch(console.error);
  }, [musicKit]);

  const next = useCallback(async () => {
    if (!mk) return;
    const nextIdx = queueIndexRef.current + 1;
    if (nextIdx < queueRef.current.length) {
      const nextTrack = queueRef.current[nextIdx];
      queueIndexRef.current = nextIdx;
      setState((s) => ({
        ...s,
        currentTrack: nextTrack,
        queueIndex: nextIdx,
        currentTime: 0,
      }));
      try {
        await mk.setQueue({ song: nextTrack.id, startPlaying: true } as Record<string, unknown>);
      } catch (err) {
        const msg = String(err);
        if (!msg.includes('interrupted') && !msg.includes('abort')) console.error('[Player] next error:', err);
      }
    }
  }, [musicKit]);

  const previous = useCallback(async () => {
    if (!mk) return;
    // If more than 3 seconds in, restart current track
    if ((mk.currentPlaybackTime ?? 0) > 3) {
      mk.seekToTime(0).catch(console.error);
      return;
    }
    const prevIdx = queueIndexRef.current - 1;
    if (prevIdx >= 0) {
      const prevTrack = queueRef.current[prevIdx];
      queueIndexRef.current = prevIdx;
      setState((s) => ({
        ...s,
        currentTrack: prevTrack,
        queueIndex: prevIdx,
        currentTime: 0,
      }));
      try {
        await mk.setQueue({ song: prevTrack.id, startPlaying: true } as Record<string, unknown>);
      } catch (err) {
        const msg = String(err);
        if (!msg.includes('interrupted') && !msg.includes('abort')) console.error('[Player] previous error:', err);
      }
    } else {
      mk.seekToTime(0).catch(console.error);
    }
  }, [musicKit]);

  const seek = useCallback(
    (time: number) => {
      mk?.seekToTime(time).catch(console.error);
    },
    [musicKit],
  );

  const setVolume = useCallback(
    (vol: number) => {
      if (mk) mk.volume = Math.max(0, Math.min(1, vol));
    },
    [musicKit],
  );

  return [state, { playTrack, play, pause, toggle, next, previous, seek, setVolume }];
}
