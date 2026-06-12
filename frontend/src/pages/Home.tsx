import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllSongs } from '../services/api/music';
import { getPlaylists } from '../services/api/playlist';
import { usePlayerStore } from '../store/playerStore';
import { useSocketStore } from '../store/socketStore';
import { Play, Pause, Music, Radio, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const { emitPlay, emitPause } = useSocketStore();

  const { data: songs = [], isLoading: isLoadingSongs } = useQuery({
    queryKey: ['songs'],
    queryFn: getAllSongs,
    staleTime: 30000,
  });

  const { data: playlists = [], isLoading: isLoadingPlaylists } = useQuery({
    queryKey: ['playlists'],
    queryFn: getPlaylists,
    staleTime: 30000,
  });

  const handlePlaySong = (song: any) => {
    if (currentSong?._id === song._id) {
      togglePlay(emitPlay, emitPause);
    } else {
      playSong(song, songs, emitPlay);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 py-4 select-none">
      {/* Greeting Header */}
      <h1 className="text-3xl font-bold text-white tracking-tight font-spotifymixuititle mt-2">
        {getGreeting()}
      </h1>

      {/* Hero Promotional Banner */}
      <div className="promo-banner rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg">
        {/* Subtle glass effect layout overlay */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
        
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black bg-white px-2 py-0.5 rounded-full w-max">
            <Sparkles className="w-3 h-3 fill-current" />
            Spotlight
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white font-spotifymixuititle tracking-tight">
            Synchronized Soundwaves
          </h2>
          <p className="text-sm text-white/95 font-medium leading-relaxed">
            Experience real-time playback synchronization. Play a song on this tab, and watch all your other devices update instantly. Create playlists or switch roles to share your own music.
          </p>
        </div>

        {songs.length > 0 && (
          <button
            onClick={() => handlePlaySong(songs[0])}
            className="relative z-10 px-6 py-3 bg-white text-black font-bold rounded-full shadow-xl transition duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 self-start md:self-auto text-sm"
          >
            {isPlaying && currentSong?._id === songs[0]._id ? (
              <>
                <Pause className="w-4 h-4 fill-current" /> Pause Preview
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current ml-0.5" /> Play Spotlight
              </>
            )}
          </button>
        )}
      </div>

      {/* Grid Quick List */}
      <section className="space-y-6">
        <h3 className="text-[32px] font-bold text-white tracking-tight font-spotifymixuititle">
          Jump Back In
        </h3>

        {isLoadingSongs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[90px] bg-[#181818] rounded-[12px] animate-pulse" />
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="text-mist py-8 text-center bg-[#181818] rounded-[12px] border border-zinc-850">
            <p className="font-semibold text-white">No songs available yet</p>
            <p className="text-xs text-[#B3B3B3] mt-1">Check back later or sign up as an artist to upload songs!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {songs.slice(0, 6).map((song, idx) => {
              const isCurrent = currentSong?._id === song._id;
              const isCurrentPlaying = isCurrent && isPlaying;
              
              // Last played helper times
              const getLastPlayedText = (index: number) => {
                const times = ['2h ago', '5h ago', 'Yesterday', '2 days ago', '4 days ago', 'Last week'];
                return `Played ${times[index % times.length]}`;
              };

              return (
                <div
                  key={song._id}
                  className="group relative flex items-center h-[90px] min-h-[90px] bg-[#181818] hover:bg-[#282828] rounded-[12px] p-3 transition-all duration-[250ms] ease-in-out hover:-translate-y-1 hover:scale-[1.02] shadow-lg border border-zinc-900/30 cursor-pointer select-none"
                  onClick={() => handlePlaySong(song)}
                >
                  {/* Song Cover Art */}
                  <div className="w-[64px] h-[64px] rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800 transition duration-[250ms] group-hover:brightness-110 relative">
                    {song.coverUrl ? (
                      <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-500" />
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0 ml-4 pr-16 flex flex-col justify-center">
                    <h4 className={`text-[16px] font-bold truncate ${isCurrent ? 'text-[#1DB954]' : 'text-white'}`}>
                      {song.title}
                    </h4>
                    <p className="text-[14px] text-[#B3B3B3] truncate mt-0.5">{song.artist}</p>
                    <p className="text-[12px] text-[#8A8A8A] truncate mt-0.5">{getLastPlayedText(idx)}</p>
                  </div>

                  {/* Play Button Overlay (Absolutely positioned on the right) */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-[250ms] z-10 flex-shrink-0">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySong(song);
                      }}
                      className="w-10 h-10 rounded-full p-3 bg-[#1DB954] hover:bg-[#1ed760] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-lg transition duration-200"
                    >
                      {isCurrentPlaying ? (
                        <Pause className="w-5 h-5 fill-current text-black" />
                      ) : (
                        <Play className="w-5 h-5 fill-current text-black" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Playlists */}
      <section className="space-y-6">
        <h3 className="text-[32px] font-bold text-white tracking-tight font-spotifymixuititle">
          Featured Playlists
        </h3>

        {isLoadingPlaylists ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-[4/5] bg-[#181818] rounded-[12px] animate-pulse" />
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-mist py-8 text-center bg-[#181818] rounded-[12px] border border-zinc-850">
            <p className="font-semibold text-white">No playlists found</p>
            <p className="text-xs text-[#B3B3B3] mt-1">Playlists created by artists will show up here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {playlists.map((playlist) => (
              <Link
                key={playlist._id}
                to={`/playlist/${playlist._id}`}
                className="bg-[#181818] hover:bg-[#282828] p-4 rounded-[12px] transition-all duration-[250ms] ease-in-out hover:-translate-y-1 hover:scale-[1.02] group shadow-lg border border-zinc-900/10 cursor-pointer flex flex-col gap-3"
              >
                {/* Artwork */}
                <div className="w-full aspect-square bg-zinc-800 rounded-lg shadow-md relative overflow-hidden flex items-center justify-center">
                  {playlist.musics?.[0]?.coverUrl ? (
                    <img
                      src={playlist.musics[0].coverUrl}
                      alt={playlist.name}
                      className="w-full h-full object-cover transition duration-[250ms] group-hover:brightness-110"
                    />
                  ) : (
                    <Radio className="w-12 h-12 text-zinc-500" />
                  )}

                  {/* Play Button Overlay */}
                  {playlist.musics && playlist.musics.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Find if current playlist song is playing
                        const isCurrentInPlaylist = playlist.musics.some((s) => s._id === currentSong?._id);
                        if (isCurrentInPlaylist) {
                          togglePlay(emitPlay, emitPause);
                        } else {
                          playSong(playlist.musics[0], playlist.musics, emitPlay);
                        }
                      }}
                      className="absolute bottom-3 right-3 w-10 h-10 p-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black flex items-center justify-center shadow-lg opacity-100 md:opacity-0 translate-y-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition duration-[250ms] hover:scale-105"
                    >
                      {isPlaying && playlist.musics.some((s) => s._id === currentSong?._id) ? (
                        <Pause className="w-5 h-5 fill-current text-black" />
                      ) : (
                        <Play className="w-5 h-5 fill-current text-black" />
                      )}
                    </button>
                  )}
                </div>
                
                {/* Meta */}
                <div className="space-y-1 min-w-0">
                  <h4 className="text-[16px] font-bold text-white truncate group-hover:text-[#1DB954] transition duration-150">
                    {playlist.name}
                  </h4>
                  <p className="text-[14px] text-[#B3B3B3] truncate font-normal">
                    Curated by {playlist.artist}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
export default Home;
