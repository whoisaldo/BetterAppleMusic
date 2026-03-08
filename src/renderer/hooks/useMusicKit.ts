import { useState, useEffect, useRef } from 'react';

export type MusicKitStatus = 'idle' | 'loading' | 'authorized' | 'unauthorized' | 'error';

export interface MusicKitHook {
  status: MusicKitStatus;
  musicKit: unknown | null;
  error: string | null;
  authorize: () => Promise<void>;
  unauthorize: () => Promise<void>;
}

interface MKInstance {
  isAuthorized?: boolean;
  authorize: () => Promise<string>;
  unauthorize: () => Promise<void>;
  addEventListener: (ev: string, fn: () => void) => void;
  removeEventListener: (ev: string, fn: () => void) => void;
}

export function useMusicKit(): MusicKitHook {
  const [status, setStatus] = useState<MusicKitStatus>('idle');
  const [musicKit, setMusicKit] = useState<unknown | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mkRef = useRef<MKInstance | null>(null);

  useEffect(() => {
    let cancelled = false;
    let authUnsubscribe: (() => void) | undefined;

    async function init() {
      setStatus('loading');

      // Wait for MusicKit JS to load from CDN
      let attempts = 0;
      while (!window.MusicKit && attempts < 30) {
        await new Promise((res) => setTimeout(res, 300));
        attempts++;
      }

      if (!window.MusicKit) {
        setError('MusicKit JS failed to load from Apple CDN');
        setStatus('error');
        return;
      }

      // Get developer token from main process
      const result = await window.electronAPI!.getDeveloperToken();
      if (!result.success || !result.token) {
        setError(result.error || 'Failed to get developer token');
        setStatus('error');
        return;
      }

      try {
        const mk = await (window.MusicKit as { configure: (opts: unknown) => Promise<MKInstance> }).configure({
          developerToken: result.token,
          app: {
            name: 'BetterAppleMusic',
            build: '1.0.0',
            id: 'media.com.betterAppleMusic',
          },
        });

        if (cancelled) return;

        mkRef.current = mk;
        setMusicKit(mk);

        // Check if already authorized from a previous session (MusicKit persists token in localStorage)
        if (mk.isAuthorized) {
          console.log('[MusicKit] Already authorized from previous session');
          setStatus('authorized');
        } else {
          setStatus('unauthorized');
        }

        // Listen for auth state changes (triggered by popup postMessage callback)
        const handler = () => {
          if (cancelled) return;
          console.log('[MusicKit] authorizationStatusDidChange, isAuthorized:', mk.isAuthorized);
          setStatus(mk.isAuthorized ? 'authorized' : 'unauthorized');
        };
        mk.addEventListener('authorizationStatusDidChange', handler);
        authUnsubscribe = () => mk.removeEventListener('authorizationStatusDidChange', handler);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'MusicKit configuration failed');
          setStatus('error');
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      authUnsubscribe?.();
    };
  }, []);

  const authorize = async () => {
    const mk = mkRef.current;
    if (!mk || typeof mk.authorize !== 'function') return;
    try {
      // MusicKit.authorize() opens the Apple OAuth popup and resolves with the music user token
      const userToken = await mk.authorize();
      console.log('[MusicKit] authorize() resolved, token length:', userToken?.length ?? 0);
      setStatus('authorized');
    } catch (err: unknown) {
      console.error('[MusicKit] authorize() error:', err);
      // Don't set error status if user simply closed the popup
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('cancelled') && !msg.includes('canceled')) {
        setError(msg);
        setStatus('error');
      }
    }
  };

  const unauthorize = async () => {
    const mk = mkRef.current;
    if (!mk || typeof mk.unauthorize !== 'function') return;
    await mk.unauthorize();
    setStatus('unauthorized');
  };

  return { status, musicKit, error, authorize, unauthorize };
}
