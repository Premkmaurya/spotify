import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

interface VolumePopoverProps {
  onClose: () => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export const VolumePopover: React.FC<VolumePopoverProps> = ({
  onClose,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  triggerRef,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const activeVolume = isMuted ? 0 : volume;

  // Click outside detection (including touches for mobile screens)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      // Check if click target is inside popover or the trigger button on the bar
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick, { passive: true });
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [onClose, triggerRef]);

  // Volume icon logic based on value
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX className="w-5 h-5 text-red-400" />;
    }
    if (volume < 0.5) {
      return <Volume1 className="w-5 h-5 text-mist hover:text-white" />;
    }
    return <Volume2 className="w-5 h-5 text-mist hover:text-white" />;
  };

  return (
    <motion.div
      ref={popoverRef}
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute bottom-[84px] right-[-8px] z-50 w-[56px] bg-[#181818] border border-white/[0.08] rounded-xl p-3 flex flex-col items-center shadow-2xl select-none"
      onClick={(e) => e.stopPropagation()} // Prevent closing popover when clicking elements inside it
    >
      {/* Volume Percentage HUD */}
      <span className="text-[10px] font-bold text-white tracking-wide text-center">
        {Math.round(activeVolume * 100)}%
      </span>

      {/* Vertical Range Slider Container */}
      <div className="h-[130px] w-6 flex items-center justify-center relative my-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={activeVolume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="absolute h-[4px] w-[110px] appearance-none rounded-full cursor-pointer bg-zinc-700 outline-none -rotate-90 origin-center accent-spotify-green"
          style={{
            background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${activeVolume * 100}%, #3e3e3e ${activeVolume * 100}%, #3e3e3e 100%)`,
          }}
          aria-label="Volume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(activeVolume * 100)}
        />
      </div>

      {/* Divider */}
      <div className="w-full h-[1px] bg-white/[0.06] my-1" />

      {/* Mute toggle button inside popover */}
      <button
        onClick={onToggleMute}
        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 active:bg-white/20 transition duration-150 focus:outline-none focus:ring-1 focus:ring-spotify-green"
        aria-label={isMuted ? 'Unmute volume' : 'Mute volume'}
      >
        {getVolumeIcon()}
      </button>
    </motion.div>
  );
};
