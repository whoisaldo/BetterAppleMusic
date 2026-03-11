import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { MusicKitInstance } from '@renderer/types/musickit';

export type MusicKitStatus = 'idle' | 'loading' | 'authorized' | 'unauthorized' | 'error';

interface MusicKitContextValue {
  mk: MusicKitInstance | null;
  status: MusicKitStatus;
  error: string | null;
  storefront: string;
  authorize: () => Promise<void>;
  unauthorize: () => Promise<void>;
}

const MusicKitCtx = createContext<MusicKitContextValue>({
  mk: null,
  status: 'idle',
  error: null,
  storefront: 'us',
  authorize: async () => {},
  unauthorize: async () => {},
});

export function useMusicKitContext() {
  return useContext(MusicKitCtx);
}

export function MusicKitProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<MusicKitStatus>('idle');
  const [mk, setMk] = useState<MusicKitInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [storefront, setStorefront] = useState('us');
  const mkRef = useRef<MusicKitInstance | null>(null);

  useEffect(() => {
    let cancelled = false;
    let authUnsub: (() => void) | undefined;

    async function init() {
      setStatus('loading');

      let attempts = 0;
      while (!window.MusicKit && attempts < 30) {
        await new Promise((r) => setTimeout(r, 300));
        attempts++;
      }

      if (!window.MusicKit) {
        setError('MusicKit JS failed to load from Apple CDN');
        setStatus('error');
        return;
      }

      const result = await window.electronAPI!.getDeveloperToken();
      if (!result.success || !result.token) {
        setError(result.error || 'Failed to get developer token');
        setStatus('error');
        return;
      }

      try {
        const instance = await (window.MusicKit as {
          configure: (opts: unknown) => Promise<MusicKitInstance>;
        }).configure({
          developerToken: result.token,
          app: { name: 'BetterAppleMusic', build: '1.0.0', id: 'media.com.betterAppleMusic' },
        });

        if (cancelled) return;

        mkRef.current = instance;
        setMk(instance);

        if (instance.storefrontId) {
          setStorefront(instance.storefrontId);
        }

        if (instance.isAuthorized) {
          setStatus('authorized');
          detectStorefront(instance);
        } else {
          setStatus('unauthorized');
        }

        const handler = () => {
          if (cancelled) return;
          setStatus(instance.isAuthorized ? 'authorized' : 'unauthorized');
          if (instance.isAuthorized) detectStorefront(instance);
        };
        instance.addEventListener('authorizationStatusDidChange', handler);
        authUnsub = () => instance.removeEventListener('authorizationStatusDidChange', handler);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'MusicKit configuration failed');
          setStatus('error');
        }
      }
    }

    async function detectStorefront(instance: MusicKitInstance) {
      try {
        const resp = await instance.api.music('/v1/me/storefront');
        const data = resp.data as { data?: Array<{ id: string }> };
        if (data.data?.[0]?.id) {
          setStorefront(data.data[0].id);
        }
      } catch {
        // Fall back to default
      }
    }

    init();
    return () => {
      cancelled = true;
      authUnsub?.();
    };
  }, []);

  const authorize = useCallback(async () => {
    const instance = mkRef.current;
    if (!instance) return;
    try {
      await instance.authorize();
      setStatus('authorized');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('cancelled') && !msg.includes('canceled')) {
        setError(msg);
        setStatus('error');
      }
    }
  }, []);

  const unauthorize = useCallback(async () => {
    const instance = mkRef.current;
    if (!instance) return;
    await instance.unauthorize();
    setStatus('unauthorized');
  }, []);

  return (
    <MusicKitCtx.Provider value={{ mk, status, error, storefront, authorize, unauthorize }}>
      {children}
    </MusicKitCtx.Provider>
  );
}
