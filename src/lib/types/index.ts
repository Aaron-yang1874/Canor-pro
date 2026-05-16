export interface SystemParams {
  tempo?: number;
  key?: string;
  timeSignature?: string;
  duration?: number;
  bpm?: number;
  scale?: string;
  octave?: number;
  context_depth?: "shallow" | "medium" | "deep";
  intent_recognition?: "enabled" | "disabled";
  history_window?: number;
  semantic_matching?: number;
  iteration_count?: number;
  creativity_level?: number;
}

export type StyleTag =
  | "pop" | "rock" | "jazz" | "classical" | "electronic"
  | "hiphop" | "rnb" | "folk" | "country" | "blues"
  | "metal" | "punk" | "reggae" | "funk" | "soul"
  | "latin" | "ambient" | "lofi" | "synthwave" | "trap"
  | "edm" | "house" | "techno" | "trance" | "dubstep"
  | "indie" | "alternative" | "kpop" | "jpop" | "world"
  | "acoustic" | "industrial" | "gospel" | "drum_and_bass";

export type FunctionModule =
  | "mixing" | "mastering" | "multi_track_export"
  | "collaboration" | "ai_cover" | "sound_effects"
  | "midi" | "stem_separation";

export type QualityLevel = "draft" | "standard" | "high" | "master";

export interface QualityParams {
  quality?: QualityLevel;
  lufs?: number;
  dynamic_range?: number;
  stereo_width?: number;
  clarity?: number;
  warmth?: number;
}

export interface PromptComponent {
  moduleId: string;
  systemParams: SystemParams;
  styleTags: StyleTag[];
  functionModules: FunctionModule[];
  qualityParams: QualityParams;
  creativeInstruction: string;
}

export type EmotionTag =
  | "happy" | "sad" | "energetic" | "calm" | "romantic"
  | "nostalgic" | "mysterious" | "epic" | "dark" | "uplifting"
  | "melancholic" | "aggressive" | "peaceful" | "dreamy" | "intense";

export type MusicKey =
  | "C" | "Cm" | "C#" | "C#m" | "Db" | "Dbm"
  | "D" | "Dm" | "D#" | "D#m" | "Eb" | "Ebm"
  | "E" | "Em" | "F" | "Fm" | "F#" | "F#m"
  | "Gb" | "Gbm" | "G" | "Gm" | "G#" | "G#m"
  | "Ab" | "Abm" | "A" | "Am" | "A#" | "A#m"
  | "Bb" | "Bbm" | "B" | "Bm";

export type TimeSignature = "2/4" | "3/4" | "4/4" | "5/4" | "6/8" | "7/8" | "12/8";

export interface ContextAnalysis {
  creativePositioning: string;
  parameterRecommendations: SystemParams;
  styleMatches: StyleTag[];
  emotionProfile: EmotionProfile;
}

export interface EmotionProfile {
  primary: EmotionTag;
  secondary: EmotionTag[];
  intensity: number;
  valence: number;
  arousal: number;
}

export interface IntentRecognition {
  coreGoal: string;
  useScenario: string;
  emotionalTendency: EmotionTag[];
  technicalPreference: string;
  confidence: number;
}

export interface QualityAssessment {
  overallScore: number;
  dimensions: {
    coherence: number;
    creativity: number;
    technicalQuality: number;
    emotionalImpact: number;
    structuralIntegrity: number;
  };
  suggestions: string[];
  meetsThreshold: boolean;
}

export interface IterationRecord {
  iterationNumber: number;
  prompt: string;
  feedback: string;
  improvements: string[];
  qualityDelta: number;
}

export interface StyleTemplate {
  id: string;
  name: string;
  category: StyleTag;
  description: string;
  systemParams: SystemParams;
  styleTags: StyleTag[];
  emotionProfile: EmotionProfile;
  referenceTracks: string[];
  promptTemplate: string;
}

export interface ChordProgression {
  chords: string[];
  romanNumerals: string[];
  key: MusicKey;
  complexity: "simple" | "moderate" | "complex";
  cadence: string;
}

export interface HarmonyArrangement {
  voices: number;
  intervals: string[];
  technique: "parallel" | "contrary" | "oblique" | "polyphonic";
  density: "sparse" | "moderate" | "dense";
  voicingStyle: "close" | "open" | "drop2" | "drop3" | "quartal";
}

