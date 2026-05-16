import type {
  SmartRecommendation,
  StyleTemplate,
  ChordProgression,
  MixingPreset,
  StyleTag,
  EmotionTag,
  MusicGenre,
} from "@/lib/types";
import { styleTemplates } from "@/lib/styles/templates";
import { getMixingPreset, listMixingPresets } from "@/lib/modules/mixing-mastering";
import { generateChordProgression } from "@/lib/advanced/chord-generation";

interface RecommendationInput {
  styleTags?: StyleTag[];
  emotion?: string;
  genre?: MusicGenre;
  instruments?: string[];
  tempo?: number;
  previousCreations?: string[];
}

export function getSmartRecommendations(
  input: RecommendationInput
): SmartRecommendation {
  const { styleTags = [], emotion, genre, instruments = [], previousCreations = [] } = input;

  const recommendedStyles = recommendStyles(styleTags, emotion, genre);
  const chordProgressions = recommendChords(styleTags, emotion);
  const mixingPresets = recommendMixing(styleTags, genre);
  const similarCreations = recommendSimilar(styleTags, emotion, previousCreations);
  const confidence = calculateRecommendationConfidence(input);

  return {
    styleTemplates: recommendedStyles,
    chordProgressions,
    mixingPresets,
    similarCreations,
    confidence,
    reasoning: buildReasoning(input, recommendedStyles.length),
  };
}

function recommendStyles(
  tags: StyleTag[],
  emotion?: string,
  genre?: MusicGenre
): StyleTemplate[] {
  let candidates = styleTemplates;

  if (tags.length > 0) {
    candidates = candidates.filter((t) =>
      tags.some((tag) => t.category === tag || t.styleTags.includes(tag))
    );
  }

  if (genre) {
    candidates = candidates.filter((t) =>
      t.category === genre || t.styleTags.includes(genre)
    );
  }

  if (emotion) {
    candidates = candidates.filter((t) => {
      const profile = t.emotionProfile;
      return (
        profile.primary === emotion ||
        profile.secondary.includes(emotion as EmotionTag)
      );
    });
  }

  if (candidates.length === 0) {
    candidates = styleTemplates.slice(0, 3);
  }

  return candidates.slice(0, 5);
}

function recommendChords(
  tags: StyleTag[],
  emotion?: string
): ChordProgression[] {
  const progressions: ChordProgression[] = [];
  const primaryStyle = tags[0] || "pop";

  const keys: Array<{ key: Parameters<typeof generateChordProgression>[0]["key"] }> = [
    { key: "C" },
    { key: "Am" },
    { key: "G" },
  ];

  for (const { key } of keys) {
    progressions.push(
      generateChordProgression({
        key,
        style: primaryStyle,
        complexity: "moderate",
        length: 4,
        emotion,
      })
    );
  }

  return progressions;
}

function recommendMixing(
  tags: StyleTag[],
  genre?: MusicGenre
): MixingPreset[] {
  const allPresets = listMixingPresets();
  const style = (tags[0] || genre || "pop") as string;

  const stylePresets = allPresets.filter((p) =>
    p.name.toLowerCase().includes(style.toLowerCase())
  );

  if (stylePresets.length > 0) return stylePresets;

  return [allPresets[0]].filter(Boolean);
}

function recommendSimilar(
  tags: StyleTag[],
  emotion?: string,
  previousCreations: string[] = []
): string[] {
  if (previousCreations.length > 0) {
    return previousCreations.slice(0, 3);
  }

  const suggestions: string[] = [];
  const primaryTag = tags[0];

  if (primaryTag) {
    const tagDescriptions: Partial<Record<StyleTag, string>> = {
      pop: "一首节奏明快、旋律上口的流行歌曲",
      rock: "一首充满力量的摇滚作品",
      jazz: "一首富有即兴色彩的爵士乐曲",
      classical: "一首结构严谨的古典乐章",
      electronic: "一首层次丰富的电子音乐",
      lofi: "一首温暖放松的Lo-Fi作品",
      ambient: "一首沉浸式氛围音乐",
      folk: "一首叙事性强的民谣歌曲",
    };
    suggestions.push(tagDescriptions[primaryTag] || `一首${primaryTag}风格的音乐作品`);
  }

  if (emotion) {
    suggestions.push(`一首${emotion}情感基调的创作`);
  }

  if (suggestions.length === 0) {
    suggestions.push("一首具有个人特色的原创音乐");
  }

  return suggestions;
}

function calculateRecommendationConfidence(
  input: RecommendationInput
): number {
  let confidence = 0.5;

  if (input.styleTags && input.styleTags.length > 0) confidence += 0.15;
  if (input.emotion) confidence += 0.1;
  if (input.genre) confidence += 0.1;
  if (input.instruments && input.instruments.length > 0) confidence += 0.05;
  if (input.tempo) confidence += 0.05;
  if (input.previousCreations && input.previousCreations.length > 0) confidence += 0.05;

  return Math.min(confidence, 1.0);
}

function buildReasoning(input: RecommendationInput, styleCount: number): string {
  const parts: string[] = [];

  if (input.styleTags && input.styleTags.length > 0) {
    parts.push(`基于风格标签 ${input.styleTags.map((s) => `#${s}`).join(", ")}`);
  }

  if (input.emotion) {
    parts.push(`结合 ${input.emotion} 情感特征`);
  }

  if (input.genre) {
    parts.push(`参考 ${input.genre} 流派特征`);
  }

  parts.push(`推荐 ${styleCount} 个风格模板及配套和弦和混音方案`);

  return parts.join("，");
}

export function buildRecommendationPrompt(
  recommendation: SmartRecommendation
): string {
  const lines: string[] = [
    "【智能推荐】",
    `置信度: ${(recommendation.confidence * 100).toFixed(0)}%`,
    `推荐理由: ${recommendation.reasoning}`,
    "",
    "推荐风格模板:",
  ];

  for (const template of recommendation.styleTemplates.slice(0, 3)) {
    lines.push(
      `  - ${template.name} (#${template.category}) | ${template.description}`
    );
  }

  if (recommendation.chordProgressions.length > 0) {
    lines.push("");
    lines.push("推荐和弦进行:");
    for (const prog of recommendation.chordProgressions.slice(0, 2)) {
      lines.push(`  - ${prog.chords.join(" - ")} (${prog.key})`);
    }
  }

  if (recommendation.mixingPresets.length > 0) {
    lines.push("");
    lines.push("推荐混音方案:");
    for (const preset of recommendation.mixingPresets.slice(0, 2)) {
      lines.push(`  - ${preset.name}`);
    }
  }

  return lines.join("\n");
}

export function getTrendingStyles(): StyleTag[] {
  return ["lofi", "synthwave", "electronic", "pop", "jazz"];
}

export function getPopularCombinations(): Array<{
  styles: StyleTag[];
  description: string;
}> {
  return [
    { styles: ["lofi", "jazz"], description: "Lo-Fi Jazz - 舒缓放松的爵士律动" },
    { styles: ["synthwave", "rock"], description: "Synth Rock - 复古合成器遇上摇滚" },
    { styles: ["electronic", "classical"], description: "电子古典 - 管弦与电子的碰撞" },
    { styles: ["pop", "folk"], description: "民谣流行 - 温暖治愈的流行旋律" },
    { styles: ["trap", "rnb"], description: "Trap R&B - 现代节奏布鲁斯" },
    { styles: ["ambient", "electronic"], description: "氛围电子 - 沉浸式声音景观" },
  ];
}