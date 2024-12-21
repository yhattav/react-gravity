import React from "react";
import { MdMusicNote, MdMusicOff } from "react-icons/md";
import { motion } from "framer-motion";

interface MusicPlayerProps {
  isPlaying: boolean;
  isLoaded: boolean;
  onToggle: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = React.memo(
  ({ isPlaying, isLoaded, onToggle }) => {
    return (
      <motion.button
        onClick={onToggle}
        className="floating-panel floating-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isPlaying ? "Pause Music" : "Play Music"}
        disabled={!isLoaded}
        style={{ opacity: isLoaded ? 1 : 0.5 }}
      >
        {isPlaying ? <MdMusicOff size={20} /> : <MdMusicNote size={20} />}
      </motion.button>
    );
  }
);
