import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Track } from '@renderer/context/PlayerContext';
import { usePlayer } from '@renderer/context/PlayerContext';
import { useNavigation } from '@renderer/context/NavigationContext';

interface ContextMenuProps {
  track: Track;
  x: number;
  y: number;
  onClose: () => void;
}

export function ContextMenu({ track, x, y, onClose }: ContextMenuProps) {
  const { controls } = usePlayer();
  const { navigate } = useNavigation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const newX = x + rect.width > window.innerWidth ? x - rect.width : x;
      const newY = y + rect.height > window.innerHeight ? y - rect.height : y;
      setPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
    }
  }, [x, y]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const items = [
    {
      label: 'Play Next',
      icon: (
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
      ),
      action: () => {
        controls.addToQueue(track);
        onClose();
      },
    },
    {
      label: 'Add to Queue',
      icon: (
        <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
      ),
      action: () => {
        controls.addToQueue(track);
        onClose();
      },
    },
    { type: 'divider' as const },
    {
      label: 'Go to Album',
      icon: (
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zm0-9c-3.59 0-6.5 2.91-6.5 6.5h2c0-2.49 2.01-4.5 4.5-4.5s4.5 2.01 4.5 4.5h2c0-3.59-2.91-6.5-6.5-6.5z" />
      ),
      action: () => {
        if (track.albumId) navigate('album', { id: track.albumId });
        onClose();
      },
    },
    {
      label: 'Go to Artist',
      icon: (
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      ),
      action: () => {
        if (track.artistId) navigate('artist', { id: track.artistId });
        onClose();
      },
    },
  ];

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[180px] bg-surface-elevated/95 backdrop-blur-xl border border-white/[0.08] rounded-lg shadow-2xl shadow-black/60 py-1 animate-fade-in"
      style={{ left: position.x, top: position.y }}
    >
      {items.map((item, i) => {
        if ('type' in item && item.type === 'divider') {
          return <div key={i} className="h-px bg-white/[0.06] my-1" />;
        }
        const menuItem = item as { label: string; icon: React.ReactNode; action: () => void };
        return (
          <button
            key={i}
            onClick={menuItem.action}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/80 hover:bg-white/[0.08] transition-colors text-left"
          >
            <svg className="w-4 h-4 text-white/40 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              {menuItem.icon}
            </svg>
            {menuItem.label}
          </button>
        );
      })}
    </div>,
    document.body,
  );
}

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{ track: Track; x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, track: Track) => {
    e.preventDefault();
    setContextMenu({ track, x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu(null);

  const ContextMenuPortal = contextMenu ? (
    <ContextMenu
      track={contextMenu.track}
      x={contextMenu.x}
      y={contextMenu.y}
      onClose={closeContextMenu}
    />
  ) : null;

  return { handleContextMenu, ContextMenuPortal };
}
