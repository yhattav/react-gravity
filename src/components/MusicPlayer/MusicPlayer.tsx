import React, { useEffect, useState, useRef, useCallback } from "react";
import * as Tone from "tone";
import { BsMusicNote, BsMusicNoteBeamed } from "react-icons/bs";
import { motion } from "framer-motion";

interface MusicPlayerProps {
  audioFiles: string[];
  shouldPlay?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = React.memo(
  ({ audioFiles, shouldPlay = false }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const playerRef = useRef<Tone.Player | null>(null);
    const currentTrackIndex = 0; // Simplified to always play first track for now
    const hasStartedRef = useRef(false);
    const initialStartDoneRef = useRef(false);

    const startPlayback = useCallback(async () => {
      if (!playerRef.current || !isLoaded) return;

      try {
        if (Tone.context.state !== "running") {
          await Tone.start();
        }

        if (!hasStartedRef.current) {
          // First time playing, use start()
          await playerRef.current.start();
          hasStartedRef.current = true;
        } else {
          // Resume from where it was paused
          playerRef.current.playbackRate = 1;
        }

        setIsPlaying(true);
        console.log("Music playback started/resumed");
      } catch (error) {
        console.error("Error starting/resuming music:", error);
      }
    }, [isLoaded]);

    const pausePlayback = useCallback(async () => {
      if (!playerRef.current || !isLoaded) return;

      try {
        // Pause by setting playback rate to 0 (maintains position)
        playerRef.current.playbackRate = 0;
        setIsPlaying(false);
        console.log("Music playback paused");
      } catch (error) {
        console.error("Error pausing music:", error);
      }
    }, [isLoaded]);

    // Handle initial shouldPlay trigger only
    useEffect(() => {
      if (shouldPlay && !initialStartDoneRef.current && isLoaded) {
        startPlayback();
        initialStartDoneRef.current = true;
      }
    }, [shouldPlay, isLoaded, startPlayback]);

    const initializePlayer = useCallback(async () => {
      if (!audioFiles || audioFiles.length === 0) {
        console.error("No audio files provided");
        return;
      }

      if (playerRef.current) {
        console.log("Player already exists, cleaning up...");
        playerRef.current.stop();
        playerRef.current.dispose();
        playerRef.current = null;
        hasStartedRef.current = false;
      }

      console.log("Initializing music player...");
      try {
        const currentFile = audioFiles[currentTrackIndex];
        console.log("Loading music from:", currentFile);

        try {
          const response = await fetch(currentFile, { method: "HEAD" });
          if (!response.ok) {
            throw new Error(
              `Music file not accessible: ${response.status} ${response.statusText}`
            );
          }
          console.log("Music file is accessible");
        } catch (error) {
          console.error("Music file accessibility check failed:", error);
          return;
        }

        console.log("Creating music player...");
        const newPlayer = new Tone.Player({
          url: currentFile,
          loop: true,
          autostart: false,
          volume: -12,
          onload: () => {
            console.log("Music loaded successfully");
            setIsLoaded(true);
          },
        }).toDestination();

        playerRef.current = newPlayer;
      } catch (error) {
        console.error("Error initializing music player:", error);
        setIsLoaded(false);
      }
    }, [audioFiles, currentTrackIndex]);

    useEffect(() => {
      initializePlayer();

      return () => {
        if (playerRef.current) {
          console.log("Cleaning up music player...");
          playerRef.current.stop();
          playerRef.current.dispose();
          playerRef.current = null;
          setIsLoaded(false);
          hasStartedRef.current = false;
          initialStartDoneRef.current = false;
        }
      };
    }, [initializePlayer]);

    const togglePlayback = useCallback(async () => {
      if (!playerRef.current || !isLoaded) {
        console.log("Music player not ready:", {
          current: playerRef.current,
          isLoaded,
        });
        return;
      }

      if (isPlaying) {
        await pausePlayback();
      } else {
        await startPlayback();
      }
    }, [isPlaying, isLoaded, startPlayback, pausePlayback]);

    return (
      <motion.button
        onClick={togglePlayback}
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
