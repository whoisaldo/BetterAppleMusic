import React from 'react';
import { MusicKitProvider, useMusicKitContext } from './context/MusicKitContext';
import { PlayerProvider } from './context/PlayerContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { TitleBar } from './components/layout/TitleBar';
import { Sidebar } from './components/layout/Sidebar';
import { NowPlayingBar } from './components/layout/NowPlayingBar';
import { QueuePanel } from './components/queue/QueuePanel';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoginScreen } from './components/LoginScreen';
import { useIpcMedia } from './hooks/useIpcMedia';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useMediaSession } from './hooks/useMediaSession';

import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { LibraryPage } from './pages/LibraryPage';
import { AlbumPage } from './pages/AlbumPage';
import { PlaylistPage } from './pages/PlaylistPage';
import { ArtistPage } from './pages/ArtistPage';
import { NowPlayingPage } from './pages/NowPlayingPage';
import { RecentlyPlayedPage } from './pages/RecentlyPlayedPage';

export default function App() {
  return (
    <MusicKitProvider>
      <AppGate />
    </MusicKitProvider>
  );
}

function AppGate() {
  const { status, error, authorize } = useMusicKitContext();

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="h-screen w-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/10 border-t-accent rounded-full animate-spin" />
          <p className="text-white/30 text-sm">Connecting to Apple Music...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthorized' || status === 'error') {
    return <LoginScreen onLogin={authorize} status={status} error={error} />;
  }

  return (
    <PlayerProvider>
      <NavigationProvider>
        <MainApp />
      </NavigationProvider>
    </PlayerProvider>
  );
}

function MainApp() {
  useIpcMedia();
  useKeyboardShortcuts();
  useMediaSession();

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden bg-gradient-to-b from-[#141418] to-surface">
          <ErrorBoundary>
            <MainContent />
          </ErrorBoundary>
        </main>
        <QueuePanel />
      </div>
      <NowPlayingBar />
    </div>
  );
}

function MainContent() {
  const { currentView } = useNavigation();

  switch (currentView) {
    case 'home':
      return <HomePage />;
    case 'search':
      return <SearchPage />;
    case 'library':
      return <LibraryPage />;
    case 'album':
      return <AlbumPage />;
    case 'playlist':
      return <PlaylistPage />;
    case 'artist':
      return <ArtistPage />;
    case 'now-playing':
      return <NowPlayingPage />;
    case 'recently-played':
      return <RecentlyPlayedPage />;
    default:
      return <HomePage />;
  }
}
