import { useState, useEffect } from "react";
import { throttle } from "lodash";
import { AudioManager, VolumeSettings } from "../utils/audio/AudioManager";
import { Particle } from "../types/particle";
import { PhysicsSettings } from "../constants/physics";

export const useAudioSystem = (
  disableSound: boolean,
  physicsConfig: PhysicsSettings,
  particles: Particle[],
  audioFiles: string[]
) => {
  const [audioManager] = useState(() =>
    disableSound
      ? null
      : AudioManager.getInstance({
          masterVolume: physicsConfig.MASTER_VOLUME,
          ambientVolume: physicsConfig.AMBIENT_VOLUME,
          particleVolume: physicsConfig.PARTICLE_VOLUME,
        })
  );
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Initialize audio files
  useEffect(() => {
    if (disableSound || !audioManager) return;

    const initAudio = async () => {
      await audioManager.initialize(audioFiles);
      setIsAudioLoaded(true);
    };
    initAudio();

    return () => {
      audioManager.cleanup();
      setIsAudioLoaded(false);
    };
  }, [audioManager, disableSound, audioFiles]);

  // Update volume settings when they change
  useEffect(() => {
    if (disableSound || !audioManager) return;

    const updateVolumes = throttle(
      (settings: VolumeSettings) => {
        audioManager.updateVolumeSettings(settings);
      },
      100,
      { leading: true, trailing: true }
    );

    updateVolumes({
      masterVolume: physicsConfig.MASTER_VOLUME,
      ambientVolume: physicsConfig.AMBIENT_VOLUME,
      particleVolume: physicsConfig.PARTICLE_VOLUME,
    });

    return () => {
      updateVolumes.cancel();
    };
  }, [
    audioManager,
    disableSound,
    physicsConfig.MASTER_VOLUME,
    physicsConfig.AMBIENT_VOLUME,
    physicsConfig.PARTICLE_VOLUME,
  ]);

  // Track particle sound effects
  useEffect(() => {
    if (disableSound || !audioManager) return;

    const currentParticleIds = new Set(
      particles.map((p) => p.id).filter(Boolean)
    );
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

    return () => {
      if (disableSound) {
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

        const velocityMagnitude = particle.velocity.length;
        const VELOCITY_THRESHOLD = 0.1;
        const NORMAL_VELOCITY = 200;

        if (velocityMagnitude < VELOCITY_THRESHOLD) {
          audioManager.updateSoundEffect(particle.id, {
            frequency: 0,
            volume: -100,
          });
          return;
        }

        const normalizedVelocity = Math.min(
          velocityMagnitude / NORMAL_VELOCITY,
          5
        );
        const frequency = normalizedVelocity * 4000;
        const volume = -50 + Math.min(normalizedVelocity, 1) * 20;

        audioManager.updateSoundEffect(particle.id, {
          frequency,
          volume,
        });
      });
    });
  }, [particles, audioManager, disableSound]);

  const handleAudioToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disableSound || !audioManager) return;
    e.stopPropagation();
    await audioManager.togglePlayback();
    setIsAudioPlaying(audioManager.getIsPlaying());
  };

  return {
    audioManager,
    isAudioLoaded,
    isAudioPlaying,
    setIsAudioPlaying,
    handleAudioToggle,
  };
};