export interface MixingPreset {
  id: string;
  name: string;
  eq: EQSettings;
  compression: CompressionSettings;
  reverb: ReverbSettings;
  delay: DelaySettings;
  stereoField: StereoSettings;
}

export interface EQSettings {
  lowCut: number;
  lowShelf: { freq: number; gain: number };
  midPeak1: { freq: number; gain: number; q: number };
  midPeak2: { freq: number; gain: number; q: number };
  highShelf: { freq: number; gain: number };
  highCut: number;
}

export interface CompressionSettings {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  makeupGain: number;
  knee: number;
}

export interface ReverbSettings {
  type: "hall" | "room" | "plate" | "spring" | "chamber" | "shimmer";
  decayTime: number;
  preDelay: number;
  mix: number;
  size: number;
  damping: number;
}

export interface DelaySettings {
  type: "digital" | "tape" | "analog" | "pingpong";
  time: number;
  feedback: number;
  mix: number;
  modulation: number;
}

export interface StereoSettings {
  width: number;
  panLaw: number;
  midSideBalance: number;
}

export interface SongAnalysis {
  key: MusicKey;
  tempo: number;
  timeSignature: TimeSignature;
  structure: string[];
  chordProgression: ChordProgression;
  energyCurve: number[];
  instruments: string[];
  genreConfidence: Partial<Record<StyleTag, number>>;
}

export interface MIDIConfig {
  channel: number;
  program: number;
  velocity: number;
  expression: number;
  pitchBend: number;
  ccMessages: Record<number, number>;
}

export interface SoundEffectConfig {
  category: "ambient" | "impact" | "transition" | "texture" | "riser" | "fx";
  duration: number;
  pitch: number;
  modulation: number;
  texture: "clean" | "distorted" | "granular" | "spectral";
}

export interface AICoverConfig {
  sourceTrack: string;
  targetStyle: StyleTag;
  vocalModel: string;
  preserveMelody: boolean;
  preserveLyrics: boolean;
  keyShift: number;
  tempoShift: number;
}

export interface CollaborationSession {
  id: string;
  participants: string[];
  projectName: string;
  tracks: CollaborationTrack[];
  chatHistory: CollaborationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CollaborationTrack {
  id: string;
  name: string;
  owner: string;
  instrument: string;
  status: "draft" | "review" | "approved" | "locked";
  version: number;
}

export interface CollaborationMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: "comment" | "suggestion" | "revision";
}

export interface BuiltPrompt {
  raw: string;
  components: PromptComponent;
  metadata: {
    tokenCount: number;
    complexity: "simple" | "moderate" | "complex";
    estimatedDuration: number;
    createdAt: string;
    version: string;
  };
}

