import type {
  SongAnalysis,
  StyleTag,
  MusicKey,
  TimeSignature,
  ChordProgression,
} from "@/lib/types";

interface SongAnalysisInput {
  description: string;
  styleHints?: StyleTag[];
  duration?: number;
}

const STRUCTURE_TEMPLATES: Record<string, string[]> = {
  pop: ["intro", "verse", "pre-chorus", "chorus", "verse", "pre-chorus", "chorus", "bridge", "chorus", "outro"],
  rock: ["intro", "verse", "chorus", "verse", "chorus", "solo", "chorus", "outro"],
  edm: ["intro", "buildup", "drop", "breakdown", "buildup", "drop", "outro"],
  classical: ["exposition", "development", "recapitulation", "coda"],
  jazz: ["head", "solo_section", "head", "outro"],
  folk: ["intro", "verse", "chorus", "verse", "chorus", "bridge", "chorus", "outro"],
  hiphop: ["intro", "verse", "hook", "verse", "hook", "bridge", "hook", "outro"],
};

const COMMON_CHORD_PROGRESSIONS: Record<string, ChordProgression> = {
  pop_1_5_6_4: {
    chords: ["C", "G", "Am", "F"],
    romanNumerals: ["I", "V", "vi", "IV"],
    key: "C",
    complexity: "simple",
    cadence: "plagal",
  },
  jazz_2_5_1: {
    chords: ["Dm7", "G7", "Cmaj7"],
    romanNumerals: ["ii", "V", "I"],
    key: "C",
    complexity: "moderate",
    cadence: "authentic",
  },
  blues_1_4_5: {
    chords: ["C7", "F7", "G7"],
    romanNumerals: ["I7", "IV7", "V7"],
    key: "C",
    complexity: "simple",
    cadence: "authentic",
  },
  epic_1_6_4_5: {
    chords: ["C", "Am", "F", "G"],
    romanNumerals: ["I", "vi", "IV", "V"],
    key: "C",
    complexity: "simple",
    cadence: "authentic",
  },
  melancholic_6_4_1_5: {
    chords: ["Am", "F", "C", "G"],
    romanNumerals: ["vi", "IV", "I", "V"],
    key: "C",
    complexity: "moderate",
    cadence: "authentic",
  },
};

export function analyzeSong(input: SongAnalysisInput): SongAnalysis {
  const { description, styleHints = [], duration } = input;

  const primaryStyle = styleHints[0] || "pop";
  const structure = STRUCTURE_TEMPLATES[primaryStyle] || STRUCTURE_TEMPLATES.pop;
  const key = detectKey(description);
  const tempo = detectTempo(description, primaryStyle);
  const timeSignature = detectTimeSignature(description);
  const chordProgression = selectChordProgression(description, primaryStyle);
  const energyCurve = generateEnergyCurve(structure.length, primaryStyle);
  const instruments = detectInstruments(description, primaryStyle);
  const genreConfidence = calculateGenreConfidence(description, styleHints);

  return {
    key,
    tempo,
    timeSignature,
    structure,
    chordProgression,
    energyCurve,
    instruments,
    genreConfidence,
  };
}

function detectKey(description: string): MusicKey {
  const keyPatterns: Array<{ pattern: RegExp; key: MusicKey }> = [
    { pattern: /C大调|C major|C调/, key: "C" },
    { pattern: /D大调|D major|D调/, key: "D" },
    { pattern: /E大调|E major|E调/, key: "E" },
    { pattern: /F大调|F major|F调/, key: "F" },
    { pattern: /G大调|G major|G调/, key: "G" },
    { pattern: /A大调|A major|A调/, key: "A" },
    { pattern: /B大调|B major|B调/, key: "B" },
    { pattern: /Am|A小调|a小调/, key: "Am" },
    { pattern: /Dm|D小调|d小调/, key: "Dm" },
    { pattern: /Em|E小调|e小调/, key: "Em" },
    { pattern: /Bm|B小调|b小调/, key: "Bm" },
    { pattern: /Cm|C小调|c小调/, key: "Cm" },
    { pattern: /Gm|G小调|g小调/, key: "Gm" },
  ];

  for (const { pattern, key } of keyPatterns) {
    if (pattern.test(description)) {
      return key;
    }
  }

  return "C";
}

function detectTempo(description: string, style: StyleTag): number {
  const tempoMatch = description.match(/(\d+)\s*(BPM|bpm|拍)/);
  if (tempoMatch) {
    const tempo = parseInt(tempoMatch[1], 10);
    return Math.max(20, Math.min(tempo, 300));
  }

  const styleTempos: Partial<Record<StyleTag, number>> = {
    pop: 120, rock: 140, jazz: 100, classical: 90, electronic: 128,
    hiphop: 90, rnb: 85, folk: 100, metal: 160, punk: 180,
    lofi: 75, ambient: 60, edm: 128, house: 125, trap: 140,
    synthwave: 110, funk: 110, soul: 90, reggae: 75, blues: 85,
  };

  return styleTempos[style] ?? 120;
}

function detectTimeSignature(description: string): TimeSignature {
  const tsMatch = description.match(/(\d\/\d)\s*(拍|time)/);
  if (tsMatch) {
    const ts = tsMatch[1] as TimeSignature;
    return ["2/4", "3/4", "4/4", "5/4", "6/8", "7/8", "12/8"].includes(ts) ? ts : "4/4";
  }

  if (description.includes("三拍") || description.includes("华尔兹") || description.includes("waltz")) {
    return "3/4";
  }

  if (description.includes("6/8") || description.includes("八六拍")) {
    return "6/8";
  }

  return "4/4";
}

