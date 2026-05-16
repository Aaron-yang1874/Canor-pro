import type { ChordProgression, MusicKey, StyleTag } from "@/lib/types";

interface ChordGenerationInput {
  key: MusicKey;
  style?: StyleTag;
  complexity?: "simple" | "moderate" | "complex";
  length?: number;
  emotion?: string;
  seed?: number;
}

const SCALE_DEGREES: Record<string, string[]> = {
  major: ["I", "ii", "iii", "IV", "V", "vi", "vii°"],
  minor: ["i", "ii°", "III", "iv", "v", "VI", "VII"],
};

const STYLE_PROGRESSIONS: Record<string, string[][]> = {
  pop: [
    ["I", "V", "vi", "IV"],
    ["I", "IV", "V", "IV"],
    ["vi", "IV", "I", "V"],
    ["I", "iii", "IV", "V"],
  ],
  jazz: [
    ["ii", "V", "I", "I"],
    ["I", "vi", "ii", "V"],
    ["iii", "vi", "ii", "V"],
    ["I", "IV", "iii", "vi", "ii", "V", "I"],
  ],
  rock: [
    ["I", "IV", "V", "IV"],
    ["I", "bVII", "IV", "I"],
    ["i", "bVI", "bIII", "bVII"],
    ["I", "V", "vi", "IV"],
  ],
  classical: [
    ["I", "IV", "V", "I"],
    ["I", "V", "vi", "iii", "IV", "I", "IV", "V"],
    ["I", "IV", "vii°", "iii", "vi", "ii", "V", "I"],
    ["i", "iv", "V", "i"],
  ],
  electronic: [
    ["i", "bVI", "bIII", "bVII"],
    ["vi", "IV", "I", "V"],
    ["i", "bVII", "bVI", "V"],
    ["I", "IV", "vi", "V"],
  ],
  blues: [
    ["I7", "IV7", "I7", "I7", "IV7", "IV7", "I7", "I7", "V7", "IV7", "I7", "V7"],
    ["I7", "I7", "I7", "I7", "IV7", "IV7", "I7", "I7", "V7", "V7", "I7", "V7"],
  ],
  rnb: [
    ["ii", "V", "I", "vi"],
    ["I", "iii", "vi", "IV"],
    ["vi", "ii", "V", "I"],
    ["IV", "iii", "ii", "I"],
  ],
  lofi: [
    ["ii", "V", "I", "vi"],
    ["I", "iii", "IV", "iv"],
    ["vi", "IV", "I", "V"],
    ["IV", "V", "iii", "vi"],
  ],
  folk: [
    ["I", "IV", "V", "I"],
    ["I", "V", "vi", "IV"],
    ["I", "IV", "I", "V"],
    ["vi", "IV", "I", "V"],
  ],
};

const KEY_NOTE_MAP: Record<string, string[]> = {
  C: ["C", "D", "E", "F", "G", "A", "B"],
  Cm: ["C", "D", "Eb", "F", "G", "Ab", "Bb"],
  D: ["D", "E", "F#", "G", "A", "B", "C#"],
  Dm: ["D", "E", "F", "G", "A", "Bb", "C"],
  E: ["E", "F#", "G#", "A", "B", "C#", "D#"],
  Em: ["E", "F#", "G", "A", "B", "C", "D"],
  F: ["F", "G", "A", "Bb", "C", "D", "E"],
  Fm: ["F", "G", "Ab", "Bb", "C", "Db", "Eb"],
  G: ["G", "A", "B", "C", "D", "E", "F#"],
  Gm: ["G", "A", "Bb", "C", "D", "Eb", "F"],
  A: ["A", "B", "C#", "D", "E", "F#", "G#"],
  Am: ["A", "B", "C", "D", "E", "F", "G"],
  B: ["B", "C#", "D#", "E", "F#", "G#", "A#"],
  Bm: ["B", "C#", "D", "E", "F#", "G", "A"],
};

export function generateChordProgression(input: ChordGenerationInput): ChordProgression {
  const { key, style = "pop", complexity = "moderate", length = 4, emotion, seed } = input;

  const rng = seed !== undefined ? createRNG(seed) : Math.random;

  const progressions = STYLE_PROGRESSIONS[style] || STYLE_PROGRESSIONS.pop;
  const romanNumerals = selectProgression(progressions, complexity, emotion, length, rng);
  const isMinor = key.includes("m");
  const scaleType = isMinor ? "minor" : "major";
  const notes = KEY_NOTE_MAP[key] || KEY_NOTE_MAP.C;

  const chords = romanNumerals.map((rn) => {
    return romanNumeralToChord(rn, notes, complexity, rng);
  });

  const cadence = detectCadence(romanNumerals);

  return {
    chords,
    romanNumerals,
    key,
    complexity,
    cadence,
  };
}

