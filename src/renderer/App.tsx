import React from 'react';
import { useMusicKit } from './hooks/useMusicKit';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { NowPlayingBar } from './components/NowPlayingBar';
import { LoginScreen } from './components/LoginScreen';
import { SearchBar } from './components/SearchBar';

export default function App() {
  const { status, musicKit, error, authorize, unauthorize } = useMusicKit();
  const [player, controls] = useAudioPlayer(musicKit);

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
      <div className="h-9 bg-[#0a0a0a] flex items-center justify-between px-4 drag-region flex-shrink-0 border-b border-white/[0.04]">
        <div className="flex items-center gap-2 no-drag">
          <div
            className="w-3 h-3 rounded-full bg-white/10 hover:bg-[#FF5F57] transition-colors cursor-pointer"
            onClick={() => window.electronAPI?.close()}
          />
          <div
            className="w-3 h-3 rounded-full bg-white/10 hover:bg-[#FDBC40] transition-colors cursor-pointer"
            onClick={() => window.electronAPI?.minimize()}
          />
          <div
            className="w-3 h-3 rounded-full bg-white/10 hover:bg-[#33C748] transition-colors cursor-pointer"
            onClick={() => window.electronAPI?.maximize()}
          />
        </div>
        <span className="text-white/15 text-[11px] font-medium tracking-wide">BetterAppleMusic</span>
        <button
          type="button"
          onClick={unauthorize}
          className="text-white/15 hover:text-white/40 text-[11px] transition-colors no-drag"
        >
          Sign out
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-[220px] bg-[#0a0a0a] border-r border-white/[0.04] flex flex-col py-2 px-2 flex-shrink-0">
          <div className="px-3 py-3 mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <span className="text-white/50 text-[11px] font-bold uppercase tracking-widest">BAM</span>
            </div>
          </div>

          <NavItem icon="search" label="Search" active />
          <NavItem icon="home" label="Home" />
          <NavItem icon="library" label="Library" />

          <div className="mt-6 px-3 mb-1">
            <p className="text-white/15 text-[10px] font-bold uppercase tracking-[0.15em]">
              Your Library
            </p>
          </div>
          <NavItem icon="heart" label="Liked Songs" />
          <NavItem icon="clock" label="Recently Played" />
          <NavItem icon="list" label="Playlists" />

          {/* Now playing artwork (large) in sidebar */}
          {player.currentTrack?.artworkUrl && (
            <div className="mt-auto px-3 pb-3">
              <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/60">
                <img
                  src={player.currentTrack.artworkUrl.replace(/\d+x\d+/, '300x300')}
                  alt=""
                  className="w-full aspect-square object-cover"
                />
              </div>
              <div className="mt-2 px-1">
                <p className="text-white/70 text-[12px] font-medium truncate">
                  {player.currentTrack.name}
                </p>
                <p className="text-white/30 text-[10px] truncate">
                  {player.currentTrack.artistName}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 bg-gradient-to-b from-[#1a1a2e]/80 via-[#0f0f15] to-[#0a0a0a] overflow-hidden flex flex-col">
          <SearchBar
            musicKit={musicKit}
            onPlayTrack={controls.playTrack}
            currentTrackId={player.currentTrack?.id}
            isPlaying={player.isPlaying}
          />
        </div>
      </div>

      {/* Now Playing Bar */}
      <NowPlayingBar player={player} controls={controls} />
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
      className={`flex items-center gap-3 px-3 py-[7px] rounded-lg text-left transition-all text-[13px] ${
        active
          ? 'bg-white/[0.08] text-white font-medium'
          : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0">
        {icons[icon]}
      </svg>
      <span>{label}</span>
    </button>
  );
}
