import type { HarmonyArrangement, ChordProgression, Instrument } from "@/lib/types";

interface HarmonyInput {
  chordProgression: ChordProgression;
  voices?: number;
  technique?: HarmonyArrangement["technique"];
  density?: HarmonyArrangement["density"];
  voicingStyle?: HarmonyArrangement["voicingStyle"];
  instruments?: Instrument[];
}

const VOICING_TEMPLATES: Record<string, number[][]> = {
  close: [
    [0, 2, 4],
    [0, 1, 4],
    [0, 3, 5],
  ],
  open: [
    [0, 4, 7],
    [0, 5, 9],
    [0, 3, 8],
  ],
  drop2: [
    [0, 5, 8],
    [0, 4, 9],
    [0, 6, 10],
  ],
  drop3: [
    [0, 7, 10],
    [0, 5, 12],
    [0, 8, 12],
  ],
  quartal: [
    [0, 5, 10],
    [0, 5, 11],
    [0, 6, 10],
  ],
};

export function arrangeHarmony(input: HarmonyInput): HarmonyArrangement {
  const {
    chordProgression,
    voices = 4,
    technique = "parallel",
    density = "moderate",
    voicingStyle = "close",
    instruments = [],
  } = input;

  const intervals = generateIntervals(chordProgression, voicingStyle, voices);

  return {
    voices,
    intervals,
    technique: technique as HarmonyArrangement["technique"],
    density: density as HarmonyArrangement["density"],
    voicingStyle: voicingStyle as HarmonyArrangement["voicingStyle"],
  };
}

function generateIntervals(
  progression: ChordProgression,
  voicing: string,
  voiceCount: number
): string[] {
  const templates = VOICING_TEMPLATES[voicing] || VOICING_TEMPLATES.close;
  const template = templates[progression.chords.length % templates.length];

  return template.slice(0, voiceCount - 1).map((interval, i) => {
    const baseInterval = interval;
    if (voiceCount > 4 && i === voiceCount - 2) {
      return `${baseInterval + 12}`;
    }
    return `${baseInterval}`;
  });
}

export function buildHarmonyPrompt(
  progression: ChordProgression,
  arrangement: HarmonyArrangement
): string {
  const lines: string[] = [
    "【和声编排】",
    `@key=${progression.key}`,
    "",
    `和弦进行: ${progression.chords.join(" - ")}`,
    `声部数量: ${arrangement.voices}`,
    `声部进行: ${arrangement.technique}`,
    `和声密度: ${arrangement.density}`,
    `声部排列: ${arrangement.voicingStyle}`,
    "",
    "音程配置:",
    ...arrangement.intervals.map((interval, i) => `  声部${i + 2}: 与主旋律间隔 ${interval} 半音`),
    "",
    "创作要求:",
    "1. 确保各声部之间的独立性",
    "2. 避免平行五度和八度（古典风格）",
    "3. 保持各声部在合理音域内",
    "4. 在和弦转换时注意声部平滑过渡",
  ];

  return lines.join("\n");
}

export function getVoicingRecommendation(
  style: string,
  instrumentCount: number
): HarmonyArrangement["voicingStyle"] {
  if (style === "jazz") return "drop2";
  if (style === "classical") return instrumentCount >= 4 ? "open" : "close";
  if (style === "electronic" || style === "ambient") return "quartal";
  if (instrumentCount <= 2) return "close";
  if (instrumentCount >= 5) return "open";
  return "close";
}

export function getTechniqueRecommendation(
  emotion: string
): HarmonyArrangement["technique"] {
  switch (emotion) {
    case "peaceful":
    case "calm":
      return "parallel";
    case "energetic":
    case "intense":
      return "contrary";
    case "mysterious":
    case "dreamy":
      return "oblique";
    case "epic":
    case "complex":
      return "polyphonic";
    default:
      return "parallel";
  }
}