function createRNG(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

function selectProgression(
  progressions: string[][],
  complexity: string,
  emotion: string | undefined,
  length: number,
  rng: () => number
): string[] {
  let candidates = progressions;

  if (complexity === "simple") {
    candidates = progressions.filter((p) => p.length <= 4);
  } else if (complexity === "complex") {
    candidates = progressions.filter((p) => p.length >= 4);
  }

  const base = candidates[Math.floor(rng() * candidates.length)];

  if (emotion === "sad" || emotion === "melancholic") {
    const minorStart = base.filter((c) => c.includes("i") || c.includes("vi"));
    return minorStart.length >= 2 ? minorStart : base;
  }

  return base.slice(0, Math.min(length, base.length));
}

function romanNumeralToChord(
  rn: string,
  scale: string[],
  complexity: string,
  rng: () => number
): string {
  const degreeMap: Record<string, number> = {
    I: 0, i: 0, II: 1, ii: 1, III: 2, iii: 2,
    IV: 3, iv: 3, V: 4, v: 4, VI: 5, vi: 5,
    VII: 6, vii: 6,
  };

  const isFlat = rn.startsWith("b");
  const cleanRN = isFlat ? rn.slice(1) : rn;
  const baseDegree = degreeMap[cleanRN] ?? 0;
  const adjustedDegree = isFlat ? (baseDegree - 1 + 7) % 7 : baseDegree;
  const note = scale[adjustedDegree];

  if (complexity === "simple") {
    return cleanRN.includes("°") ? `${note}dim` : note;
  }

  const quality = getChordQuality(cleanRN, complexity, rng);
  return `${note}${quality}`;
}

function getChordQuality(rn: string, complexity: string, rng: () => number): string {
  const isMinor = rn === rn.toLowerCase();
  const isDiminished = rn.includes("°");
  const isDominant = rn.includes("7") && rn === rn.toUpperCase();

  if (isDiminished) return "dim";

  if (complexity === "complex") {
    if (isMinor) return rng() > 0.5 ? "m7" : "m9";
    if (isDominant) return rng() > 0.5 ? "7" : "9";
    return rng() > 0.5 ? "maj7" : "maj9";
  }

  if (complexity === "moderate") {
    if (isMinor) return "m7";
    if (isDominant) return "7";
    return "maj7";
  }

  return isMinor ? "m" : "";
}

function detectCadence(romanNumerals: string[]): string {
  if (romanNumerals.length < 2) return "authentic";

  const lastTwo = romanNumerals.slice(-2);
  const lastTwoStr = lastTwo.join("-");

  if (lastTwoStr === "V-I" || lastTwoStr === "V-i" || lastTwoStr === "vii°-I") {
    return "authentic";
  }
  if (lastTwoStr === "IV-I" || lastTwoStr === "iv-i") {
    return "plagal";
  }
  if (lastTwoStr.includes("V") && !lastTwoStr.endsWith("I") && !lastTwoStr.endsWith("i")) {
    return "half";
  }
  if (lastTwoStr.includes("V") && (lastTwoStr.endsWith("vi") || lastTwoStr.endsWith("VI"))) {
    return "deceptive";
  }

  return "authentic";
}

export function buildChordPrompt(progression: ChordProgression): string {
  const lines: string[] = [
    "【和弦生成】",
    `@key=${progression.key}`,
    "",
    `和弦进行: ${progression.chords.join(" - ")}`,
    `和声功能: ${progression.romanNumerals.join(" - ")}`,
    `复杂度: ${progression.complexity}`,
    `终止式: ${progression.cadence}`,
    "",
    "创作要求:",
    "1. 基于上述和弦进行创作旋律",
    "2. 确保旋律音与和弦音和谐",
    "3. 在和弦转换处注意声部进行",
  ];

  return lines.join("\n");
}

const ALL_NOTES_LIST = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const KEY_SEMITONE_MAP: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4,
  F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8,
  A: 9, "A#": 10, Bb: 10, B: 11,
};

export function transposeProgression(
  progression: ChordProgression,
  targetKey: MusicKey
): ChordProgression {
  const sourceBase = progression.key.replace("m", "");
  const targetBase = targetKey.replace("m", "");

  const sourceSemitone = KEY_SEMITONE_MAP[sourceBase] ?? 0;
  const targetSemitone = KEY_SEMITONE_MAP[targetBase] ?? 0;
  let interval = targetSemitone - sourceSemitone;
  if (interval < 0) interval += 12;

  const transposedChords = progression.chords.map((chord) => {
    return transposeChordName(chord, interval);
  });

  return {
    ...progression,
    chords: transposedChords,
    romanNumerals: progression.romanNumerals,
    key: targetKey,
  };
}

function transposeChordName(chord: string, interval: number): string {
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;

  const noteName = match[1];
  const quality = match[2];

  const semitone = KEY_SEMITONE_MAP[noteName] ?? 0;
  const targetSemitone = (semitone + interval) % 12;
  const targetNote = ALL_NOTES_LIST[targetSemitone];

  return targetNote + quality;
}