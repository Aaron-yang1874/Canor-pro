import type { SoundEffectConfig } from "@/lib/types";

const SOUND_EFFECT_LIBRARY: Record<string, SoundEffectConfig> = {
  whoosh_transition: {
    category: "transition",
    duration: 2,
    pitch: 0,
    modulation: 30,
    texture: "clean",
  },
  cinematic_hit: {
    category: "impact",
    duration: 3,
    pitch: -2,
    modulation: 10,
    texture: "distorted",
  },
  ambient_drone: {
    category: "ambient",
    duration: 10,
    pitch: 0,
    modulation: 5,
    texture: "spectral",
  },
  riser_tension: {
    category: "riser",
    duration: 4,
    pitch: 12,
    modulation: 50,
    texture: "granular",
  },
  glitch_texture: {
    category: "texture",
    duration: 3,
    pitch: 0,
    modulation: 80,
    texture: "granular",
  },
  bass_drop: {
    category: "impact",
    duration: 2,
    pitch: -12,
    modulation: 20,
    texture: "distorted",
  },
  sparkle_magic: {
    category: "fx",
    duration: 1.5,
    pitch: 7,
    modulation: 40,
    texture: "clean",
  },
  vinyl_crackle: {
    category: "texture",
    duration: 8,
    pitch: 0,
    modulation: 5,
    texture: "clean",
  },
};

export function getSoundEffect(effectName: string): SoundEffectConfig | null {
  return SOUND_EFFECT_LIBRARY[effectName] || null;
}

export function listSoundEffects(): Array<{ name: string; config: SoundEffectConfig }> {
  return Object.entries(SOUND_EFFECT_LIBRARY).map(([name, config]) => ({
    name,
    config,
  }));
}

export function listByCategory(category: SoundEffectConfig["category"]): Array<{ name: string; config: SoundEffectConfig }> {
  return Object.entries(SOUND_EFFECT_LIBRARY)
    .filter(([, config]) => config.category === category)
    .map(([name, config]) => ({ name, config }));
}

export function buildSoundEffectPrompt(
  effectName: string,
  config?: Partial<SoundEffectConfig>
): string {
  const base = SOUND_EFFECT_LIBRARY[effectName];
  if (!base) {
    return `【音效生成】\n$sound_effects\n\n生成音效: ${effectName}`;
  }

  const merged = { ...base, ...config };

  const lines: string[] = [
    "【音效生成】",
    "$sound_effects",
    `@duration=${merged.duration}`,
    "",
    `音效名称: ${effectName}`,
    `类型: ${merged.category}`,
    `时长: ${merged.duration}秒`,
    `音高偏移: ${merged.pitch}半音`,
    `调制深度: ${merged.modulation}%`,
    `质感: ${merged.texture}`,
    "",
    getCategoryInstruction(merged.category),
  ];

  return lines.join("\n");
}

function getCategoryInstruction(category: SoundEffectConfig["category"]): string {
  const instructions: Record<string, string> = {
    ambient: "生成具有空间深度和持续性的环境音效，注重频段平衡和氛围营造",
    impact: "生成有力度的冲击音效，注重瞬态响应和低频能量",
    transition: "生成平滑的过渡音效，用于场景或段落之间的转换",
    texture: "生成具有独特质感的纹理音效，可作为背景层使用",
    riser: "生成逐渐增强的上升音效，营造紧张感和期待感",
    fx: "生成特殊效果音效，具有明确的音高和调制特征",
  };

  return instructions[category] || "生成高质量音效";
}

export function createCustomSoundEffect(config: SoundEffectConfig): SoundEffectConfig {
  return {
    category: config.category,
    duration: Math.max(0.5, Math.min(config.duration, 30)),
    pitch: Math.max(-24, Math.min(config.pitch, 24)),
    modulation: Math.max(0, Math.min(config.modulation, 100)),
    texture: config.texture,
  };
}

export function generateSoundEffectLayers(
  baseEffect: SoundEffectConfig,
  layerCount: number = 3
): SoundEffectConfig[] {
  const layers: SoundEffectConfig[] = [];

  for (let i = 0; i < layerCount; i++) {
    layers.push({
      category: baseEffect.category,
      duration: baseEffect.duration,
      pitch: baseEffect.pitch + (i - Math.floor(layerCount / 2)) * 7,
      modulation: baseEffect.modulation + i * 10,
      texture: i === 0 ? baseEffect.texture : "granular",
    });
  }

  return layers;
}