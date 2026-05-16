import type { TranspositionRequest, TranspositionResult, MusicKey, Instrument } from "@/lib/types";

const KEY_SEMITONES: Record<string, number> = {
  C: 0, "C#": 1, Db: 1,
  D: 2, "D#": 3, Eb: 3,
  E: 4,
  F: 5, "F#": 6, Gb: 6,
  G: 7, "G#": 8, Ab: 8,
  A: 9, "A#": 10, Bb: 10,
  B: 11,
};

const ALL_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const INSTRUMENT_RANGES: Partial<Record<Instrument, { min: number; max: number }>> = {
  piano: { min: 21, max: 108 },
  guitar: { min: 40, max: 76 },
  bass: { min: 28, max: 52 },
  violin: { min: 55, max: 90 },
  cello: { min: 36, max: 72 },
  flute: { min: 60, max: 84 },
  saxophone: { min: 44, max: 76 },
  trumpet: { min: 54, max: 79 },
};

const NOTE_NAMES: Record<string, string[]> = {
  C: ["C"], "C#": ["C#", "Db"], Db: ["Db", "C#"],
  D: ["D"], "D#": ["D#", "Eb"], Eb: ["Eb", "D#"],
  E: ["E"],
  F: ["F"], "F#": ["F#", "Gb"], Gb: ["Gb", "F#"],
  G: ["G"], "G#": ["G#", "Ab"], Ab: ["Ab", "G#"],
  A: ["A"], "A#": ["A#", "Bb"], Bb: ["Bb", "A#"],
  B: ["B"],
};

export function transpose(request: TranspositionRequest): TranspositionResult {
  const { sourceKey, targetKey, preserveOctave, instrumentConstraints } = request;

  const sourceSemitone = getKeySemitone(sourceKey);
  const targetSemitone = getKeySemitone(targetKey);

  let interval = targetSemitone - sourceSemitone;
  if (interval < 0) interval += 12;
  if (interval > 6) interval -= 12;

  const noteMapping = buildNoteMapping(interval);
  const chordMapping = buildChordMapping(noteMapping);

  return {
    originalKey: sourceKey,
    targetKey,
    interval,
    noteMapping,
    chordMapping,
  };
}

function getKeySemitone(key: MusicKey): number {
  const baseKey = key.replace("m", "");
  const semitone = KEY_SEMITONES[baseKey];
  return semitone !== undefined ? semitone : 0;
}

function buildNoteMapping(interval: number): Record<string, string> {
  const mapping: Record<string, string> = {};

  for (let i = 0; i < 12; i++) {
    const sourceNote = ALL_NOTES[i];
    const targetIndex = (i + interval) % 12;
    const targetNote = ALL_NOTES[targetIndex];

    mapping[sourceNote] = targetNote;

    const aliases = NOTE_NAMES[sourceNote] || [sourceNote];
    for (const alias of aliases) {
      mapping[alias] = targetNote;
    }
  }

  return mapping;
}

function buildChordMapping(
  noteMapping: Record<string, string>
): Record<string, string> {
  const chordMapping: Record<string, string> = {};

  const chordQualities = ["", "m", "maj7", "m7", "7", "dim", "aug", "sus4", "sus2", "9", "m9", "dim7", "m7b5"];

  for (const note of ALL_NOTES) {
    for (const quality of chordQualities) {
      const sourceChord = `${note}${quality}`;
      const targetNote = noteMapping[note] || note;
      chordMapping[sourceChord] = `${targetNote}${quality}`;
    }
  }

  return chordMapping;
}

export function buildTranspositionPrompt(
  result: TranspositionResult,
  preserveOctave: boolean
): string {
  const lines: string[] = [
    "【转调转奏】",
    `@key=${result.targetKey}`,
    "",
    `原调: ${result.originalKey}`,
    `目标调: ${result.targetKey}`,
    `转调间隔: ${result.interval > 0 ? "+" : ""}${result.interval} 半音`,
    `保持八度: ${preserveOctave ? "是" : "否"}`,
    "",
    "音符映射:",
  ];

  const uniqueMappings = new Set<string>();
  for (const [from, to] of Object.entries(result.noteMapping)) {
    if (from.length === 1 || (from.length === 2 && (from[1] === "#" || from[1] === "b"))) {
      const entry = `  ${from} → ${to}`;
      if (!uniqueMappings.has(entry)) {
        uniqueMappings.add(entry);
      }
    }
  }

  for (const entry of Array.from(uniqueMappings).slice(0, 12)) {
    lines.push(entry);
  }

  lines.push("");
  lines.push("创作要求:");
  lines.push("1. 将所有旋律和和弦按上述映射关系转调");
  lines.push("2. 确保转调后的音域适合目标乐器");
  lines.push("3. 保持原曲的节奏型和表现力");

  return lines.join("\n");
}

export function checkInstrumentRange(
  instrument: Instrument,
  key: MusicKey
): { valid: boolean; warning?: string } {
  const range = INSTRUMENT_RANGES[instrument];
  if (!range) return { valid: true };

  const semitone = getKeySemitone(key);
  const midiBase = 60 + semitone;

  if (midiBase < range.min) {
    return {
      valid: false,
      warning: `调性 ${key} 可能低于 ${instrument} 的最低音域`,
    };
  }

  if (midiBase > range.max - 12) {
    return {
      valid: false,
      warning: `调性 ${key} 可能高于 ${instrument} 的最高音域`,
    };
  }

  return { valid: true };
}

export function suggestBestKey(
  instruments: Instrument[]
): MusicKey {
  for (const instrument of instruments) {
    const preferredKeys: Partial<Record<Instrument, MusicKey>> = {
      guitar: "E",
      bass: "E",
      saxophone: "Eb",
      trumpet: "Bb",
      violin: "D",
      cello: "C",
    };

    const preferred = preferredKeys[instrument];
    if (preferred) return preferred;
  }

  return "C";
}