function selectChordProgression(
  description: string,
  style: StyleTag
): ChordProgression {
  const lower = description.toLowerCase();

  if (style === "jazz" || lower.includes("爵士")) {
    return COMMON_CHORD_PROGRESSIONS.jazz_2_5_1;
  }

  if (style === "blues" || lower.includes("蓝调") || lower.includes("布鲁斯")) {
    return COMMON_CHORD_PROGRESSIONS.blues_1_4_5;
  }

  if (lower.includes("悲伤") || lower.includes("忧郁") || lower.includes("melancholic")) {
    return COMMON_CHORD_PROGRESSIONS.melancholic_6_4_1_5;
  }

  if (lower.includes("史诗") || lower.includes("宏大") || lower.includes("epic")) {
    return COMMON_CHORD_PROGRESSIONS.epic_1_6_4_5;
  }

  return COMMON_CHORD_PROGRESSIONS.pop_1_5_6_4;
}

function generateEnergyCurve(sectionCount: number, style: StyleTag): number[] {
  const curve: number[] = [];

  for (let i = 0; i < sectionCount; i++) {
    const position = i / (sectionCount - 1);
    let energy: number;

    if (style === "edm" || style === "electronic") {
      energy = Math.sin(position * Math.PI * 2) * 0.3 + 0.5;
      if (i === 2 || i === sectionCount - 3) energy = 0.9;
    } else if (style === "classical") {
      energy = 0.3 + position * 0.6;
    } else {
      energy = 0.4 + Math.sin(position * Math.PI) * 0.5;
      if (i === 3 || i === sectionCount - 3) energy = 0.85;
    }

    curve.push(Math.round(energy * 100) / 100);
  }

  return curve;
}

function detectInstruments(description: string, style: StyleTag): string[] {
  const instrumentKeywords: Record<string, string> = {
    钢琴: "piano", piano: "piano",
    吉他: "guitar", guitar: "guitar",
    贝斯: "bass", bass: "bass",
    鼓: "drums", drums: "drums",
    小提琴: "violin", violin: "violin",
    大提琴: "cello", cello: "cello",
    长笛: "flute", flute: "flute",
    萨克斯: "saxophone", saxophone: "saxophone",
    小号: "trumpet", trumpet: "trumpet",
    合成器: "synth", synth: "synth",
    人声: "vocals", vocals: "vocals",
    合唱: "choir", choir: "choir",
    弦乐: "strings", strings: "strings",
    管乐: "brass", brass: "brass",
    木管: "woodwinds", woodwinds: "woodwinds",
    打击乐: "percussion", percussion: "percussion",
    竖琴: "harp", harp: "harp",
    风琴: "organ", organ: "organ",
  };

  const detected = new Set<string>();

  for (const [keyword, instrument] of Object.entries(instrumentKeywords)) {
    if (description.includes(keyword)) {
      detected.add(instrument);
    }
  }

  if (detected.size === 0) {
    const defaultInstruments: Partial<Record<StyleTag, string[]>> = {
      pop: ["piano", "guitar", "bass", "drums", "vocals"],
      rock: ["guitar", "bass", "drums", "vocals"],
      jazz: ["piano", "bass", "drums", "saxophone"],
      classical: ["strings", "woodwinds", "brass", "percussion"],
      electronic: ["synth", "drums", "bass"],
      folk: ["guitar", "vocals", "harp"],
      metal: ["guitar", "bass", "drums"],
      hiphop: ["drums", "bass", "synth"],
    };

    return defaultInstruments[style] || ["piano", "drums", "bass"];
  }

  return Array.from(detected);
}

function calculateGenreConfidence(
  description: string,
  hints: StyleTag[]
): Partial<Record<StyleTag, number>> {
  const confidence: Partial<Record<StyleTag, number>> = {};

  for (const hint of hints) {
    confidence[hint] = 0.9;
  }

  const genreKeywords: Record<string, StyleTag> = {
    pop: "pop", 流行: "pop",
    rock: "rock", 摇滚: "rock",
    jazz: "jazz", 爵士: "jazz",
    古典: "classical", classical: "classical",
    电子: "electronic", electronic: "electronic",
    嘻哈: "hiphop", hiphop: "hiphop",
    民谣: "folk", folk: "folk",
    金属: "metal", metal: "metal",
    lofi: "lofi",
    ambient: "ambient", 氛围: "ambient",
    edm: "edm", 舞曲: "edm",
    trap: "trap",
    放克: "funk", funk: "funk",
    雷鬼: "reggae", reggae: "reggae",
  };

  for (const [keyword, genre] of Object.entries(genreKeywords)) {
    if (description.includes(keyword)) {
      confidence[genre] = (confidence[genre] || 0.5) + 0.2;
    }
  }

  return confidence;
}

export function buildAnalysisPrompt(analysis: SongAnalysis): string {
  const lines: string[] = [
    "【歌曲分析结果】",
    `调性: ${analysis.key}`,
    `速度: ${analysis.tempo} BPM`,
    `拍号: ${analysis.timeSignature}`,
    `结构: ${analysis.structure.join(" → ")}`,
    "",
    "和弦进行:",
    `  ${analysis.chordProgression.chords.join(" - ")}`,
    `  (${analysis.chordProgression.romanNumerals.join(" - ")})`,
    "",
    "能量曲线:",
    `  ${analysis.energyCurve.map((e) => (e * 100).toFixed(0) + "%").join(" → ")}`,
    "",
    `乐器配置: ${analysis.instruments.join(", ")}`,
  ];

  return lines.join("\n");
}