export interface ParsedPrompt {
  isValid: boolean;
  components: PromptComponent;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export type MusicGenre = StyleTag;

export type Mood = EmotionTag | "playful" | "serious" | "whimsical";

export type Instrument =
  | "piano" | "guitar" | "bass" | "drums" | "violin"
  | "cello" | "flute" | "saxophone" | "trumpet" | "synth"
  | "vocals" | "choir" | "strings" | "brass" | "woodwinds"
  | "percussion" | "harp" | "organ" | "accordion" | "theremin";

export type MusicStructure =
  | "intro-verse-chorus-verse-chorus-bridge-chorus-outro"
  | "verse-chorus-verse-chorus-bridge-chorus"
  | "intro-verse-prechorus-chorus-verse-prechorus-chorus-bridge-chorus-outro"
  | "AABA"
  | "through-composed"
  | "verse-chorus-verse-chorus"
  | "intro-buildup-drop-breakdown-drop-outro";

export interface SmartRecommendation {
  styleTemplates: StyleTemplate[];
  chordProgressions: ChordProgression[];
  mixingPresets: MixingPreset[];
  similarCreations: string[];
  confidence: number;
  reasoning: string;
}

export interface TranspositionRequest {
  sourceKey: MusicKey;
  targetKey: MusicKey;
  preserveOctave: boolean;
  instrumentConstraints: Instrument[];
}

export interface TranspositionResult {
  originalKey: MusicKey;
  targetKey: MusicKey;
  interval: number;
  noteMapping: Record<string, string>;
  chordMapping: Record<string, string>;
}

// ============================================================
// V4 Type System Extensions
// ============================================================

// Prerequisite types used by 3.1–3.3
export type ModalityType = "text" | "image" | "audio" | "video";

export type QualityDimension = "coherence" | "creativity" | "technical_quality" | "emotional_impact" | "structural_integrity" | "harmony" | "rhythm" | "timbre" | "dynamics" | "spatial_quality" | "originality" | "production_quality";

// ============================================================
// 3.1 Self-evolution engine types
// ============================================================

export interface EvolutionConfig {
  metaLearningEnabled: boolean;
  zeroShotEnabled: boolean;
  onlineLearningEnabled: boolean;
  selfRepairEnabled: boolean;
  adaptationSteps: number;
  metaLearningRate: number;
  creativityThreshold: number;
}

export interface MetaLearningState {
  taskDistribution: string[];
  adaptedParameters: Record<string, number>;
  metaGradient: number[];
  innerLoopSteps: number;
  outerLoopSteps: number;
  currentEpoch: number;
  convergenceScore: number;
}

export interface ZeroShotParams {
  prompt: string;
  modality: ModalityType;
  numIterations: number;
  styleNeighbors: number;
  qualityThreshold: number;
  interpolationWeights: number[];
}

export interface OnlineLearningRecord {
  interactionId: string;
  userId: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  reward: number;
  feedbackType: "rating" | "like" | "listen_time" | "skip";
  timestamp: string;
}

export interface SelfRepairResult {
  originalScore: number;
  repairedScore: number;
  defects: DefectDiagnosis[];
  repairStrategy: "regenerate" | "local_repair" | "fine_tune";
  iterations: number;
  converged: boolean;
}

export interface DefectDiagnosis {
  dimension: QualityDimension;
  severity: "minor" | "major" | "critical";
  description: string;
  suggestedFix: string;
}

// ============================================================
// 3.2 Federated learning types
// ============================================================

export type FederatedLayer = "edge" | "regional" | "cloud";

export interface FederatedConfig {
  layers: FederatedLayer[];
  aggregationStrategy: "fedavg" | "fedprox" | "fedadam";
  minClientsPerRound: number;
  localEpochs: number;
  batchSize: number;
  privacyBudget: number;
}

export interface GradientUpdate {
  layerName: string;
  gradients: number[][];
  noiseScale: number;
  timestamp: string;
  clientId: string;
  modelVersion: string;
}

export interface DifferentialPrivacyParams {
  epsilon: number;
  delta: number;
  noiseMultiplier: number;
  maxGradientNorm: number;
  mechanism: "gaussian" | "laplace";
}

export interface FederatedModelState {
  modelVersion: string;
  globalWeights: number[];
  aggregationRound: number;
  participatingClients: number;
  convergenceMetric: number;
  lastUpdated: string;
}

// ============================================================
// 3.3 Multimodal input types
// ============================================================

export interface MultimodalInput {
  modalities: ModalityType[];
  textPrompt?: string;
  imageData?: string;
  audioData?: string;
  videoData?: string;
  fusionStrategy: "weighted" | "attention" | "concat";
  modalityWeights: Record<ModalityType, number>;
}

export interface ImageFeatures {
  dominantColors: string[];
  brightness: number;
  contrast: number;
  saturation: number;
  composition: "centered" | "rule_of_thirds" | "diagonal" | "symmetrical";
  detectedObjects: string[];
  mood: string;
  textureDensity: number;
}

export interface AudioFeatures {
  tempo: number;
  key: MusicKey;
  pitchContour: number[];
  rhythmPattern: string;
  timbreVector: number[];
  harmonicComplexity: number;
  spectralCentroid: number;
  mfcc: number[][];
}

export interface VideoFeatures {
  sceneChanges: number[];
  motionIntensity: number[];
  colorPalette: string[][];
  emotionalCurve: number[];
  averageFrameRate: number;
  duration: number;
  detectedActivities: string[];
}

export interface MultimodalFusion {
  fusedEmbedding: number[];
  dimension: number;
  fusionMethod: "weighted" | "attention" | "concat";
  modalityContributions: Record<ModalityType, number>;
  confidence: number;
}

// ============================================================
// 3.4 Safety & compliance types
// ============================================================

export interface ContentAuditResult {
  passed: boolean;
  flags: ContentFlag[];
  overallRisk: "low" | "medium" | "high" | "critical";
  auditTimestamp: string;
}

export interface ContentFlag {
  category: "copyright" | "hate_speech" | "violence" | "adult" | "political" | "harmful_audio";
  confidence: number;
  details: string;
  action: "block" | "warn" | "log";
}

export interface CopyrightCheckResult {
  isViolation: boolean;
  similarity: number;
  matchedWorkId?: string;
}

export interface PrivacyConfig {
  encryptionEnabled: boolean;
  encryptionAlgorithm: "AES-256-GCM" | "AES-256-CBC";
  localProcessingOnly: boolean;
  dataRetentionDays: number;
  anonymizationLevel: "full" | "partial" | "none";
  consentRequired: boolean;
}

// ============================================================
// 3.5 Error handling types
// ============================================================

export type ErrorLevel = "warning" | "error" | "critical";

export interface ErrorRecord {
  id: string;
  level: ErrorLevel;
  code: string;
  message: string;
  details?: string;
  timestamp: string;
  recoverable: boolean;
  retryCount: number;
  maxRetries: number;
}

export interface RetryStrategy {
  maxAttempts: number;
  baseDelayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
  strategy: "exponential" | "linear" | "fixed";
}

export interface RecoveryState {
  lastStableState: Record<string, unknown>;
  savedAt: string;
  canRecover: boolean;
  recoverySteps: string[];
}

// ============================================================
// 3.6 Extended interfaces & standalone types
// ============================================================

export interface BuiltPromptV4 extends BuiltPrompt {
  modality?: ModalityType;
  multimodalInput?: MultimodalInput;
  evolution?: EvolutionConfig;
  federated?: FederatedConfig;
  safetyAudit?: ContentAuditResult;
}

export interface PromptComponentV4 extends PromptComponent {
  modality?: ModalityType;
  multimodalInput?: MultimodalInput;
  evolution?: EvolutionConfig;
  federated?: FederatedConfig;
}

export interface AudioSpec {
  sampleRate: 44100 | 48000 | 96000;
  bitDepth: 16 | 24 | 32;
  channels: "stereo" | "5.1" | "7.1.4";
  frequencyResponse: { low: number; high: number };
  dynamicRange: number;
  signalToNoiseRatio: number;
}

export interface GenerationMetrics {
  durationSeconds: number;
  generationTimeMs: number;
  iterationsUsed: number;
  qualityScore: number;
  creativityScore: number;
  modelVersion: string;
}

// ============================================================
// V4 Output Schema types
// ============================================================

export interface StemTrack {
  type: "vocals" | "drums" | "bass" | "melody" | "harmony" | "effects";
  audioUrl: string;
  duration: number;
  format: "wav" | "mp3" | "flac";
  sampleRate: number;
}

export interface QualityScores {
  coherence: number;
  creativity: number;
  technicalQuality: number;
  emotionalImpact: number;
  structuralIntegrity: number;
  harmony: number;
  rhythm: number;
  timbre: number;
  dynamics: number;
  spatialQuality: number;
  originality: number;
  productionQuality: number;
  overall: number;
}

export interface CopyrightToken {
  tokenId: string;
  blockchainHash: string;
  timestamp: string;
  licenseType: "original" | "derivative" | "cover" | "remix";
  owner: string;
  verified: boolean;
}

export interface GenerationOutput {
  audioUrl: string;
  waveformData: number[];
  stems: StemTrack[];
  qualityScores: QualityScores;
  copyrightToken: CopyrightToken;
  metadata: GenerationMetrics;
  audioSpec: AudioSpec;
}

export interface CreationRequest {
  prompt: string;
  modality: ModalityType;
  multimodalInput?: MultimodalInput;
  parameters: {
    duration: number;
    tempo: number;
    genre: string;
    hasVocals: boolean;
    quality: QualityLevel;
  };
  advanced: {
    creativityLevel: number;
    contextDepth: "shallow" | "medium" | "deep";
    iterationCount: number;
  };
  evolution?: EvolutionConfig;
  federated?: FederatedConfig;
}