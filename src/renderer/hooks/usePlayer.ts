import { useState, useCallback } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  artwork?: string;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
}

export function usePlayer() {
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
  });

  const play = useCallback((track?: Track) => {
    setState((prev) => ({
      ...prev,
      currentTrack: track ?? prev.currentTrack,
      isPlaying: true,
    }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const togglePlay = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setState((prev) => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const seek = useCallback((time: number) => {
    setState((prev) => ({ ...prev, currentTime: time }));
  }, []);

  return {
    ...state,
    play,
    pause,
    togglePlay,
    setVolume,
    seek,
  };
}
