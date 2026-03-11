import React, { createContext, useContext, useState, useCallback } from 'react';

export type ViewType =
  | 'home'
  | 'search'
  | 'library'
  | 'album'
  | 'playlist'
  | 'artist'
  | 'now-playing'
  | 'liked-songs'
  | 'recently-played';

interface HistoryEntry {
  view: ViewType;
  params: Record<string, string>;
}

interface NavigationContextValue {
  currentView: ViewType;
  viewParams: Record<string, string>;
  history: HistoryEntry[];
  navigate: (view: ViewType, params?: Record<string, string>) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const NavigationCtx = createContext<NavigationContextValue>({
  currentView: 'home',
  viewParams: {},
  history: [],
  navigate: () => {},
  goBack: () => {},
  canGoBack: false,
});

export function useNavigation() {
  return useContext(NavigationCtx);
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>([{ view: 'home', params: {} }]);
  const [index, setIndex] = useState(0);

  const current = history[index];

  const navigate = useCallback((view: ViewType, params: Record<string, string> = {}) => {
    setHistory((prev) => {
      const next = prev.slice(0, index + 1);
      next.push({ view, params });
      return next;
    });
    setIndex((i) => i + 1);
  }, [index]);

  const goBack = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1);
    }
  }, [index]);

  return (
    <NavigationCtx.Provider
      value={{
        currentView: current.view,
        viewParams: current.params,
        history,
        navigate,
        goBack,
        canGoBack: index > 0,
      }}
    >
      {children}
    </NavigationCtx.Provider>
  );
}
