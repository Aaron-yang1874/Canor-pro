import type { EmotionProfile, EmotionTag, StyleTag } from "@/lib/types";

interface EmotionAnalysisInput {
  description: string;
  targetEmotion?: EmotionTag;
  styleTags?: StyleTag[];
}

const EMOTION_PROFILES: Record<EmotionTag, EmotionProfile> = {
  happy: {
    primary: "happy",
    secondary: ["uplifting", "energetic"],
    intensity: 0.7,
    valence: 0.9,
    arousal: 0.7,
  },
  sad: {
    primary: "sad",
    secondary: ["melancholic", "nostalgic"],
    intensity: 0.4,
    valence: 0.1,
    arousal: 0.2,
  },
  energetic: {
    primary: "energetic",
    secondary: ["intense", "uplifting"],
    intensity: 0.9,
    valence: 0.8,
    arousal: 0.95,
  },
  calm: {
    primary: "calm",
    secondary: ["peaceful", "dreamy"],
    intensity: 0.2,
    valence: 0.6,
    arousal: 0.1,
  },
  romantic: {
    primary: "romantic",
    secondary: ["dreamy", "nostalgic"],
    intensity: 0.6,
    valence: 0.75,
    arousal: 0.5,
  },
  nostalgic: {
    primary: "nostalgic",
    secondary: ["melancholic", "romantic"],
    intensity: 0.5,
    valence: 0.4,
    arousal: 0.3,
  },
  mysterious: {
    primary: "mysterious",
    secondary: ["dark", "dreamy"],
    intensity: 0.3,
    valence: 0.35,
    arousal: 0.4,
  },
  epic: {
    primary: "epic",
    secondary: ["intense", "uplifting"],
    intensity: 0.95,
    valence: 0.85,
    arousal: 0.9,
  },
  dark: {
    primary: "dark",
    secondary: ["mysterious", "intense"],
    intensity: 0.7,
    valence: 0.15,
    arousal: 0.6,
  },
  uplifting: {
    primary: "uplifting",
    secondary: ["happy", "energetic"],
    intensity: 0.85,
    valence: 0.9,
    arousal: 0.8,
  },
  melancholic: {
    primary: "melancholic",
    secondary: ["sad", "nostalgic"],
    intensity: 0.35,
    valence: 0.2,
    arousal: 0.2,
  },
  aggressive: {
    primary: "aggressive",
    secondary: ["intense", "dark"],
    intensity: 0.95,
    valence: 0.25,
    arousal: 0.95,
  },
  peaceful: {
    primary: "peaceful",
    secondary: ["calm", "dreamy"],
    intensity: 0.15,
    valence: 0.7,
    arousal: 0.05,
  },
  dreamy: {
    primary: "dreamy",
    secondary: ["calm", "romantic"],
    intensity: 0.4,
    valence: 0.55,
    arousal: 0.3,
  },
  intense: {
    primary: "intense",
    secondary: ["energetic", "aggressive"],
    intensity: 0.9,
    valence: 0.5,
    arousal: 0.9,
  },
};

const EMOTION_KEYWORDS: Record<string, EmotionTag> = {
  happy: "happy", joy: "happy", cheerful: "happy", bright: "happy",
  sad: "sad", sorrow: "sad", grief: "sad", tearful: "sad",
  energy: "energetic", power: "energetic", dynamic: "energetic", lively: "energetic",
  calm: "calm", peaceful: "peaceful", serene: "calm", tranquil: "calm",
  love: "romantic", romance: "romantic", passion: "romantic", tender: "romantic",
  nostalgia: "nostalgic", memory: "nostalgic", reminiscent: "nostalgic",
  mystery: "mysterious", enigmatic: "mysterious", suspense: "mysterious",
  epic: "epic", grand: "epic", majestic: "epic", heroic: "epic",
  dark: "dark", gloomy: "dark", sinister: "dark", ominous: "dark",
  inspire: "uplifting", hope: "uplifting", triumph: "uplifting",
  melancholy: "melancholic", bittersweet: "melancholic", wistful: "melancholic",
  anger: "aggressive", fury: "aggressive", rage: "aggressive",
  dream: "dreamy", ethereal: "dreamy", surreal: "dreamy", fantasy: "dreamy",
  intense: "intense", dramatic: "intense", powerful: "intense",
};

