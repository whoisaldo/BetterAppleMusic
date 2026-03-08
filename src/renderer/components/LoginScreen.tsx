import React from 'react';

interface Props {
  onLogin: () => void;
  status: string;
  error: string | null;
}

export function LoginScreen({ onLogin, status, error }: Props) {
  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full bg-pink-600/20 blur-[120px]" />
      <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px]" />

      {/* Draggable title bar area */}
      <div className="absolute top-0 left-0 right-0 h-8 drag-region" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-2xl glow-pink">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>

        <div className="text-center">
          <h1 className="text-white text-4xl font-bold tracking-tight">BetterAppleMusic</h1>
          <p className="text-white/40 text-sm mt-2">A modern Apple Music experience</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-5 py-3 rounded-xl max-w-sm text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={onLogin}
          disabled={status === 'loading'}
          className="group relative bg-white hover:bg-white/90 text-black font-semibold px-10 py-3.5 rounded-full flex items-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-white/10 hover:shadow-white/20 hover:scale-105 active:scale-95"
        >
          {status === 'loading' ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          )}
          <span>{status === 'loading' ? 'Connecting...' : 'Sign in with Apple'}</span>
        </button>

        <p className="text-white/20 text-xs">Requires an active Apple Music subscription</p>
      </div>
    </div>
  );
}
