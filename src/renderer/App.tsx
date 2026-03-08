import React, { useRef, useCallback } from 'react';
import { useMusicKit } from './hooks/useMusicKit';
import { useNowPlaying } from './hooks/useNowPlaying';
import { NowPlayingBar } from './components/NowPlayingBar';
import { LoginScreen } from './components/LoginScreen';
import { SearchBar } from './components/SearchBar';

export default function App() {
  const { status, musicKit, error, authorize, unauthorize } = useMusicKit();
  const nowPlaying = useNowPlaying(musicKit);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const mk = musicKit as {
    play?: () => Promise<void>;
    pause?: () => Promise<void>;
    skipToNextItem?: () => Promise<void>;
    skipToPreviousItem?: () => Promise<void>;
  } | null;

  async function handlePlay() {
    try { await mk?.play?.(); } catch (e) { console.error(e); }
  }
  async function handlePause() {
    try { await mk?.pause?.(); } catch (e) { console.error(e); }
  }
  async function handleNext() {
    try { await mk?.skipToNextItem?.(); } catch (e) { console.error(e); }
  }
  async function handlePrevious() {
    try { await mk?.skipToPreviousItem?.(); } catch (e) { console.error(e); }
  }

  const handlePlayPreview = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play().catch(console.error);
  }, []);

  // Loading state
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/10 border-t-pink-500 rounded-full animate-spin" />
          <p className="text-white/30 text-sm">Connecting to Apple Music...</p>
        </div>
      </div>
    );
  }

  // Auth required
  if (status === 'unauthorized' || status === 'error') {
    return <LoginScreen onLogin={authorize} status={status} error={error} />;
  }

  // Main app
  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* Title bar */}
      <div className="h-8 bg-[#0a0a0a] flex items-center justify-between px-4 drag-region flex-shrink-0 border-b border-white/5">
        <div className="flex items-center gap-2 no-drag">
          <div className="w-3 h-3 rounded-full bg-white/10 hover:bg-red-500 transition-colors cursor-pointer"
               onClick={() => window.electronAPI?.close()} />
          <div className="w-3 h-3 rounded-full bg-white/10 hover:bg-yellow-500 transition-colors cursor-pointer"
               onClick={() => window.electronAPI?.minimize()} />
          <div className="w-3 h-3 rounded-full bg-white/10 hover:bg-green-500 transition-colors cursor-pointer"
               onClick={() => window.electronAPI?.maximize()} />
        </div>
        <span className="text-white/20 text-[11px] font-medium">BetterAppleMusic</span>
        <button
          type="button"
          onClick={unauthorize}
          className="text-white/20 hover:text-white/50 text-[11px] transition-colors no-drag"
        >
          Sign out
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-3 gap-1 flex-shrink-0">
          <div className="px-3 py-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <span className="text-white/70 text-xs font-semibold">BetterAppleMusic</span>
            </div>
          </div>

          <NavItem icon="search" label="Search" active />
          <NavItem icon="home" label="Home" />
          <NavItem icon="library" label="Library" />

          <div className="mt-6 px-3">
            <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest mb-2">
              Your Library
            </p>
          </div>
          <NavItem icon="heart" label="Liked Songs" />
          <NavItem icon="clock" label="Recently Played" />
          <NavItem icon="list" label="Playlists" />
        </div>

        {/* Content */}
        <div className="flex-1 bg-gradient-to-b from-[#1a1a2e] to-[#0a0a0a] overflow-hidden flex flex-col">
          <SearchBar musicKit={musicKit} onPlayPreview={handlePlayPreview} />
        </div>
      </div>

      {/* Now Playing Bar */}
      <NowPlayingBar
        nowPlaying={nowPlaying}
        onPlay={handlePlay}
        onPause={handlePause}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </div>
  );
}

function NavItem({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  const icons: Record<string, React.ReactNode> = {
    search: <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>,
    home: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>,
    library: <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>,
    heart: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>,
    clock: <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>,
    list: <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>,
  };

  return (
    <button
      type="button"
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm ${
        active
          ? 'bg-white/10 text-white font-medium'
          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        {icons[icon]}
      </svg>
      <span>{label}</span>
    </button>
  );
}
