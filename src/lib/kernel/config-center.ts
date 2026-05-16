type ConfigChangeCallback = (key: string, oldValue: unknown, newValue: unknown) => void;

class ConfigCenter {
  private config: Map<string, unknown> = new Map();
  private watchers: Map<string, ConfigChangeCallback[]> = new Map();

  get<T = unknown>(key: string, defaultValue?: T): T {
    if (this.config.has(key)) return this.config.get(key) as T;
    return defaultValue as T;
  }

  set(key: string, value: unknown): void {
    const oldValue = this.config.get(key);
    this.config.set(key, value);
    const callbacks = this.watchers.get(key) || [];
    for (const cb of callbacks) {
      cb(key, oldValue, value);
    }
  }

  watch(key: string, callback: ConfigChangeCallback): () => void {
    const callbacks = this.watchers.get(key) || [];
    callbacks.push(callback);
    this.watchers.set(key, callbacks);
    return () => {
      const filtered = callbacks.filter((cb) => cb !== callback);
      this.watchers.set(key, filtered);
    };
  }

  delete(key: string): void {
    this.config.delete(key);
    this.watchers.delete(key);
  }

  getAll(): Record<string, unknown> {
    return Object.fromEntries(this.config);
  }

  loadFromObject(obj: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(obj)) {
      this.set(key, value);
    }
  }
}

export const globalConfigCenter = new ConfigCenter();

export function initializeDefaultConfig(): void {
  globalConfigCenter.loadFromObject({
    "audio.sampleRate": 44100,
    "audio.bitDepth": 24,
    "audio.channels": "stereo",
    "audio.qualityThreshold": 0.85,
    "evolution.metaLearningRate": 0.0001,
    "evolution.innerLoopSteps": 5,
    "evolution.creativityThreshold": 0.85,
    "federated.aggregationStrategy": "fedavg",
    "federated.minClientsPerRound": 10,
    "federated.privacyBudget": 8.0,
    "safety.copyrightThreshold": 0.7,
    "safety.encryptionAlgorithm": "AES-256-GCM",
    "safety.localProcessingOnly": true,
    "ui.animationDuration": 200,
    "ui.easingFunction": "ease-out-cubic",
    "performance.maxRetries": 3,
    "performance.baseRetryDelay": 1000,
  });
}
