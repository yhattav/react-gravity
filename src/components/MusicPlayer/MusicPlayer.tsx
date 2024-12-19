import React, { useEffect, useState, useRef, useCallback } from "react";
import * as Tone from "tone";
import { BsMusicNote, BsMusicNoteBeamed } from "react-icons/bs";
import { motion } from "framer-motion";

interface MusicPlayerProps {
  audioFiles: string[];
}

export const MusicPlayer: React.FC<MusicPlayerProps> = React.memo(
  ({ audioFiles }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const playerRef = useRef<Tone.Player | null>(null);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

    const initializePlayer = useCallback(async () => {
      // Check if we have valid audio files
      if (!audioFiles || audioFiles.length === 0) {
        console.error("No audio files provided");
        return;
      }

      // Check if the current track index is valid
      if (currentTrackIndex >= audioFiles.length) {
        console.error("Invalid track index");
        return;
      }

      // Check if we already have a player
      if (playerRef.current) {
        console.log("Player already exists, cleaning up...");
        playerRef.current.stop();
        playerRef.current.dispose();
        playerRef.current = null;
      }

      console.log("Initializing player...");
      try {
        const currentFile = audioFiles[currentTrackIndex];
        console.log("Loading buffer from URL:", currentFile);

        // Verify the file URL is valid
        try {
          const response = await fetch(currentFile, { method: "HEAD" });
          if (!response.ok) {
            throw new Error(
              `File not accessible: ${response.status} ${response.statusText}`
            );
          }
          console.log("File is accessible");
        } catch (error) {
          console.error("File accessibility check failed:", error);
          return;
        }

        // Create player first
        console.log("Creating new player...");
        const newPlayer = new Tone.Player({
          url: currentFile,
          loop: true,
          autostart: false,
          volume: -12,
          onload: () => {
            console.log("Audio loaded successfully");
            setIsLoaded(true);
          },
        }).toDestination();

        playerRef.current = newPlayer;
      } catch (error) {
        console.error("Error in player initialization:", error);
        setIsLoaded(false);
      }
    }, [audioFiles, currentTrackIndex]);

    useEffect(() => {
      initializePlayer();

      return () => {
        if (playerRef.current) {
          console.log("Cleaning up player...");
          playerRef.current.stop();
          playerRef.current.dispose();
          playerRef.current = null;
          setIsLoaded(false);
        }
      };
    }, [initializePlayer]);

    const togglePlayback = useCallback(async () => {
      if (!playerRef.current || !isLoaded) {
        console.log("Player not ready:", {
          current: playerRef.current,
          isLoaded,
          audioFiles: audioFiles.length,
        });
        return;
      }

      try {
        if (isPlaying) {
          console.log("Stopping playback");
          playerRef.current.stop();
          console.log("Player stopped, state:", playerRef.current.state);
        } else {
          console.log("Starting playback");
          await playerRef.current.start();
          console.log("Player started, state:", playerRef.current.state);
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error("Error toggling playback:", error);
      }
    }, [isPlaying, isLoaded, audioFiles.length]);

    const handleClick = useCallback(async () => {
      try {
        // Only start Tone.js context when user clicks
        if (Tone.context.state !== "running") {
          console.log("Starting Tone.js context on click...");
          await Tone.start();
          console.log("Tone.js context started:", Tone.context.state);
        }
        await togglePlayback();
      } catch (error) {
        console.error("Error handling click:", error);
      }
    }, [togglePlayback]);

    return (
      <motion.button
        onClick={handleClick}
        className="floating-panel floating-button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title={isPlaying ? "Pause Music" : "Play Music"}
        disabled={!isLoaded}
        style={{ opacity: isLoaded ? 1 : 0.5 }}
      >
        {isPlaying ? (
          <BsMusicNoteBeamed size={20} />
        ) : (
          <BsMusicNote size={20} />
        )}
      </motion.button>
    );
  }
);
