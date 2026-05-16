import type {
  ContextAnalysis,
  SystemParams,
  StyleTag,
  EmotionProfile,
  PromptComponent,
} from "@/lib/types";

interface ContextUnderstandingInput {
  creativeGoal: string;
  useScenario: string;
  emotionalTendency: string[];
  technicalPreference: string;
  contextDepth?: "shallow" | "medium" | "deep";
  historyWindow?: number;
  semanticMatching?: number;
}

const STYLE_EMOTION_MAP: Record<string, StyleTag[]> = {
  happy: ["pop", "electronic", "funk", "house"],
  sad: ["blues", "classical", "ambient", "lofi"],
  energetic: ["rock", "edm", "punk", "metal", "drum_and_bass"],
  calm: ["ambient", "classical", "lofi", "folk"],
  romantic: ["rnb", "jazz", "soul", "classical"],
  nostalgic: ["folk", "indie", "lofi", "synthwave"],
  mysterious: ["ambient", "jazz", "classical", "electronic"],
  epic: ["classical", "rock", "electronic", "metal"],
  dark: ["metal", "industrial", "ambient", "trap"],
  uplifting: ["pop", "edm", "gospel", "soul"],
  melancholic: ["blues", "indie", "folk", "classical"],
  aggressive: ["metal", "punk", "trap", "dubstep"],
  peaceful: ["ambient", "classical", "lofi", "folk"],
  dreamy: ["ambient", "synthwave", "lofi", "electronic"],
  intense: ["rock", "metal", "edm", "trap"],
};

const SCENARIO_PARAMS: Record<string, Partial<SystemParams>> = {
  film: { duration: 180, creativity_level: 0.7 },
  game: { duration: 120, creativity_level: 0.8 },
  advertisement: { duration: 30, creativity_level: 0.6 },
  personal: { duration: 240, creativity_level: 0.9 },
  performance: { duration: 300, creativity_level: 0.75 },
  meditation: { duration: 600, creativity_level: 0.5 },
  workout: { tempo: 140, creativity_level: 0.65 },
  study: { tempo: 90, creativity_level: 0.4 },
};

export function analyzeContext(input: ContextUnderstandingInput): ContextAnalysis {
  const { creativeGoal, useScenario, emotionalTendency, technicalPreference, contextDepth = "deep" } = input;

  const matchedStyles = matchStyles(emotionalTendency);
  const emotionProfile = buildEmotionProfile(emotionalTendency);
  const params = buildParameterRecommendations(useScenario, matchedStyles, emotionProfile, technicalPreference);
  const positioning = buildCreativePositioning(creativeGoal, useScenario, emotionProfile);

  return {
    creativePositioning: positioning,
    parameterRecommendations: params,
    styleMatches: matchedStyles,
    emotionProfile,
  };
}

function matchStyles(emotions: string[]): StyleTag[] {
  const styleScores = new Map<StyleTag, number>();

  for (const emotion of emotions) {
    const styles = STYLE_EMOTION_MAP[emotion.toLowerCase()];
    if (styles) {
      for (const style of styles) {
        styleScores.set(style, (styleScores.get(style) || 0) + 1);
      }
    }
  }

  return Array.from(styleScores.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([style]) => style);
}

