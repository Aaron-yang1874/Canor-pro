import type { AICoverConfig, StyleTag } from "@/lib/types";

interface CoverPromptInput {
  sourceTrack: string;
  targetStyle: StyleTag;
  vocalModel?: string;
  preserveMelody?: boolean;
  preserveLyrics?: boolean;
  keyShift?: number;
  tempoShift?: number;
}

export function buildCoverPrompt(input: CoverPromptInput): string {
  const {
    sourceTrack,
    targetStyle,
    vocalModel = "default",
    preserveMelody = true,
    preserveLyrics = true,
    keyShift = 0,
    tempoShift = 0,
  } = input;

  const lines: string[] = [
    "【AI翻唱】",
    "$ai_cover",
    `#${targetStyle}`,
    "",
    `原曲: ${sourceTrack}`,
    `目标风格: ${targetStyle}`,
    `人声模型: ${vocalModel}`,
    "",
    "翻唱参数:",
    `保留旋律: ${preserveMelody ? "是" : "否"}`,
    `保留歌词: ${preserveLyrics ? "是" : "否"}`,
    `调性偏移: ${keyShift > 0 ? "+" : ""}${keyShift} 半音`,
    `速度偏移: ${tempoShift > 0 ? "+" : ""}${tempoShift}%`,
    "",
    "创作要求:",
    "1. 保持原曲的核心旋律特征",
    `2. 将编曲风格转换为${getStyleDescription(targetStyle)}`,
    "3. 适配新风格的节奏型和配器",
    "4. 确保人声与新编曲的融合度",
  ];

  if (!preserveLyrics) {
    lines.push("5. 根据新风格重新创作歌词");
  }

  return lines.join("\n");
}

function getStyleDescription(style: StyleTag): string {
  const descriptions: Partial<Record<StyleTag, string>> = {
    pop: "流行音乐风格，强调旋律性和传唱度",
    rock: "摇滚风格，突出吉他和鼓的力量感",
    jazz: "爵士风格，注重即兴和和声色彩",
    classical: "古典风格，采用管弦乐编制",
    electronic: "电子音乐风格，使用合成器和电子音色",
    hiphop: "嘻哈风格，强调节奏律动和说唱元素",
    rnb: "R&B风格，注重律动感和人声表现力",
    folk: "民谣风格，以原声乐器为主",
    metal: "金属风格，强调重型吉他 riff 和双踩鼓",
    lofi: "Lo-Fi风格，带有复古温暖质感",
    ambient: "氛围音乐风格，注重空间感和质感",
    edm: "EDM风格，强调电子舞曲的节奏感",
    trap: "Trap风格，突出808鼓机和高速hi-hats",
    synthwave: "合成波风格，80年代复古电子音色",
    funk: "放克风格，强调切分节奏和贝斯线条",
    soul: "灵魂乐风格，注重情感表达和人声演绎",
    reggae: "雷鬼风格，强调反拍节奏和轻松氛围",
    blues: "布鲁斯风格，以蓝调音阶和12小节结构为基础",
  };

  return descriptions[style] || `${style}风格`;
}

export function getCoverStyleRecommendations(
  sourceStyle: StyleTag
): Array<{ style: StyleTag; compatibility: number; reason: string }> {
  const recommendations: Array<{ style: StyleTag; compatibility: number; reason: string }> = [
    { style: "pop", compatibility: 0.9, reason: "流行风格适配性最高，适合大多数翻唱" },
    { style: "acoustic", compatibility: 0.85, reason: "原声改编能突出旋律本质" },
    { style: "lofi", compatibility: 0.8, reason: "Lo-Fi质感为原曲增添独特氛围" },
    { style: "jazz", compatibility: 0.7, reason: "爵士改编展现和声与即兴魅力" },
    { style: "electronic", compatibility: 0.7, reason: "电子化改编带来全新听感" },
    { style: "classical", compatibility: 0.65, reason: "古典改编赋予作品史诗感" },
    { style: "rock", compatibility: 0.6, reason: "摇滚化改编增加能量和张力" },
  ];

  if (sourceStyle === "electronic" || sourceStyle === "edm") {
    return [
      { style: "classical", compatibility: 0.85, reason: "电子转古典是热门改编方向" },
      { style: "jazz", compatibility: 0.8, reason: "电子转爵士展现和声深度" },
      { style: "ambient", compatibility: 0.8, reason: "氛围化处理营造沉浸感" },
    ];
  }

  return recommendations;
}