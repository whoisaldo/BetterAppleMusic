import { useState, useEffect, useRef, useCallback } from 'react';

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

export function useAudioPlayer(): [AudioPlayerState, AudioPlayerControls] {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    queue: [],
    queueIndex: -1,
  });

  // Create audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.7;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setState((s) => ({
        ...s,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
      }));
    };

    const onPlay = () => setState((s) => ({ ...s, isPlaying: true }));
    const onPause = () => setState((s) => ({ ...s, isPlaying: false }));
    const onEnded = () => {
      // Auto-advance to next track
      setState((s) => {
        const nextIndex = s.queueIndex + 1;
        if (nextIndex < s.queue.length) {
          const nextTrack = s.queue[nextIndex];
          if (nextTrack.previewUrl) {
            audio.src = nextTrack.previewUrl;
            audio.play().catch(console.error);
          }
          return { ...s, currentTrack: nextTrack, queueIndex: nextIndex, currentTime: 0 };
        }
        return { ...s, isPlaying: false, currentTime: 0 };
      });
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const playTrack = useCallback((track: Track, queue?: Track[]) => {
    const audio = audioRef.current;
    if (!audio || !track.previewUrl) return;

    const newQueue = queue || [track];
    const idx = queue ? queue.findIndex((t) => t.id === track.id) : 0;

    audio.src = track.previewUrl;
    audio.play().catch(console.error);

    setState({
      currentTrack: track,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
      queue: newQueue,
      queueIndex: idx >= 0 ? idx : 0,
    });
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play().catch(console.error);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(console.error);
    else audio.pause();
  }, []);

  const next = useCallback(() => {
    setState((s) => {
      const nextIndex = s.queueIndex + 1;
      if (nextIndex < s.queue.length) {
        const nextTrack = s.queue[nextIndex];
        const audio = audioRef.current;
        if (audio && nextTrack.previewUrl) {
          audio.src = nextTrack.previewUrl;
          audio.play().catch(console.error);
        }
        return { ...s, currentTrack: nextTrack, queueIndex: nextIndex, currentTime: 0 };
      }
      return s;
    });
  }, []);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // If more than 3 seconds in, restart current track
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    setState((s) => {
      const prevIndex = s.queueIndex - 1;
      if (prevIndex >= 0) {
        const prevTrack = s.queue[prevIndex];
        if (prevTrack.previewUrl) {
          audio.src = prevTrack.previewUrl;
          audio.play().catch(console.error);
        }
        return { ...s, currentTrack: prevTrack, queueIndex: prevIndex, currentTime: 0 };
      }
      audio.currentTime = 0;
      return s;
    });
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = time;
  }, []);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    if (audio) audio.volume = Math.max(0, Math.min(1, vol));
  }, []);

  return [state, { playTrack, play, pause, toggle, next, previous, seek, setVolume }];
}
