import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllSongs } from '../services/api/music';
import { getPlaylists } from '../services/api/playlist';
import { usePlayerStore } from '../store/playerStore';
import { useSocketStore } from '../store/socketStore';
import { useSearchStore } from '../store/searchStore';
import { Play, Pause, Music, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Search: React.FC = () => {
  const { query } = useSearchStore();
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const { emitPlay } = useSocketStore();

  const { data: songs = [], isLoading: isLoadingSongs } = useQuery({
    queryKey: ['songs'],
    queryFn: getAllSongs,
  });

  const { data: playlists = [], isLoading: isLoadingPlaylists } = useQuery({
    queryKey: ['playlists'],
    queryFn: getPlaylists,
  });

  const handlePlaySong = (song: any, list: any[]) => {
    if (currentSong?._id === song._id) {
      togglePlay(emitPlay);
    } else {
      playSong(song, list, emitPlay);
    }
  };

  // Filter songs & playlists
  const displaySongs = query.trim()
    ? songs.filter(
        (song) =>
          song.title.toLowerCase().includes(query.toLowerCase()) ||
          song.artist.toLowerCase().includes(query.toLowerCase())
      )
    : songs.slice(0, 10); // Limit to 10 songs when query is empty

  const displayPlaylists = query.trim()
    ? playlists.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.artist.toLowerCase().includes(query.toLowerCase())
      )
    : playlists.slice(0, 5); // Limit to 5 playlists (1 row) when query is empty

  return (
    <div className="py-4 select-none">
      <div className="space-y-8 animate-fadeIn">
        {/* Songs Section */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white font-spotifymixuititle tracking-tight">
            {query.trim() ? 'Songs' : 'All Songs'}
          </h3>

          {isLoadingSongs ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-graphite/40 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : displaySongs.length === 0 ? (
            <p className="text-sm text-mist">No matching songs found.</p>
          ) : (
            <div className="bg-[#181818]/60 rounded-xl border border-zinc-900/60 p-2 overflow-hidden">
              {displaySongs.map((song, idx) => {
                const isCurrent = currentSong?._id === song._id;
                return (
                  <div
                    key={song._id}
                    onClick={() => handlePlaySong(song, displaySongs)}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-graphite/50 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Index or Play button */}
                      <div className="w-8 flex items-center justify-center text-sm font-semibold text-mist">
                        <span className="group-hover:hidden">{idx + 1}</span>
                        <button className="hidden group-hover:flex text-white">
                          {isPlaying && isCurrent ? (
                            <Pause className="w-4 h-4 fill-current text-spotify-green" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>

                      {/* Cover image */}
                      <div className="w-10 h-10 bg-graphite rounded flex-shrink-0 overflow-hidden relative">
                        {song.coverUrl ? (
                          <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                        ) : (
                          <Music className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-500" />
                        )}
                      </div>

                      {/* Title / Artist */}
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isCurrent ? 'text-spotify-green' : 'text-white'}`}>
                          {song.title}
                        </p>
                        <p className="text-xs text-mist truncate font-normal mt-0.5">{song.artist}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Playlists Section */}
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white font-spotifymixuititle tracking-tight">
            {query.trim() ? 'Playlists' : 'All Playlists'}
          </h3>

          {isLoadingPlaylists ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-60 bg-graphite/30 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : displayPlaylists.length === 0 ? (
            <p className="text-sm text-mist">No matching playlists found.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {displayPlaylists.map((playlist) => (
                <Link
                  key={playlist._id}
                  to={`/playlist/${playlist._id}`}
                  className="bg-graphite/20 hover:bg-graphite/50 p-4 rounded-xl transition duration-300 group shadow-md border border-zinc-900/10 flex flex-col gap-3"
                >
                  <div className="aspect-square bg-graphite rounded-lg shadow-md relative overflow-hidden flex items-center justify-center">
                    {playlist.musics?.[0]?.coverUrl ? (
                      <img
                        src={playlist.musics[0].coverUrl}
                        alt={playlist.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                      />
                    ) : (
                      <Radio className="w-12 h-12 text-zinc-500" />
                    )}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-spotify-green transition">
                      {playlist.name}
                    </h4>
                    <p className="text-xs text-mist truncate font-normal">By {playlist.artist}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
export default Search;
