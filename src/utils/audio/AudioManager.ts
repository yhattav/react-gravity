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

  private constructor() {
    this.firstInteractionPromise = new Promise((resolve) => {
      this.firstInteractionResolve = resolve;
    });
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
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
    // Create a deferred setup of the sound effect
    const setupSoundEffect = async () => {
      // Wait for first interaction
      await this.firstInteractionPromise;

      // Check if Tone.js context is running
      if (Tone.context.state !== "running") {
        await Tone.start();
      }

      // Create filter for frequency control
      const filter = new Tone.Filter({
        frequency: options.frequency ?? 4000,
        type: "bandpass",
        Q: 1,
      }).toDestination();

      // Create noise generator
      const noise = new Tone.Noise({
        type: "pink",
        volume: options.volume ?? -100,
      }).connect(filter);

      // Store components
      this.soundEffects.set(particleId, {
        noise,
        filter,
        particleId,
      });

      // Start if audio is playing
      if (this.isPlaying) {
        noise.start();
      }
    };

    // Don't await the setup - let it run in the background
    setupSoundEffect();
  }

  public updateSoundEffect(particleId: string, options: SoundEffectParams) {
    const soundEffect = this.soundEffects.get(particleId);
    if (soundEffect) {
      const { noise, filter } = soundEffect;

      // Update parameters
      if (options.frequency !== undefined) {
        filter.frequency.value = options.frequency;
      }
      if (options.volume !== undefined) {
        noise.volume.value = options.volume;
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
        volume: -18,
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
