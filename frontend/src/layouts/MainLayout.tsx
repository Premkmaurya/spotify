import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from '../components/shared/Sidebar';
import { TopNav } from '../components/shared/TopNav';
import { Player } from '../components/player/Player';
import { useSocketSync } from '../hooks/useSocketSync';
import { useAuthStore } from '../store/authStore';
import { Home, Search, Layers } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { user } = useAuthStore();
  // Activate Socket.IO synchronization for playback and songs across devices
  useSocketSync();

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden font-spotifymixui">
      {/* Upper viewport: Sidebar + Main Content */}
      <div className="flex-1 flex min-h-0 relative">
        <Sidebar />

        <div className="flex-1 flex flex-col bg-surface-sidebar md:rounded-xl md:my-2 md:mr-2 m-0 rounded-none overflow-hidden relative">
          <TopNav />
          {/* Scrollable Viewport for pages */}
          <main className="flex-1 overflow-y-auto px-4 md:px-6 pb-[140px] md:pb-24">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Bottom docking player control deck */}
      <Player />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="flex md:hidden h-[60px] bg-black border-t border-zinc-900 justify-around items-center select-none z-40 text-mist flex-shrink-0">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 transition ${
              isActive ? 'text-white' : 'text-mist hover:text-white'
            }`
          }
        >
          <Home className="w-[20px] h-[20px]" />
          <span className="text-[10px] font-bold">Home</span>
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 transition ${
              isActive ? 'text-white' : 'text-mist hover:text-white'
            }`
          }
        >
          <Search className="w-[20px] h-[20px]" />
          <span className="text-[10px] font-bold">Search</span>
        </NavLink>

        {user?.role === 'artist' && (
          <NavLink
            to="/artist-dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition ${
                isActive ? 'text-spotify-green' : 'text-mist hover:text-white'
              }`
            }
          >
            <Layers className="w-[20px] h-[20px]" />
            <span className="text-[10px] font-bold">Studio</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
};
