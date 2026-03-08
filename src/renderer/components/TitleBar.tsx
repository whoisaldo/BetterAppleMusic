import React, { useEffect, useState } from 'react';

const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    api.isMaximized().then(setIsMaximized).catch(() => {});

    const unsub = api.on('window:state-changed', (state: unknown) => {
      const s = state as { isMaximized?: boolean };
      if (s.isMaximized !== undefined) setIsMaximized(s.isMaximized);
    });

    return () => unsub();
  }, []);

  return (
    <div className="h-10 bg-apple-surface/90 backdrop-blur-xl flex items-center justify-between px-4 border-b border-apple-border"
         style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
      <div className="flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          onClick={() => window.electronAPI?.close()}
          className="w-3 h-3 rounded-full bg-[#FF5F57] hover:brightness-90 transition-all"
          aria-label="Close"
        />
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:brightness-90 transition-all"
          aria-label="Minimize"
        />
        <button
          onClick={() => window.electronAPI?.maximize()}
          className="w-3 h-3 rounded-full bg-[#28C840] hover:brightness-90 transition-all"
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
        />
      </div>
      <span className="text-sm text-apple-secondary font-medium">Better Apple Music</span>
      <div className="w-16" />
    </div>
  );
};

export default TitleBar;
