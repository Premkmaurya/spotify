import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPlaylist } from '../services/api/playlist';
import { usePlayerStore } from '../store/playerStore';
import { useSocketStore } from '../store/socketStore';
import { Play, Pause, Clock, Radio, Music, Calendar } from 'lucide-react';

const SongDuration: React.FC<{ url: string }> = ({ url }) => {
  const [duration, setDuration] = React.useState<string>('--:--');

  React.useEffect(() => {
    if (!url) return;
    const audio = new Audio(url);
    const handleLoadedMetadata = () => {
      const seconds = audio.duration;
      if (!isNaN(seconds) && seconds !== Infinity) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        setDuration(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    };
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.load();
    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.pause();
      audio.src = '';
    };
  }, [url]);

  return <>{duration}</>;
};

export const PlaylistDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentSong, isPlaying, playSong, togglePlay } = usePlayerStore();
  const { emitPlay } = useSocketStore();

  const { data: playlist, isLoading, error } = useQuery({
    queryKey: ['playlist', id],
    queryFn: () => getPlaylist(id || ''),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-spotify-green border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-mist">Fetching playlist details...</p>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-white text-center">
        <Radio className="w-12 h-12 text-signal-red mb-3" />
        <p className="text-lg font-bold">Playlist Not Found</p>
        <p className="text-sm text-mist mt-1">This playlist might have been deleted or doesn't exist.</p>
      </div>
    );
  }

  const handlePlayPlaylist = () => {
    if (playlist.musics && playlist.musics.length > 0) {
      // Check if current song is already part of this playlist, then just toggle it
      const isSongInPlaylist = playlist.musics.some((s) => s._id === currentSong?._id);
      if (isSongInPlaylist) {
        togglePlay(emitPlay);
      } else {
        playSong(playlist.musics[0], playlist.musics, emitPlay);
      }
    }
  };

  const handlePlayTrack = (song: any) => {
    playSong(song, playlist.musics, emitPlay);
  };

  const isCurrentPlaylistPlaying =
    isPlaying &&
    playlist.musics &&
    playlist.musics.length > 0 &&
    playlist.musics.some((s) => s._id === currentSong?._id);

  return (
    <div className="py-4 select-none space-y-6">
      {/* Playlist Hero Header */}
      <div className="flex flex-col md:flex-row items-end gap-6 pt-4">
        {/* Cover Art */}
        <div className="w-48 h-48 md:w-56 md:h-56 bg-graphite rounded-xl shadow-2xl flex-shrink-0 flex items-center justify-center overflow-hidden relative border border-zinc-800">
          {playlist.musics?.[0]?.coverUrl ? (
            <img src={playlist.musics[0].coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <Radio className="w-16 h-16 text-zinc-500" />
          )}
        </div>

        {/* Hero Metadata */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-mist">Playlist</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight font-spotifymixuititle break-words">
            {playlist.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-white font-semibold mt-2">
            <span className="text-spotify-green hover:underline cursor-pointer">{playlist.artist}</span>
            <span className="text-mist font-normal">•</span>
            <span className="text-mist font-normal">
              {playlist.musics?.length || 0} {playlist.musics?.length === 1 ? 'song' : 'songs'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action bar */}
      <div className="flex items-center gap-4 py-4">
        {playlist.musics && playlist.musics.length > 0 && (
          <button
            onClick={handlePlayPlaylist}
            className="w-[56px] h-[56px] rounded-full bg-spotify-green text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition duration-200"
          >
            {isCurrentPlaylistPlaying ? (
              <Pause className="w-[28px] h-[28px] fill-current text-black" />
            ) : (
              <Play className="w-[28px] h-[28px] fill-current text-black ml-[2px]" />
            )}
          </button>
        )}
      </div>

      {/* Songs Table List */}
      <div>
        {playlist.musics && playlist.musics.length === 0 ? (
          <div className="text-center py-12 bg-graphite/10 rounded-xl border border-iron/40 text-mist">
            <Music className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
            <p className="font-bold text-white">This playlist is empty</p>
            <p className="text-xs text-bone mt-1">Songs will show up here once added.</p>
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-xl border border-zinc-900 bg-[#181818]/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-iron/60 text-xs text-mist font-bold uppercase tracking-wider">
                  <th className="py-[12px] px-[16px] w-[48px] text-center">#</th>
                  <th className="py-[12px] px-[16px]">Title</th>
                  <th className="py-[12px] px-[16px] hidden sm:table-cell">Artist</th>
                  <th className="py-[12px] px-[16px] hidden md:table-cell"><Calendar className="w-[16px] h-[16px]" /></th>
                  <th className="py-[12px] px-[16px] w-[64px] text-center"><Clock className="w-[16px] h-[16px]" /></th>
                </tr>
              </thead>
              <tbody>
                {playlist.musics?.map((song, idx) => {
                  const isCurrent = currentSong?._id === song._id;
                  const isCurrentTrackPlaying = isCurrent && isPlaying;
                  return (
                    <tr
                      key={song._id}
                      onClick={() => handlePlayTrack(song)}
                      className="group hover:bg-graphite/40 transition cursor-pointer text-sm"
                    >
                      {/* Play action hover */}
                      <td className="py-[14px] px-[16px] text-center font-semibold text-mist">
                        <span className="group-hover:hidden">{idx + 1}</span>
                        <button className="hidden group-hover:inline-block text-white transition hover:scale-110">
                          {isCurrentTrackPlaying ? (
                            <Pause className="w-[16px] h-[16px] fill-current text-spotify-green" />
                          ) : (
                            <Play className="w-[16px] h-[16px] fill-current ml-[1px]" />
                          )}
                        </button>
                      </td>

                      {/* Cover & Title */}
                      <td className="py-[14px] px-[16px]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-graphite rounded overflow-hidden flex-shrink-0 relative">
                            {song.coverUrl ? (
                              <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                            ) : (
                              <Music className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-semibold truncate ${isCurrent ? 'text-spotify-green' : 'text-white'}`}>
                              {song.title}
                            </p>
                            <p className="text-xs text-mist truncate sm:hidden font-normal mt-0.5">
                              {song.artist}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Artist (Desktop) */}
                      <td className="py-[14px] px-[16px] hidden sm:table-cell text-mist font-semibold">
                        {song.artist}
                      </td>

                      {/* Date Added (Desktop) */}
                      <td className="py-[14px] px-[16px] hidden md:table-cell text-mist font-normal">
                        {new Date(song.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Duration */}
                      <td className="py-[14px] px-[16px] text-center text-mist font-normal">
                        <SongDuration url={song.musicUrl} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default PlaylistDetails;