function buildEmotionProfile(emotions: string[]): EmotionProfile {
  const primary = (emotions[0] || "calm") as EmotionProfile["primary"];
  const secondary = emotions.slice(1, 4) as EmotionProfile["secondary"];

  const intensityMap: Record<string, number> = {
    happy: 0.7, sad: 0.4, energetic: 0.9, calm: 0.2, romantic: 0.6,
    nostalgic: 0.5, mysterious: 0.3, epic: 0.95, dark: 0.7, uplifting: 0.85,
    melancholic: 0.35, aggressive: 0.95, peaceful: 0.15, dreamy: 0.4, intense: 0.9,
  };

  const valenceMap: Record<string, number> = {
    happy: 0.9, sad: 0.1, energetic: 0.8, calm: 0.6, romantic: 0.75,
    nostalgic: 0.4, mysterious: 0.35, epic: 0.85, dark: 0.15, uplifting: 0.9,
    melancholic: 0.2, aggressive: 0.25, peaceful: 0.7, dreamy: 0.55, intense: 0.5,
  };

  const arousalMap: Record<string, number> = {
    happy: 0.7, sad: 0.2, energetic: 0.95, calm: 0.1, romantic: 0.5,
    nostalgic: 0.3, mysterious: 0.4, epic: 0.9, dark: 0.6, uplifting: 0.8,
    melancholic: 0.2, aggressive: 0.95, peaceful: 0.05, dreamy: 0.3, intense: 0.9,
  };

  const primaryEmotion = emotions[0]?.toLowerCase() || "calm";
  const intensity = intensityMap[primaryEmotion] ?? 0.5;
  const valence = valenceMap[primaryEmotion] ?? 0.5;
  const arousal = arousalMap[primaryEmotion] ?? 0.5;

  return {
    primary: primary as EmotionProfile["primary"],
    secondary: secondary as EmotionProfile["secondary"],
    intensity,
    valence,
    arousal,
  };
}

function buildParameterRecommendations(
  scenario: string,
  styles: StyleTag[],
  emotion: EmotionProfile,
  technicalPreference: string
): SystemParams {
  const baseParams: SystemParams = {
    context_depth: "deep",
    intent_recognition: "enabled",
    history_window: 10,
    semantic_matching: 0.85,
    creativity_level: 0.75,
  };

  const scenarioKey = Object.keys(SCENARIO_PARAMS).find((k) =>
    scenario.toLowerCase().includes(k)
  );

  const scenarioParams = scenarioKey ? SCENARIO_PARAMS[scenarioKey] : {};

  const tempoByStyle: Partial<Record<StyleTag, number>> = {
    pop: 120, rock: 140, jazz: 100, classical: 80, electronic: 128,
    hiphop: 90, rnb: 85, folk: 100, metal: 160, punk: 180,
    lofi: 75, ambient: 60, edm: 128, house: 125, trap: 140,
    synthwave: 110, funk: 110, soul: 90, reggae: 75, blues: 80,
  };

  const primaryStyle = styles[0];
  const tempo = tempoByStyle[primaryStyle] ?? 120;

  const keyByEmotion: Record<string, string> = {
    happy: "C", sad: "Dm", energetic: "G", calm: "F", romantic: "Eb",
    dark: "Cm", epic: "D", uplifting: "A", melancholic: "Am",
  };

  const key = keyByEmotion[emotion.primary] || "C";

  return {
    ...baseParams,
    ...scenarioParams,
    tempo,
    key,
  };
}

function buildCreativePositioning(
  goal: string,
  scenario: string,
  emotion: EmotionProfile
): string {
  const scenarioLabels: Record<string, string> = {
    film: "影视配乐",
    game: "游戏音乐",
    advertisement: "广告音乐",
    personal: "个人创作",
    performance: "现场演出",
    meditation: "冥想音乐",
    workout: "运动音乐",
    study: "学习背景音乐",
  };

  const scenarioLabel = Object.entries(scenarioLabels).find(([k]) =>
    scenario.toLowerCase().includes(k)
  )?.[1] || scenario;

  return `${scenarioLabel} | ${emotion.primary}基调 | ${goal}`;
}

export function enhancePromptWithContext(
  prompt: PromptComponent,
  analysis: ContextAnalysis
): PromptComponent {
  return {
    ...prompt,
    systemParams: {
      ...analysis.parameterRecommendations,
      ...prompt.systemParams,
    },
    styleTags: [
      ...new Set([...analysis.styleMatches, ...prompt.styleTags]),
    ],
  };
}