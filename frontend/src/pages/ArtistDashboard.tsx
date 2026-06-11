import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getAllSongs, addSong, updateSong, deleteSong } from '../services/api/music';
import { createPlaylist } from '../services/api/playlist';
import { toast } from 'sonner';
import {
  Upload,
  Plus,
  Trash2,
  Edit2,
  Disc,
  ListMusic,
  Check,
  FileAudio,
  FileImage,
  X,
  Music
} from 'lucide-react';

export const ArtistDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const showToast = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  // Form states - Add Song
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState(user?.username || '');
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Form states - Create Playlist
  const [playlistName, setPlaylistName] = useState('');
  const [playlistArtist, setPlaylistArtist] = useState(user?.username || '');
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);

  // Editing states - Update Song Modal
  const [editingSong, setEditingSong] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [editMusicFile, setEditMusicFile] = useState<File | null>(null);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);

  // Fetch all songs
  const { data: songs = [], isLoading: isLoadingSongs } = useQuery({
    queryKey: ['songs'],
    queryFn: getAllSongs,
  });

  // Filter artist's own songs
  const artistSongs = songs.filter((song) => song.artistId === user?.id);

  // Mutations
  const uploadSongMutation = useMutation({
    mutationFn: addSong,
    onSuccess: () => {
      showToast('Song uploaded successfully!', 'success');
      setSongTitle('');
      setMusicFile(null);
      setCoverFile(null);
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to upload song.', 'error');
    },
  });

  const updateSongMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => updateSong(id, formData),
    onSuccess: () => {
      showToast('Song updated successfully!', 'success');
      setEditingSong(null);
      setEditMusicFile(null);
      setEditCoverFile(null);
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to update song.', 'error');
    },
  });

  const deleteSongMutation = useMutation({
    mutationFn: deleteSong,
    onSuccess: () => {
      showToast('Song deleted successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['songs'] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to delete song.', 'error');
    },
  });

  const createPlaylistMutation = useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => {
      showToast('Playlist created successfully!', 'success');
      setPlaylistName('');
      setSelectedSongs([]);
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || 'Failed to create playlist.', 'error');
    },
  });

  // Handlers
  const handleUploadSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim() || !songArtist.trim() || !musicFile) {
      showToast('Title, artist, and audio file are required.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', songTitle);
    formData.append('artist', songArtist);
    formData.append('music', musicFile);
    if (coverFile) {
      formData.append('cover', coverFile);
    }

    uploadSongMutation.mutate(formData);
  };

  const handleUpdateSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong) return;

    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('artist', editArtist);
    if (editMusicFile) {
      formData.append('music', editMusicFile);
    }
    if (editCoverFile) {
      formData.append('cover', editCoverFile);
    }

    updateSongMutation.mutate({ id: editingSong._id, formData });
  };

  const handleDeleteSong = (id: string) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      deleteSongMutation.mutate(id);
    }
  };

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim() || !playlistArtist.trim() || selectedSongs.length === 0) {
      showToast('Playlist name, artist, and at least one song selection are required.', 'error');
      return;
    }

    createPlaylistMutation.mutate({
      name: playlistName,
      artist: playlistArtist,
      musics: selectedSongs,
    });
  };

  const handleSelectSong = (songId: string) => {
    setSelectedSongs((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  };

  const openEditModal = (song: any) => {
    setEditingSong(song);
    setEditTitle(song.title);
    setEditArtist(song.artist);
  };

  return (
    <div className="py-4 space-y-8 select-none relative text-white">


      {/* Header */}
      <div className="border-b border-iron/40 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight font-spotifymixuititle flex items-center gap-2">
          <Disc className="w-8 h-8 text-spotify-green animate-spin-slow" /> Artist Studio
        </h1>
        <p className="text-sm text-mist mt-1">Manage your songs, upload audio files, and curate playlists.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Upload Song */}
        <section className="bg-graphite/20 border border-zinc-900 rounded-xl p-6 flex flex-col gap-5">
          <h2 className="text-xl font-bold flex items-center gap-2 font-spotifymixuititle">
            <Upload className="w-5 h-5 text-spotify-green" /> Upload New Song
          </h2>

          <form onSubmit={handleUploadSong} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bone mb-2">Song Title</label>
              <input
                type="text"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                placeholder="Track title"
                className="w-full h-11 px-4 rounded-md bg-graphite border border-iron focus:border-zinc-500 focus:outline-none text-sm placeholder-zinc-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bone mb-2">Artist Name</label>
              <input
                type="text"
                value={songArtist}
                onChange={(e) => setSongArtist(e.target.value)}
                placeholder="Artist name"
                className="w-full h-11 px-4 rounded-md bg-graphite border border-iron focus:border-zinc-500 focus:outline-none text-sm placeholder-zinc-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Music File Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-bone mb-2">Audio File (Music)</label>
                <div className="relative h-[96px] border-2 border-dashed border-iron rounded-lg bg-graphite/40 hover:bg-graphite/60 transition flex flex-col items-center justify-center p-[12px] text-center cursor-pointer">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setMusicFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {musicFile ? (
                    <>
                      <FileAudio className="w-[24px] h-[24px] text-spotify-green mb-[4px]" />
                      <span className="text-[11px] font-bold text-white truncate max-w-full px-[8px]">
                        {musicFile.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-[24px] h-[24px] text-mist mb-[4px]" />
                      <span className="text-[10px] text-mist font-semibold">Select Audio</span>
                    </>
                  )}
                </div>
              </div>

              {/* Cover File Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-bone mb-2">Cover Art (Optional)</label>
                <div className="relative h-[96px] border-2 border-dashed border-iron rounded-lg bg-graphite/40 hover:bg-graphite/60 transition flex flex-col items-center justify-center p-[12px] text-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {coverFile ? (
                    <>
                      <FileImage className="w-[24px] h-[24px] text-spotify-green mb-[4px]" />
                      <span className="text-[11px] font-bold text-white truncate max-w-full px-[8px]">
                        {coverFile.name}
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-[24px] h-[24px] text-mist mb-[4px]" />
                      <span className="text-[10px] text-mist font-semibold">Select Cover Image</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploadSongMutation.isPending}
              className="w-full h-11 bg-spotify-green hover:bg-[#1fdf64] text-black font-bold rounded-full shadow-md hover:scale-[1.01] active:scale-99 transition flex items-center justify-center gap-2 mt-4 text-xs uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
            >
              {uploadSongMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Upload Track'
              )}
            </button>
          </form>
        </section>

        {/* Right Column: Create Playlist */}
        <section className="bg-graphite/20 border border-zinc-900 rounded-xl p-6 flex flex-col gap-5">
          <h2 className="text-xl font-bold flex items-center gap-2 font-spotifymixuititle">
            <Plus className="w-5 h-5 text-spotify-green" /> Create Playlist
          </h2>

          <form onSubmit={handleCreatePlaylist} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bone mb-2">Playlist Name</label>
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="E.g. Summer Hits"
                className="w-full h-11 px-4 rounded-md bg-graphite border border-iron focus:border-zinc-500 focus:outline-none text-sm placeholder-zinc-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bone mb-2">Curator Name</label>
              <input
                type="text"
                value={playlistArtist}
                onChange={(e) => setPlaylistArtist(e.target.value)}
                placeholder="Curator name"
                className="w-full h-11 px-4 rounded-md bg-graphite border border-iron focus:border-zinc-500 focus:outline-none text-sm placeholder-zinc-500 font-medium"
              />
            </div>

            {/* Selectable songs */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-bone mb-2">Select Tracks</label>
              <div className="h-[128px] overflow-y-auto border border-iron bg-graphite/35 rounded-md p-[8px] flex flex-col gap-[4px] pr-[4px]">
                {isLoadingSongs ? (
                  <p className="text-xs text-mist p-[8px]">Loading songs...</p>
                ) : artistSongs.length === 0 ? (
                  <p className="text-xs text-mist p-[8px]">Upload tracks first to pack them in playlists.</p>
                ) : (
                  artistSongs.map((song) => {
                    const isChecked = selectedSongs.includes(song._id);
                    return (
                      <div
                        key={song._id}
                        onClick={() => handleSelectSong(song._id)}
                        className={`flex items-center gap-[12px] p-[8px] rounded cursor-pointer transition ${
                          isChecked ? 'bg-spotify-green/10 text-white' : 'hover:bg-graphite/60 text-mist'
                        }`}
                      >
                        <div className={`w-[16px] h-[16px] rounded border flex items-center justify-center flex-shrink-0 ${
                          isChecked ? 'border-spotify-green bg-spotify-green text-black' : 'border-iron'
                        }`}>
                          {isChecked && <Check className="w-[12px] h-[12px] text-black stroke-[3px]" />}
                        </div>
                        <span className="text-xs font-bold truncate">{song.title}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={createPlaylistMutation.isPending}
              className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-bold rounded-full shadow-md hover:scale-[1.01] active:scale-99 transition flex items-center justify-center gap-2 mt-4 text-xs uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
            >
              {createPlaylistMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Create Playlist'
              )}
            </button>
          </form>
        </section>
      </div>

      {/* Catalog Grid Section: List of Songs */}
      <section className="bg-graphite/10 border border-zinc-900/50 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 font-spotifymixuititle">
          <ListMusic className="w-5 h-5 text-spotify-green" /> My Track Catalog ({artistSongs.length})
        </h2>

        {isLoadingSongs ? (
          <div className="space-y-2 py-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-graphite/40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : artistSongs.length === 0 ? (
          <div className="text-center py-8 text-mist border border-dashed border-iron rounded-lg">
            <Music className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
            <p className="font-semibold text-white">No tracks uploaded yet</p>
            <p className="text-xs text-bone">Fill out the form above to release your first song!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-iron text-xs text-mist font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Art</th>
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-4">Artist</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {artistSongs.map((song) => (
                  <tr key={song._id} className="border-b border-iron/20 hover:bg-graphite/20 transition text-sm">
                    {/* Artwork */}
                    <td className="py-2.5 px-4">
                      <div className="w-10 h-10 bg-graphite rounded overflow-hidden relative shadow-inner">
                        {song.coverUrl ? (
                          <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                        ) : (
                          <Music className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-500" />
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-2.5 px-4 font-bold text-white truncate max-w-[150px]">
                      {song.title}
                    </td>

                    {/* Artist */}
                    <td className="py-2.5 px-4 text-mist font-semibold truncate max-w-[120px]">
                      {song.artist}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(song)}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-zinc-800/60 hover:bg-zinc-700 text-gray-300 hover:text-[#1DB954] transition duration-200 hover:scale-105 active:scale-95"
                        title="Edit Track"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSong(song._id)}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-zinc-800/60 hover:bg-[#331111] text-gray-300 hover:text-red-400 transition duration-200 hover:scale-105 active:scale-95"
                        title="Delete Track"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Edit Modal (Popup) */}
      {editingSong && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-carbon border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl flex flex-col gap-4 animate-scaleUp">
            <button
              onClick={() => setEditingSong(null)}
              className="absolute top-4 right-4 text-mist hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-spotifymixuititle border-b border-iron/40 pb-2">
              Edit Song: {editingSong.title}
            </h3>

            <form onSubmit={handleUpdateSong} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-bone mb-2">Track Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-11 px-4 rounded-md bg-graphite border border-iron focus:border-zinc-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-bone mb-2">Artist Name</label>
                <input
                  type="text"
                  value={editArtist}
                  onChange={(e) => setEditArtist(e.target.value)}
                  className="w-full h-11 px-4 rounded-md bg-graphite border border-iron focus:border-zinc-500 focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-[16px]">
                {/* Audio File */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-bone mb-2">Replace Audio</label>
                  <div className="relative h-[64px] border border-dashed border-iron rounded-md bg-graphite/40 flex flex-col items-center justify-center text-center cursor-pointer p-[8px]">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setEditMusicFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {editMusicFile ? (
                      <span className="text-[10px] font-bold text-spotify-green truncate px-[4px]">{editMusicFile.name}</span>
                    ) : (
                      <span className="text-[10px] text-mist font-semibold">Select Audio</span>
                    )}
                  </div>
                </div>

                {/* Cover File */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-bone mb-2">Replace Cover</label>
                  <div className="relative h-[64px] border border-dashed border-iron rounded-md bg-graphite/40 flex flex-col items-center justify-center text-center cursor-pointer p-[8px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditCoverFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {editCoverFile ? (
                      <span className="text-[10px] font-bold text-spotify-green truncate px-[4px]">{editCoverFile.name}</span>
                    ) : (
                      <span className="text-[10px] text-mist font-semibold">Select Image</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-iron/40 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingSong(null)}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 font-bold rounded-full text-xs uppercase tracking-wider transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateSongMutation.isPending}
                  className="px-5 py-2.5 bg-spotify-green hover:bg-[#1fdf64] text-black font-bold rounded-full text-xs uppercase tracking-wider transition disabled:opacity-50"
                >
                  {updateSongMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ArtistDashboard;
