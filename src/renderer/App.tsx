import React from 'react';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import NowPlaying from './components/NowPlaying';
import HomePage from './pages/HomePage';

const App: React.FC = () => {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <HomePage />
        </main>
      </div>
      <NowPlaying />
    </div>
  );
};

export default App;
