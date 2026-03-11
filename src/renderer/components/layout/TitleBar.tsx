import React, { useEffect, useState } from 'react';
import { useNavigation } from '@renderer/context/NavigationContext';

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const { goBack, canGoBack } = useNavigation();

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    api.isMaximized().then(setIsMaximized).catch(() => {});

    const unsub = api.on('window:state-changed', (raw: unknown) => {
      const s = raw as { isMaximized?: boolean };
      if (s.isMaximized !== undefined) setIsMaximized(s.isMaximized);
    });

    return () => unsub();
  }, []);

  return (
    <div
      className="h-8 bg-surface flex items-center justify-between px-3 drag-region flex-shrink-0 border-b border-white/[0.04]"
    >
      <div className="flex items-center gap-2 no-drag">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          className="w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all disabled:opacity-20 disabled:cursor-default"
          aria-label="Go back"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
        <span className="text-white/20 text-[11px] font-medium tracking-wide">BetterAppleMusic</span>
      </div>

      <div className="flex items-center no-drag">
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="w-12 h-8 flex items-center justify-center text-white/50 hover:bg-white/[0.06] transition-colors"
          aria-label="Minimize"
        >
          <svg className="w-[10px] h-[10px]" viewBox="0 0 10 1">
            <rect width="10" height="1" fill="currentColor" />
          </svg>
        </button>
        <button
          onClick={() => window.electronAPI?.maximize()}
          className="w-12 h-8 flex items-center justify-center text-white/50 hover:bg-white/[0.06] transition-colors"
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            <svg className="w-[10px] h-[10px]" viewBox="0 0 10 10">
              <path d="M2 0v2H0v8h8V8h2V0H2zm6 9H1V3h7v6zm1-2V1H3v1h5v5h1z" fill="currentColor" />
            </svg>
          ) : (
            <svg className="w-[10px] h-[10px]" viewBox="0 0 10 10">
              <rect x="0" y="0" width="10" height="10" stroke="currentColor" fill="none" strokeWidth="1" />
            </svg>
          )}
        </button>
        <button
          onClick={() => window.electronAPI?.close()}
          className="w-12 h-8 flex items-center justify-center text-white/50 hover:bg-[#e81123] hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-[10px] h-[10px]" viewBox="0 0 10 10">
            <path d="M1 0L0 1l4 4-4 4 1 1 4-4 4 4 1-1-4-4 4-4-1-1-4 4z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
