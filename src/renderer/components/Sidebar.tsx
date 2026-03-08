import React from 'react';

interface NavItem {
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Listen Now', icon: '▶' },
  { label: 'Browse', icon: '◉' },
  { label: 'Radio', icon: '📡' },
  { label: 'Search', icon: '🔍' },
];

const libraryItems: NavItem[] = [
  { label: 'Recently Added', icon: '🕐' },
  { label: 'Artists', icon: '🎤' },
  { label: 'Albums', icon: '💿' },
  { label: 'Songs', icon: '🎵' },
  { label: 'Playlists', icon: '📋' },
];

const Sidebar: React.FC = () => {
  const [active, setActive] = React.useState('Listen Now');

  return (
    <aside className="w-56 bg-apple-surface/50 backdrop-blur-xl border-r border-apple-border flex flex-col overflow-y-auto">
      <nav className="p-3 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActive(item.label)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left
              ${active === item.label
                ? 'bg-apple-red/20 text-apple-red'
                : 'text-apple-text hover:bg-apple-elevated/50'
              }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 pt-4 pb-2">
        <h3 className="text-xs font-semibold text-apple-secondary uppercase tracking-wider px-3">
          Library
        </h3>
      </div>

      <nav className="px-3 flex flex-col gap-1">
        {libraryItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActive(item.label)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left
              ${active === item.label
                ? 'bg-apple-red/20 text-apple-red'
                : 'text-apple-text hover:bg-apple-elevated/50'
              }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
