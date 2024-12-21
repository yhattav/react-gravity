import * as Tone from "tone";

interface OscillatorData {
  oscillator?: Tone.Oscillator;
  noise: Tone.Noise;
  filter: Tone.Filter;
  particleId: string;
}

type OscillatorType = "sine" | "square" | "triangle" | "sawtooth" | "noise";

interface OscillatorParams {
  frequency?: number;
  type?: OscillatorType;
  volume?: number;
  detune?: number;
  noiseAmount?: number;
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

  public getOscillatorIds(): string[] {
    return Array.from(this.oscillators.keys());
  }

  public async addOscillator(
    particleId: string,
    options: OscillatorParams = {}
  ) {
    // Create a deferred setup of the oscillator
    const setupOscillator = async () => {
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
        volume: options.volume ?? -20,
      }).connect(filter);

      // Only create oscillator if not in noise-only mode
      let oscillator: Tone.Oscillator | undefined;
      if (options.type !== "noise") {
        const type =
          options.type === "sine"
            ? "sine"
            : options.type === "square"
            ? "square"
            : options.type === "triangle"
            ? "triangle"
            : "sawtooth";

        oscillator = new Tone.Oscillator();
        oscillator.set({
          frequency: options.frequency ?? 440,
          type,
          volume: options.volume ?? -20,
          detune: options.detune ?? 0,
        });
        oscillator.toDestination();
      }

      // Store components
      this.oscillators.set(particleId, {
        oscillator,
        noise,
        filter,
        particleId,
      });

      // Start if audio is playing
      if (this.isPlaying) {
        if (oscillator) oscillator.start();
        noise.start();
      }
    };

    // Don't await the setup - let it run in the background
    setupOscillator();
  }

  public updateOscillator(particleId: string, options: OscillatorParams) {
    const oscillatorData = this.oscillators.get(particleId);
    if (oscillatorData) {
      const { oscillator, noise, filter } = oscillatorData;

      // Update parameters
      if (options.frequency !== undefined) {
        if (oscillator) oscillator.frequency.value = options.frequency;
        filter.frequency.value = options.frequency;
      }
      if (options.volume !== undefined) {
        if (oscillator) oscillator.volume.value = options.volume;
        noise.volume.value = options.volume;
      }
      if (options.type !== undefined && oscillator) {
        const type =
          options.type === "sine"
            ? "sine"
            : options.type === "square"
            ? "square"
            : options.type === "triangle"
            ? "triangle"
            : "sawtooth";
        oscillator.type = type;
      }
      if (options.detune !== undefined && oscillator) {
        oscillator.detune.value = options.detune;
      }
    }
  }

  public removeOscillator(particleId: string) {
    const oscillatorData = this.oscillators.get(particleId);
    if (oscillatorData) {
      if (oscillatorData.oscillator) {
        oscillatorData.oscillator.stop().dispose();
      }
      oscillatorData.noise.stop().dispose();
      oscillatorData.filter.dispose();
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

      // Start all oscillators and noise generators
      for (const { oscillator, noise } of this.oscillators.values()) {
        if (oscillator) oscillator.start();
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

      // Stop all oscillators and noise generators
      for (const { oscillator, noise } of this.oscillators.values()) {
        if (oscillator) oscillator.stop();
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

    // Clean up all oscillators and noise generators
    for (const { oscillator, noise, filter } of this.oscillators.values()) {
      if (oscillator) oscillator.stop().dispose();
      noise.stop().dispose();
      filter.dispose();
    }
    this.oscillators.clear();
  }
}
