import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getPlaylists } from '../../services/api/playlist';
import { useQuery } from '@tanstack/react-query';
import { Home, Search, Music, Library, Radio, Plus, Layers } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();

  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ['playlists'],
    queryFn: getPlaylists,
    staleTime: 30000,
  });

  return (
    <aside className="w-[280px] bg-black p-2 flex flex-col gap-2 h-full select-none text-mist font-semibold">
      {/* Navigation block */}
      <div className="bg-surface-sidebar rounded-xl p-5 flex flex-col gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white hover:text-white mb-2">
          <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center text-black shadow-md">
            <Music className="w-6 h-6 fill-current" />
          </div>
          <span className="font-spotifymixuititle text-xl font-bold tracking-tight text-white">Spotify</span>
        </Link>

        {/* Links */}
        <nav className="flex flex-col gap-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-4 py-1.5 transition duration-200 hover:text-white ${
                isActive ? 'text-white' : ''
              }`
            }
          >
            <Home className="w-6 h-6" />
            <span className="text-sm">Home</span>
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) =>
              `flex items-center gap-4 py-1.5 transition duration-200 hover:text-white ${
                isActive ? 'text-white' : ''
              }`
            }
          >
            <Search className="w-6 h-6" />
            <span className="text-sm">Search</span>
          </NavLink>

          {user?.role === 'artist' && (
            <NavLink
              to="/artist-dashboard"
              className={({ isActive }) =>
                `flex items-center gap-4 py-1.5 transition duration-200 hover:text-white ${
                  isActive ? 'text-white' : ''
                }`
              }
            >
              <Layers className="w-6 h-6 text-spotify-green" />
              <span className="text-sm text-spotify-green">Artist Dashboard</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* Library block */}
      <div className="bg-surface-sidebar rounded-xl p-5 flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Library Header */}
        <div className="flex justify-between items-center text-mist">
          <div className="flex items-center gap-3 hover:text-white transition cursor-pointer">
            <Library className="w-6 h-6" />
            <span className="text-sm">Your Library</span>
          </div>
          {user?.role === 'artist' && (
            <Link
              to="/artist-dashboard?action=create-playlist"
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-graphite hover:text-white transition"
              title="Create Playlist"
            >
              <Plus className="w-6 h-6" />
            </Link>
          )}
        </div>

        {/* Library Playlists List */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
          {isLoading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 bg-graphite rounded-md flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-graphite rounded w-3/4" />
                    <div className="h-3 bg-graphite rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-lg bg-graphite/35">
              <Radio className="w-8 h-8 text-fog mb-2" />
              <p className="text-xs text-bone mb-1 font-bold">No playlists yet</p>
              {user?.role === 'artist' ? (
                <p className="text-[11px] text-mist">Click the "+" icon above to create one.</p>
              ) : (
                <p className="text-[11px] text-mist">Playlists will show here once artists create them.</p>
              )}
            </div>
          ) : (
            playlists.map((playlist) => (
              <Link
                key={playlist._id}
                to={`/playlist/${playlist._id}`}
                className="flex items-center gap-3 p-1.5 rounded-md hover:bg-graphite transition duration-200 group"
              >
                {/* Playlist Art Icon */}
                <div className="w-12 h-12 bg-graphite rounded-md flex items-center justify-center text-mist group-hover:text-white transition flex-shrink-0 shadow-inner relative overflow-hidden">
                  {playlist.musics?.[0]?.coverUrl ? (
                    <img
                      src={playlist.musics[0].coverUrl}
                      alt={playlist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Radio className="w-6 h-6" />
                  )}
                </div>
                {/* Metadata */}
                <div className="flex-grow min-w-0">
                  <h4 className="text-sm text-white font-medium truncate group-hover:text-spotify-green transition">
                    {playlist.name}
                  </h4>
                  <p className="text-xs text-mist truncate font-normal">
                    Playlist • {playlist.artist}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
