import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import { useSocketStore } from '../../store/socketStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const Player: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    togglePlay,
    nextSong,
    prevSong,
    setVolume,
    toggleMute,
    seek,
    toggleShuffle,
    toggleRepeat
  } = usePlayerStore();

  const { emitPlay, connected } = useSocketStore();
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // Sync range slider with progress when not actively dragging
  useEffect(() => {
    if (!isSeeking) {
      setSliderValue(progress);
    }
  }, [progress, isSeeking]);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSeeking(true);
    setSliderValue(parseFloat(e.target.value));
  };

  const handleSeekMouseUp = () => {
    setIsSeeking(false);
    seek(sliderValue, emitPlay);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === null) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong) {
    return (
      <footer className="h-[90px] bg-[#121212] border-t border-zinc-900 px-4 flex items-center justify-between text-mist text-xs select-none">
        <div className="flex items-center gap-3 w-1/3">
          <div className="w-14 h-14 bg-graphite rounded-md flex items-center justify-center">
            <Radio className="w-6 h-6 text-zinc-600" />
          </div>
          <div>
            <p className="text-white font-medium">Select a song to start listening</p>
            <p className="text-[10px] text-fog">Playlists & songs await</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 w-1/3">
          <div className="flex items-center gap-5">
            <button disabled className="text-zinc-700 cursor-not-allowed"><Shuffle className="w-5 h-5" /></button>
            <button disabled className="text-zinc-700 cursor-not-allowed"><SkipBack className="w-6 h-6" /></button>
            <button disabled className="w-11 h-11 rounded-full bg-zinc-800 text-zinc-600 flex items-center justify-center cursor-not-allowed"><Play className="w-5 h-5 fill-current" /></button>
            <button disabled className="text-zinc-700 cursor-not-allowed"><SkipForward className="w-6 h-6" /></button>
            <button disabled className="text-zinc-700 cursor-not-allowed"><Repeat className="w-5 h-5" /></button>
          </div>
          <div className="w-full max-w-md flex items-center gap-2 text-[10px] text-zinc-600">
            <span>0:00</span>
            <div className="flex-1 h-1 bg-zinc-800 rounded-full" />
            <span>0:00</span>
          </div>
        </div>
        <div className="w-1/3 flex justify-end items-center gap-4">
          <div className="flex items-center gap-2 bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
            {connected ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-spotify-green" />
                <span className="text-[10px] text-spotify-green">Live Sync Active</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
                <span className="text-[10px] text-fog">Sync Offline</span>
              </>
            )}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="h-[90px] bg-[#121212] border-t border-[#282828] px-4 flex items-center justify-between select-none">
      {/* Left section: Song metadata */}
      <div className="flex items-center gap-3 w-1/3 min-w-0">
        <div className="w-14 h-14 bg-graphite rounded-md flex-shrink-0 relative group shadow-lg overflow-hidden">
          {currentSong.coverUrl ? (
            <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
          ) : (
            <Radio className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-400" />
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm text-white font-medium truncate hover:underline cursor-pointer">
            {currentSong.title}
          </h4>
          <p className="text-xs text-mist truncate hover:underline cursor-pointer font-normal">
            {currentSong.artist}
          </p>
        </div>
      </div>

      {/* Middle section: Playback controls */}
      <div className="flex flex-col items-center gap-2 w-1/3 max-w-2xl">
        <div className="flex items-center gap-5">
          <button
            onClick={toggleShuffle}
            className={`transition ${isShuffle ? 'text-[#1DB954] hover:text-[#1ed760]' : 'text-mist hover:text-white'}`}
          >
            <Shuffle className="w-5 h-5" />
          </button>
          <button
            onClick={() => prevSong(emitPlay)}
            className="text-mist hover:text-white transition hover:scale-105 active:scale-95"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>
          <button
            onClick={() => togglePlay(emitPlay)}
            className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center transition hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current text-black" />
            ) : (
              <Play className="w-5 h-5 fill-current text-black ml-0.5" />
            )}
          </button>
          <button
            onClick={() => nextSong(emitPlay)}
            className="text-mist hover:text-white transition hover:scale-105 active:scale-95"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
          <button
            onClick={toggleRepeat}
            className={`transition relative ${isRepeat !== 'none' ? 'text-[#1DB954] hover:text-[#1ed760]' : 'text-mist hover:text-white'}`}
          >
            <Repeat className="w-5 h-5" />
            {isRepeat === 'one' && (
              <span className="absolute -top-1.5 -right-1 text-[8px] bg-[#1DB954] text-black font-bold px-1 rounded-full scale-75">
                1
              </span>
            )}
          </button>
        </div>

        {/* Progress Bar scrubber */}
        <div className="w-full flex items-center gap-2.5 text-xs text-mist font-normal">
          <span>{formatTime(sliderValue)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={sliderValue}
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            onTouchEnd={handleSeekMouseUp}
            className="flex-1 h-[4px] rounded-full appearance-none cursor-pointer bg-zinc-700 accent-spotify-green hover:accent-spotify-green outline-none"
            style={{
              background: `linear-gradient(to right, #1ed760 0%, #1ed760 ${(sliderValue / (duration || 100)) * 100}%, #3e3e3e ${(sliderValue / (duration || 100)) * 100}%, #3e3e3e 100%)`
            }}
          />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right section: Volume & Sync details */}
      <div className="w-1/3 flex justify-end items-center gap-4">
        {/* Connection status badge */}
        <div className="flex items-center gap-2 bg-[#1f1f1f] border border-zinc-800/80 px-3 py-1 rounded-full shadow-inner">
          {connected ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-spotify-green" />
              <span className="text-[10px] text-spotify-green font-bold">Synced</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
              <span className="text-[10px] text-fog">Offline</span>
            </>
          )}
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMute} className="text-mist hover:text-white transition">
            {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-[120px] h-[4px] rounded-full appearance-none cursor-pointer bg-zinc-700 accent-white outline-none"
            style={{
              background: `linear-gradient(to right, #ffffff 0%, #ffffff ${(isMuted ? 0 : volume) * 100}%, #3e3e3e ${(isMuted ? 0 : volume) * 100}%, #3e3e3e 100%)`
            }}
          />
        </div>
      </div>
    </footer>
  );
};
