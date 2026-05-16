import type { IntentRecognition, EmotionTag, StyleTag, MusicGenre } from "@/lib/types";

interface IntentInput {
  userInput: string;
  history?: string[];
  creativityLevel?: number;
}

const INTENT_PATTERNS = {
  compose: /创作|写歌|作曲|制作|编曲|create|compose|make|produce/,
  analyze: /分析|检测|识别|evaluate|analyze|detect|identify/,
  remix: /混音|remix|改编|翻唱|cover|arrange/,
  learn: /学习|教程|如何|怎么|learn|tutorial|how/,
  enhance: /优化|增强|improve|enhance|upgrade|polish/,
  generate: /生成|创建|generate|create|build/,
};

const GENRE_KEYWORDS: Record<string, MusicGenre> = {
  pop: "pop", 流行: "pop",
  rock: "rock", 摇滚: "rock",
  jazz: "jazz", 爵士: "jazz",
  classical: "classical", 古典: "classical",
  electronic: "electronic", 电子: "electronic",
  hiphop: "hiphop", 嘻哈: "hiphop", 说唱: "hiphop",
  rnb: "rnb", 节奏布鲁斯: "rnb",
  folk: "folk", 民谣: "folk",
  metal: "metal", 金属: "metal",
  punk: "punk", 朋克: "punk",
  edm: "edm", 舞曲: "edm",
  lofi: "lofi",
  ambient: "ambient", 氛围: "ambient",
  trap: "trap",
  synthwave: "synthwave", 合成波: "synthwave",
  funk: "funk", 放克: "funk",
  soul: "soul", 灵魂乐: "soul",
  reggae: "reggae", 雷鬼: "reggae",
  blues: "blues", 布鲁斯: "blues",
  indie: "indie", 独立: "indie",
  kpop: "kpop",
  jpop: "jpop",
};

const EMOTION_KEYWORDS: Record<string, EmotionTag> = {
  开心: "happy", 快乐: "happy", 愉快: "happy", happy: "happy",
  悲伤: "sad", 难过: "sad", 伤感: "sad", sad: "sad",
  活力: "energetic", 能量: "energetic", 动感: "energetic", energetic: "energetic",
  平静: "calm", 安静: "calm", 舒缓: "calm", calm: "calm",
  浪漫: "romantic", 爱情: "romantic", romantic: "romantic",
  怀旧: "nostalgic", 回忆: "nostalgic", nostalgic: "nostalgic",
  神秘: "mysterious", mysterious: "mysterious",
  史诗: "epic", 宏大: "epic", 壮丽: "epic", epic: "epic",
  黑暗: "dark", dark: "dark",
  振奋: "uplifting", 鼓舞: "uplifting", uplifting: "uplifting",
  忧郁: "melancholic", melancholic: "melancholic",
  激烈: "aggressive", aggressive: "aggressive",
  梦幻: "dreamy", dreamy: "dreamy",
  强烈: "intense", intense: "intense",
};

const SCENARIO_KEYWORDS: Record<string, string> = {
  电影: "film", 影视: "film", film: "film", movie: "film",
  游戏: "game", game: "game", gaming: "game",
  广告: "advertisement", ad: "advertisement",
  个人: "personal", 自己: "personal",
  演出: "performance", 现场: "performance", live: "performance",
  冥想: "meditation", meditation: "meditation",
  运动: "workout", 健身: "workout", workout: "workout",
  学习: "study", study: "study",
  短视频: "short_video", 抖音: "short_video",
  vlog: "vlog", 播客: "podcast",
};

export function recognizeIntent(input: IntentInput): IntentRecognition {
  const { userInput, history = [], creativityLevel = 0.75 } = input;
  const lowerInput = userInput.toLowerCase();

  const coreGoal = detectCoreGoal(lowerInput);
  const useScenario = detectScenario(lowerInput);
  const emotionalTendency = detectEmotions(lowerInput);
  const technicalPreference = detectTechnicalPreference(lowerInput, history);
  const confidence = calculateConfidence(lowerInput, history, creativityLevel);

  return {
    coreGoal,
    useScenario,
    emotionalTendency,
    technicalPreference,
    confidence,
  };
}

function detectCoreGoal(input: string): string {
  for (const [intent, pattern] of Object.entries(INTENT_PATTERNS)) {
    if (pattern.test(input)) {
      const goalLabels: Record<string, string> = {
        compose: "音乐创作与编曲",
        analyze: "音乐分析与评估",
        remix: "混音与改编制作",
        learn: "音乐学习与教程",
        enhance: "音乐质量优化",
        generate: "AI音乐生成",
      };
      return goalLabels[intent] || "音乐创作";
    }
  }
  return "AI音乐创作";
}

function detectScenario(input: string): string {
  for (const [keyword, scenario] of Object.entries(SCENARIO_KEYWORDS)) {
    if (input.includes(keyword)) {
      return scenario;
    }
  }
  return "personal";
}

function detectEmotions(input: string): EmotionTag[] {
  const emotions: EmotionTag[] = [];

  for (const [keyword, emotion] of Object.entries(EMOTION_KEYWORDS)) {
    if (input.includes(keyword) && !emotions.includes(emotion)) {
      emotions.push(emotion);
    }
  }

  if (emotions.length === 0) {
    return ["calm"];
  }

  return emotions.slice(0, 3);
}

function detectTechnicalPreference(input: string, history: string[]): string {
  const techKeywords: Record<string, string> = {
    钢琴: "piano", piano: "piano",
    吉他: "guitar", guitar: "guitar",
    电子: "electronic", 合成器: "synth",
    管弦: "orchestral", 交响: "orchestral",
    人声: "vocal", vocal: "vocal",
    鼓: "drums", drums: "drums",
    贝斯: "bass", bass: "bass",
    弦乐: "strings", strings: "strings",
  };

  for (const [keyword, tech] of Object.entries(techKeywords)) {
    if (input.includes(keyword)) {
      return tech;
    }
  }

  if (history.length > 0) {
    return "contextual";
  }

  return "balanced";
}

function calculateConfidence(
  input: string,
  history: string[],
  creativityLevel: number
): number {
  let confidence = 0.6;

  const keywordCount = [
    ...Object.keys(GENRE_KEYWORDS),
    ...Object.keys(EMOTION_KEYWORDS),
    ...Object.keys(SCENARIO_KEYWORDS),
  ].filter((kw) => input.includes(kw)).length;

  confidence += Math.min(keywordCount * 0.05, 0.2);
  confidence += history.length > 0 ? 0.1 : 0;
  confidence += creativityLevel > 0.5 ? 0.05 : 0;

  return Math.min(confidence, 1.0);
}

export function extractStyleTags(input: string): StyleTag[] {
  const tags: StyleTag[] = [];

  for (const [keyword, genre] of Object.entries(GENRE_KEYWORDS)) {
    if (input.includes(keyword) && !tags.includes(genre)) {
      tags.push(genre);
    }
  }

  return tags;
}