const EMOTION_STYLE_MAP: Record<EmotionTag, StyleTag[]> = {
  happy: ["pop", "funk", "electronic", "house"],
  sad: ["blues", "classical", "ambient", "lofi"],
  energetic: ["rock", "edm", "metal", "punk"],
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

const EMOTION_KEY_MAP: Record<EmotionTag, string> = {
  happy: "C", sad: "Dm", energetic: "G", calm: "F",
  romantic: "Eb", nostalgic: "Am", mysterious: "Bbm", epic: "D",
  dark: "Cm", uplifting: "A", melancholic: "Am",
  aggressive: "Em", peaceful: "F", dreamy: "Db", intense: "E",
};

const EMOTION_TEMPO_MAP: Record<EmotionTag, number> = {
  happy: 120, sad: 70, energetic: 140, calm: 70,
  romantic: 85, nostalgic: 80, mysterious: 90, epic: 100,
  dark: 85, uplifting: 125, melancholic: 75,
  aggressive: 160, peaceful: 60, dreamy: 80, intense: 145,
};

export function analyzeEmotion(input: EmotionAnalysisInput): EmotionProfile {
  const { description, targetEmotion } = input;

  if (targetEmotion && EMOTION_PROFILES[targetEmotion]) {
    return EMOTION_PROFILES[targetEmotion];
  }

  const detectedEmotions = detectEmotionsFromText(description);
  const primary = detectedEmotions[0] || "calm";

  return EMOTION_PROFILES[primary];
}

function detectEmotionsFromText(text: string): EmotionTag[] {
  const lowerText = text.toLowerCase();
  const emotionScores = new Map<EmotionTag, number>();

  for (const [keyword, emotion] of Object.entries(EMOTION_KEYWORDS)) {
    if (lowerText.includes(keyword)) {
      emotionScores.set(emotion, (emotionScores.get(emotion) || 0) + 1);
    }
  }

  return Array.from(emotionScores.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([emotion]) => emotion);
}

export function getRecommendedStyles(emotion: EmotionTag): StyleTag[] {
  return EMOTION_STYLE_MAP[emotion] || ["pop"];
}

export function getRecommendedKey(emotion: EmotionTag): string {
  return EMOTION_KEY_MAP[emotion] || "C";
}

export function getRecommendedTempo(emotion: EmotionTag): number {
  return EMOTION_TEMPO_MAP[emotion] || 120;
}

export function getEmotionProfile(emotion: EmotionTag): EmotionProfile {
  return EMOTION_PROFILES[emotion] || EMOTION_PROFILES.calm;
}

export function blendEmotions(emotions: EmotionTag[]): EmotionProfile {
  if (emotions.length === 0) return EMOTION_PROFILES.calm;
  if (emotions.length === 1) return EMOTION_PROFILES[emotions[0]];

  const profiles = emotions.map((e) => EMOTION_PROFILES[e] || EMOTION_PROFILES.calm);
  const count = profiles.length;

  const blended: EmotionProfile = {
    primary: profiles[0].primary,
    secondary: [
      ...new Set(profiles.flatMap((p) => [p.primary, ...p.secondary])),
    ].filter((e) => e !== profiles[0].primary).slice(0, 3) as EmotionTag[],
    intensity: profiles.reduce((sum, p) => sum + p.intensity, 0) / count,
    valence: profiles.reduce((sum, p) => sum + p.valence, 0) / count,
    arousal: profiles.reduce((sum, p) => sum + p.arousal, 0) / count,
  };

  return blended;
}