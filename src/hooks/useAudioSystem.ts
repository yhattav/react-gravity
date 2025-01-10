import { useState, useEffect, useCallback } from "react";
import { AudioManager, VolumeSettings } from "../utils/audio/AudioManager";
import { throttle } from "lodash";
import { Particle } from "../types/particle";

interface UseAudioSystemProps {
  disableSound: boolean;
  particles: Particle[];
  volumeSettings: VolumeSettings;
  audioFiles: string[];
}

interface UseAudioSystemReturn {
  isAudioLoaded: boolean;
  isAudioPlaying: boolean;
  handleAudioToggle: (e: React.MouseEvent) => Promise<void>;
  notifyFirstInteraction: () => void;
}

export const useAudioSystem = ({
  disableSound,
  particles,
  volumeSettings,
  audioFiles,
}: UseAudioSystemProps): UseAudioSystemReturn => {
  const [audioManager] = useState(() =>
    disableSound
      ? null
      : AudioManager.getInstance({
          masterVolume: volumeSettings.masterVolume,
          ambientVolume: volumeSettings.ambientVolume,
          particleVolume: volumeSettings.particleVolume,
        })
  );
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Initialize audio files
  useEffect(() => {
    if (disableSound || !audioManager) return;

    const initAudio = async () => {
      await audioManager.initialize(audioFiles);
    };
    initAudio();

    return () => {
      audioManager.cleanup();
    };
  }, [audioManager, disableSound, audioFiles]);

  // Update audio manager when volume settings change
  useEffect(() => {
    if (disableSound || !audioManager) return;

    const updateVolumes = throttle(
      (settings: VolumeSettings) => {
        audioManager.updateVolumeSettings(settings);
      },
      100,
      { leading: true, trailing: true }
    );

    updateVolumes(volumeSettings);

    return () => {
      updateVolumes.cancel();
    };
  }, [audioManager, disableSound, volumeSettings]);

  // Track particle sound effects
  useEffect(() => {
    if (disableSound || !audioManager) return;

    // Get current particle IDs
    const currentParticleIds = new Set(
      particles.map((p) => p.id).filter(Boolean)
    );

    // Get existing sound effect IDs
    const existingSoundEffectIds = new Set(
      audioManager.getActiveSoundEffectIds()
    );

    // Remove sound effects for particles that no longer exist
    existingSoundEffectIds.forEach((effectId) => {
      if (!currentParticleIds.has(effectId)) {
        audioManager.removeSoundEffect(effectId);
      }
    });

    // Add sound effects for new particles
    particles.forEach((particle) => {
      if (!particle.id) return;
      if (!existingSoundEffectIds.has(particle.id)) {
        audioManager.addParticleSoundEffect(particle.id, {
          volume: -100, // Start silent
          frequency: 0, // Start with no frequency
        });
      }
    });

    // Cleanup on unmount or when disableSound changes
    return () => {
      if (disableSound) {
        // Remove all sound effects when sound is disabled
        audioManager.getActiveSoundEffectIds().forEach((id) => {
          audioManager.removeSoundEffect(id);
        });
      }
    };
  }, [particles, audioManager, disableSound]);

  // Update sound effect parameters based on particle properties
  useEffect(() => {
    if (disableSound || !audioManager) return;

    requestAnimationFrame(() => {
      particles.forEach((particle) => {
        if (!particle.id) return;

        // Calculate velocity magnitude
        const velocityMagnitude = particle.velocity.length;

        // Define velocity thresholds
        const VELOCITY_THRESHOLD = 0.1; // Minimum velocity for sound
        const NORMAL_VELOCITY = 200; // Velocity at which noise is at 4000Hz

        if (velocityMagnitude < VELOCITY_THRESHOLD) {
          // Complete silence when nearly stationary
          audioManager.updateSoundEffect(particle.id, {
            frequency: 0,
            volume: -100,
          });
          return;
        }

        // Calculate normalized velocity ratio (0 to 1)
        const normalizedVelocity = Math.min(
          velocityMagnitude / NORMAL_VELOCITY,
          5
        );

        // Calculate noise frequency (0Hz to 8000Hz)
        // At normal velocity (ratio = 1), frequency will be 4000Hz
        const frequency = normalizedVelocity * 4000;

        // Calculate volume (-70dB to -40dB)
        // More velocity = louder, but with a soft cap
        const volume = -50 + Math.min(normalizedVelocity, 1) * 20;

        // Update sound effect parameters
        audioManager.updateSoundEffect(particle.id, {
          frequency,
          volume,
        });
      });
    });
  }, [particles, audioManager, disableSound]);

  const handleAudioToggle = useCallback(
    async (e: React.MouseEvent) => {
      if (disableSound || !audioManager) return;
      e.stopPropagation();
      await audioManager.togglePlayback();
      setIsAudioPlaying(audioManager.getIsPlaying());
    },
    [audioManager, disableSound]
  );

  const notifyFirstInteraction = useCallback(() => {
    if (disableSound || !audioManager) return;

    audioManager.notifyFirstInteraction();
    if (audioManager.getIsLoaded()) {
      setIsAudioLoaded(audioManager.getIsLoaded());
      audioManager.play();
      setIsAudioPlaying(true);
    }
  }, [audioManager, disableSound]);

  return {
    isAudioLoaded,
    isAudioPlaying,
    handleAudioToggle,
    notifyFirstInteraction,
  };
};
