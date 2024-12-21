import * as Tone from "tone";

interface OscillatorData {
  oscillator: Tone.Oscillator;
  particleId: string;
}

type OscillatorType = "sine" | "square" | "triangle" | "sawtooth";

interface OscillatorParams {
  frequency?: number;
  type?: OscillatorType;
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
  private oscillators: Map<string, OscillatorData> = new Map();
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

  public async addOscillator(
    particleId: string,
    options: OscillatorParams = {}
  ) {
    // Create a deferred setup of the oscillator
    console.log("Adding oscillator", particleId);
    const setupOscillator = async () => {
      // Wait for first interaction
      await this.firstInteractionPromise;

      // Check if Tone.js context is running
      if (Tone.context.state !== "running") {
        await Tone.start();
      }

      // Create oscillator with default settings
      const oscillator = new Tone.Oscillator({
        frequency: options.frequency ?? 440,
        type: options.type ?? "sine",
        volume: options.volume ?? -20,
      }).toDestination();

      // Store the oscillator
      this.oscillators.set(particleId, {
        oscillator,
        particleId,
      });

      // Start the oscillator if audio is playing
      if (this.isPlaying) {
        oscillator.start();
      }
    };

    // Don't await the setup - let it run in the background
    setupOscillator();
  }

  public updateOscillator(particleId: string, options: OscillatorParams) {
    const oscillatorData = this.oscillators.get(particleId);
    if (oscillatorData) {
      const { oscillator } = oscillatorData;
      if (options.frequency !== undefined)
        oscillator.frequency.value = options.frequency;
      if (options.type !== undefined) oscillator.type = options.type;
      if (options.volume !== undefined)
        oscillator.volume.value = options.volume;
    }
  }

  public removeOscillator(particleId: string) {
    const oscillatorData = this.oscillators.get(particleId);
    if (oscillatorData) {
      oscillatorData.oscillator.stop().dispose();
      this.oscillators.delete(particleId);
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
        volume: -12,
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

      // Start all oscillators
      for (const { oscillator } of this.oscillators.values()) {
        oscillator.start();
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

      // Stop all oscillators
      for (const { oscillator } of this.oscillators.values()) {
        oscillator.stop();
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

    // Clean up all oscillators
    for (const { oscillator } of this.oscillators.values()) {
      oscillator.stop().dispose();
    }
    this.oscillators.clear();
  }
}
