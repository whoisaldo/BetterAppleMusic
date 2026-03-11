import { useEffect } from 'react';
import { usePlayer } from '@renderer/context/PlayerContext';
import { useNavigation } from '@renderer/context/NavigationContext';

export function useKeyboardShortcuts() {
  const { controls, state } = usePlayer();
  const { navigate, goBack } = useNavigation();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.key === ' ' && !isInput) {
        e.preventDefault();
        controls.toggle();
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault();
            controls.next();
            break;
          case 'ArrowLeft':
            e.preventDefault();
            controls.previous();
            break;
          case 'ArrowUp':
            e.preventDefault();
            controls.setVolume(Math.min(1, state.volume + 0.05));
            break;
          case 'ArrowDown':
            e.preventDefault();
            controls.setVolume(Math.max(0, state.volume - 0.05));
            break;
          case 'f':
          case 'F':
            e.preventDefault();
            navigate('search');
            setTimeout(() => {
              const input = document.querySelector('[data-search-input]') as HTMLInputElement | null;
              input?.focus();
            }, 100);
            break;
          case 'q':
          case 'Q':
            e.preventDefault();
            controls.toggleQueuePanel();
            break;
        }
        return;
      }

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        navigate('search');
        setTimeout(() => {
          const input = document.querySelector('[data-search-input]') as HTMLInputElement | null;
          input?.focus();
        }, 100);
        return;
      }

      if (e.key === 'Escape') {
        if (state.isQueueVisible) {
          controls.toggleQueuePanel();
        } else {
          goBack();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [controls, state.volume, state.isQueueVisible, navigate, goBack]);
}
