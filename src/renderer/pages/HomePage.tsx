import React from 'react';
import AlbumCard from '../components/AlbumCard';

const placeholderAlbums = [
  { title: 'Midnights', artist: 'Taylor Swift' },
  { title: 'SOS', artist: 'SZA' },
  { title: 'Utopia', artist: 'Travis Scott' },
  { title: 'Guts', artist: 'Olivia Rodrigo' },
  { title: '1989 (TV)', artist: 'Taylor Swift' },
  { title: 'Stick Season', artist: 'Noah Kahan' },
];

const HomePage: React.FC = () => {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-1">Listen Now</h1>
        <p className="text-apple-secondary mb-6">Your music, your way.</p>

        <div className="glass-panel p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-apple-red to-apple-pink flex items-center justify-center text-5xl shadow-2xl">
              ♪
            </div>
            <div>
              <p className="text-apple-secondary text-sm uppercase tracking-wider mb-1">Featured</p>
              <h2 className="text-2xl font-bold mb-2">Welcome to Better Apple Music</h2>
              <p className="text-apple-secondary text-sm max-w-md">
                Connect your Apple Music account to start listening to your favorite tracks,
                discover new music, and enjoy a beautiful listening experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Top Albums</h2>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {placeholderAlbums.map((album) => (
            <AlbumCard key={album.title} title={album.title} artist={album.artist} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Recently Played</h2>
        <div className="glass-panel p-4">
          <p className="text-apple-secondary text-sm text-center py-8">
            No listening history yet. Start playing music to see your recent tracks here.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
