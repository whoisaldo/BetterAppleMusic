import React from 'react';

interface AlbumCardProps {
  title: string;
  artist: string;
  artwork?: string;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ title, artist, artwork }) => {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-apple-elevated mb-3 shadow-lg">
        {artwork ? (
          <img src={artwork} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-apple-secondary">
            ♪
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <button className="w-12 h-12 rounded-full bg-apple-red/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100">
            ▶
          </button>
        </div>
      </div>
      <h4 className="text-sm font-medium truncate">{title}</h4>
      <p className="text-xs text-apple-secondary truncate">{artist}</p>
    </div>
  );
};

export default AlbumCard;
