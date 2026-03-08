import React from 'react';

const NowPlaying: React.FC = () => {
  return (
    <div className="h-20 bg-apple-surface/90 backdrop-blur-xl border-t border-apple-border flex items-center px-5 gap-4">
      {/* Track Info */}
      <div className="flex items-center gap-3 w-64">
        <div className="w-12 h-12 rounded-lg bg-apple-elevated flex items-center justify-center text-apple-secondary">
          ♪
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">No Track Playing</span>
          <span className="text-xs text-apple-secondary truncate">Artist</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex-1 flex flex-col items-center gap-1">
        <div className="flex items-center gap-4">
          <button className="text-apple-secondary hover:text-apple-text transition-colors text-lg">
            ⏮
          </button>
          <button className="w-10 h-10 rounded-full bg-apple-text text-apple-bg flex items-center justify-center hover:scale-105 transition-transform">
            ▶
          </button>
          <button className="text-apple-secondary hover:text-apple-text transition-colors text-lg">
            ⏭
          </button>
        </div>
        <div className="flex items-center gap-2 w-full max-w-md">
          <span className="text-xs text-apple-secondary w-8 text-right">0:00</span>
          <div className="flex-1 h-1 bg-apple-elevated rounded-full overflow-hidden">
            <div className="h-full w-0 bg-apple-red rounded-full" />
          </div>
          <span className="text-xs text-apple-secondary w-8">0:00</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-2 w-32">
        <span className="text-apple-secondary text-sm">🔊</span>
        <div className="flex-1 h-1 bg-apple-elevated rounded-full overflow-hidden">
          <div className="h-full w-2/3 bg-apple-text/50 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;
