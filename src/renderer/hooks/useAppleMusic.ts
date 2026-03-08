import { useState, useCallback } from 'react';
import { appleMusicApi } from '../services/appleMusicApi';

interface UseAppleMusicOptions {
  developerToken?: string;
  userToken?: string;
}

export function useAppleMusic(options: UseAppleMusicOptions = {}) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authorize = useCallback(async (devToken: string, musicUserToken: string) => {
    try {
      setIsLoading(true);
      setError(null);
      appleMusicApi.setTokens(devToken, musicUserToken);
      setIsAuthorized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authorization failed');
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const search = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      return await appleMusicApi.search(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isAuthorized,
    isLoading,
    error,
    authorize,
    search,
  };
}
