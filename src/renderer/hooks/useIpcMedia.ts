import { useEffect } from 'react';
import { usePlayer } from '@renderer/context/PlayerContext';

export function useIpcMedia() {
  const { state, controls } = usePlayer();

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    const unsubs = [
      api.on('media:toggle-play', () => controls.toggle()),
      api.on('media:next', () => controls.next()),
      api.on('media:previous', () => controls.previous()),
      api.on('media:volume-up', () => controls.setVolume(Math.min(1, state.volume + 0.1))),
      api.on('media:volume-down', () => controls.setVolume(Math.max(0, state.volume - 0.1))),
    ];

    return () => unsubs.forEach((fn) => fn());
  }, [controls, state.volume]);
}
