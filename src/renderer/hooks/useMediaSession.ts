import { useEffect } from 'react';
import { usePlayer } from '@renderer/context/PlayerContext';
import { getArtworkUrlFromString } from '@renderer/utils/artwork';

export function useMediaSession() {
  const { state, controls } = usePlayer();
  const { currentTrack, isPlaying } = state;

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    if (currentTrack) {
      const artUrl = getArtworkUrlFromString(currentTrack.artworkUrl, 512);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name,
        artist: currentTrack.artistName,
        album: currentTrack.albumName,
        artwork: artUrl ? [{ src: artUrl, sizes: '512x512', type: 'image/jpeg' }] : [],
      });
    } else {
      navigator.mediaSession.metadata = null;
    }
  }, [currentTrack]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => controls.toggle());
    navigator.mediaSession.setActionHandler('pause', () => controls.toggle());
    navigator.mediaSession.setActionHandler('previoustrack', () => controls.previous());
    navigator.mediaSession.setActionHandler('nexttrack', () => controls.next());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) controls.seek(details.seekTime);
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    };
  }, [controls]);
}
