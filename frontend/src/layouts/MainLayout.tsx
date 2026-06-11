import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/shared/Sidebar';
import { TopNav } from '../components/shared/TopNav';
import { Player } from '../components/player/Player';
import { useSocketSync } from '../hooks/useSocketSync';

export const MainLayout: React.FC = () => {
  // Activate Socket.IO synchronization for playback and songs across devices
  useSocketSync();

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden font-spotifymixui">
      {/* Upper viewport: Sidebar + Main Content */}
      <div className="flex-1 flex min-h-0 relative">
        <Sidebar />

        <div className="flex-1 flex flex-col bg-surface-sidebar rounded-xl my-2 mr-2 overflow-hidden relative">
          <TopNav />
          {/* Scrollable Viewport for pages */}
          <main className="flex-1 overflow-y-auto px-6 pb-24">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Bottom docking player control deck */}
      <Player />
    </div>
  );
};
