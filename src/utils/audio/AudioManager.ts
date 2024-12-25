import * as Tone from "tone";

interface ParticleSoundEffect {
  noise: Tone.Noise;
  filter: Tone.Filter;
  particleId: string;
}

interface SoundEffectParams {
  frequency?: number;
  volume?: number;
}

export interface VolumeSettings {
  masterVolume: number;
  ambientVolume: number;
  particleVolume: number;
}

export class AudioManager {
  private static instance: AudioManager;
  private player: Tone.Player | null = null;
  private isLoaded: boolean = false;
  private isPlaying: boolean = false;
  private hasStarted: boolean = false;
  private currentTrackIndex: number = 0;
  private audioFiles: string[] = [];
  private soundEffects: Map<string, ParticleSoundEffect> = new Map();
  private firstInteractionPromise: Promise<void>;
  private firstInteractionResolve!: () => void;
  private volumeSettings: VolumeSettings;

  private constructor(initialVolumeSettings: VolumeSettings) {
    this.firstInteractionPromise = new Promise((resolve) => {
      this.firstInteractionResolve = resolve;
    });
    this.volumeSettings = initialVolumeSettings;
  }

  public static getInstance(
    initialVolumeSettings?: VolumeSettings
  ): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager(
        initialVolumeSettings || {
          masterVolume: 0.5,
          ambientVolume: 0.5,
          particleVolume: 0.5,
        }
      );
    }
    return AudioManager.instance;
  }

  private calcVolume(baseVolume: number, volumeValue: number): number {
    // Convert 0-1 range to -1 to 1 range centered at 0.5
    const masterAdjustment = (this.volumeSettings.masterVolume - 0.5) * 2;
    const typeAdjustment = (volumeValue - 0.5) * 2;
    // Combine the adjustments
    const totalAdjustment = (masterAdjustment + typeAdjustment) / 2;
    // Apply the adjustment to the base volume (in dB)
    // Scale factor of 24 gives a good range for ambient sounds
    // Scale factor of 60 gives a good range for particle effects

    //console.log(baseVolume + totalAdjustment);
    return baseVolume + totalAdjustment * 24;
  }

  public updateVolumeSettings(newSettings: VolumeSettings) {
    this.volumeSettings = newSettings;

    // Update ambient music volume if player exists
    if (this.player) {
      this.player.volume.value = this.calcVolume(
        -18,
        this.volumeSettings.ambientVolume
      );
    }

    // Update all particle sound effects
    this.soundEffects.forEach((effect) => {
      if (effect.noise) {
        const baseVolume = effect.noise.volume.value;
        effect.noise.volume.value = this.calcVolume(
          baseVolume,
          this.volumeSettings.particleVolume
        );
      }
    });
  }

  public async initialize(audioFiles: string[]) {
    this.audioFiles = audioFiles;
    await this.initializePlayer();
  }

  public getIsLoaded(): boolean {
    return this.isLoaded;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public notifyFirstInteraction() {
    this.firstInteractionResolve();
  }

  public getActiveSoundEffectIds(): string[] {
    return Array.from(this.soundEffects.keys());
  }

  public async addParticleSoundEffect(
    particleId: string,
    options: SoundEffectParams = {}
  ) {
    const setupSoundEffect = async () => {
      await this.firstInteractionPromise;

      if (Tone.context.state !== "running") {
        await Tone.start();
      }

      const filter = new Tone.Filter({
        frequency: options.frequency ?? 4000,
        type: "bandpass",
        Q: 1,
      }).toDestination();

      const baseVolume = options.volume ?? -100;
      const noise = new Tone.Noise({
        type: "pink",
        volume: this.calcVolume(baseVolume, this.volumeSettings.particleVolume),
      }).connect(filter);

      this.soundEffects.set(particleId, {
        noise,
        filter,
        particleId,
      });

      if (this.isPlaying) {
        noise.start();
      }
    };

    setupSoundEffect();
  }

  public updateSoundEffect(particleId: string, options: SoundEffectParams) {
    const soundEffect = this.soundEffects.get(particleId);
    if (soundEffect) {
      const { noise, filter } = soundEffect;

      if (options.frequency !== undefined) {
        filter.frequency.value = options.frequency;
      }
      if (options.volume !== undefined) {
        noise.volume.value = this.calcVolume(
          options.volume,
          this.volumeSettings.particleVolume
        );
      }
    }
  }

  public removeSoundEffect(particleId: string) {
    const soundEffect = this.soundEffects.get(particleId);
    if (soundEffect) {
      soundEffect.noise.stop().dispose();
      soundEffect.filter.dispose();
      this.soundEffects.delete(particleId);
    }
  }

  public async togglePlayback() {
    if (this.isPlaying) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  private async initializePlayer() {
    if (!this.audioFiles || this.audioFiles.length === 0) {
      console.error("No audio files provided");
      return;
    }

    if (this.player) {
      console.log("Player already exists, cleaning up...");
      this.player.stop();
      this.player.dispose();
      this.player = null;
      this.hasStarted = false;
    }

    console.log("Initializing music player...");
    try {
      const currentFile = this.audioFiles[this.currentTrackIndex];
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
      this.player = new Tone.Player({
        url: currentFile,
        loop: true,
        autostart: false,
        volume: this.calcVolume(-18, this.volumeSettings.ambientVolume),
        onload: () => {
          console.log("Music loaded successfully");
          this.isLoaded = true;
        },
      }).toDestination();
    } catch (error) {
      console.error("Error initializing music player:", error);
      this.isLoaded = false;
    }
  }

  public async play() {
    if (!this.player || !this.isLoaded) return;

    try {
      if (Tone.context.state !== "running") {
        await Tone.start();
      }

      if (!this.hasStarted) {
        await this.player.start();
        this.hasStarted = true;
      } else {
        this.player.playbackRate = 1;
      }

      // Start all sound effects
      for (const { noise } of this.soundEffects.values()) {
        noise.start();
      }

      this.isPlaying = true;
      console.log("Music playback started/resumed");
    } catch (error) {
      console.error("Error starting/resuming music:", error);
    }
  }

  private async pause() {
    if (!this.player || !this.isLoaded) return;

    try {
      this.player.playbackRate = 0;

      // Stop all sound effects
      for (const { noise } of this.soundEffects.values()) {
        noise.stop();
      }

      this.isPlaying = false;
      console.log("Music playback paused");
    } catch (error) {
      console.error("Error pausing music:", error);
    }
  }

  public cleanup() {
    if (this.player) {
      console.log("Cleaning up music player...");
      this.player.stop();
      this.player.dispose();
      this.player = null;
      this.isLoaded = false;
      this.hasStarted = false;
    }

    // Clean up all sound effects
    for (const { noise, filter } of this.soundEffects.values()) {
      noise.stop().dispose();
      filter.dispose();
    }
    this.soundEffects.clear();
  }
}
