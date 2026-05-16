import type { StyleTemplate } from "@/lib/types";

export const styleTemplates: StyleTemplate[] = [
  {
    id: "pop_standard",
    name: "标准流行",
    category: "pop",
    description: "经典流行音乐风格，旋律朗朗上口，节奏明快",
    systemParams: { tempo: 120, key: "C", timeSignature: "4/4", creativity_level: 0.7 },
    styleTags: ["pop"],
    emotionProfile: {
      primary: "happy",
      secondary: ["uplifting"],
      intensity: 0.7,
      valence: 0.85,
      arousal: 0.7,
    },
    referenceTracks: ["Shape of You", "Blinding Lights"],
    promptTemplate: "创作一首节奏明快、旋律动听的流行歌曲。使用标准流行编曲，包含清晰的verse-chorus结构，副歌要有记忆点。",
  },
  {
    id: "rock_classic",
    name: "经典摇滚",
    category: "rock",
    description: "强劲的吉他驱动摇滚，充满能量和态度",
    systemParams: { tempo: 140, key: "E", timeSignature: "4/4", creativity_level: 0.8 },
    styleTags: ["rock"],
    emotionProfile: {
      primary: "energetic",
      secondary: ["intense", "aggressive"],
      intensity: 0.9,
      valence: 0.7,
      arousal: 0.9,
    },
    referenceTracks: ["Back in Black", "Smells Like Teen Spirit"],
    promptTemplate: "创作一首高能量的摇滚歌曲。突出失真吉他和强劲鼓点，包含具有冲击力的吉他solo段落。",
  },
  {
    id: "jazz_standard",
    name: "爵士标准曲",
    category: "jazz",
    description: "经典爵士风格，强调即兴和和声色彩",
    systemParams: { tempo: 100, key: "Eb", timeSignature: "4/4", creativity_level: 0.9 },
    styleTags: ["jazz"],
    emotionProfile: {
      primary: "romantic",
      secondary: ["mysterious", "nostalgic"],
      intensity: 0.55,
      valence: 0.6,
      arousal: 0.4,
    },
    referenceTracks: ["Autumn Leaves", "Take Five"],
    promptTemplate: "创作一首爵士标准曲。使用丰富的大七和弦和属七和弦，包含即兴独奏段落，强调swing律动感。",
  },
  {
    id: "classical_orchestral",
    name: "管弦古典",
    category: "classical",
    description: "宏大的管弦乐编制，古典音乐传统",
    systemParams: { tempo: 90, key: "D", timeSignature: "4/4", creativity_level: 0.75 },
    styleTags: ["classical"],
    emotionProfile: {
      primary: "epic",
      secondary: ["uplifting", "intense"],
      intensity: 0.85,
      valence: 0.75,
      arousal: 0.8,
    },
    referenceTracks: ["Also sprach Zarathustra", "The Planets"],
    promptTemplate: "创作一首宏大的管弦乐作品。使用完整的管弦乐队编制，包含弦乐、铜管、木管和打击乐声部。",
  },
  {
    id: "electronic_edm",
    name: "电子舞曲",
    category: "electronic",
    description: "高能量电子舞曲，适合俱乐部和音乐节",
    systemParams: { tempo: 128, key: "G", timeSignature: "4/4", creativity_level: 0.8 },
    styleTags: ["electronic", "edm", "house"],
    emotionProfile: {
      primary: "energetic",
      secondary: ["uplifting", "intense"],
      intensity: 0.9,
      valence: 0.8,
      arousal: 0.95,
    },
    referenceTracks: ["Levels", "Strobe"],
    promptTemplate: "创作一首EDM电子舞曲。使用sidechain压缩、渐强buildup和能量释放的drop段落，包含合成器主旋律。",
  },
  {
    id: "lofi_chill",
    name: "Lo-Fi 放松",
    category: "lofi",
    description: "温暖的Lo-Fi质感，适合放松和专注",
    systemParams: { tempo: 75, key: "Am", timeSignature: "4/4", creativity_level: 0.6 },
    styleTags: ["lofi", "ambient"],
    emotionProfile: {
      primary: "calm",
      secondary: ["peaceful", "dreamy"],
      intensity: 0.2,
      valence: 0.55,
      arousal: 0.1,
    },
    referenceTracks: ["Lofi Hip Hop Radio", "ChilledCow"],
    promptTemplate: "创作一首Lo-Fi放松音乐。使用温暖失真的音色、柔和的打击乐和低保真质感，营造舒适的听觉氛围。",
  },
  {
    id: "hiphop_trap",
    name: "Trap 嘻哈",
    category: "hiphop",
    description: "现代Trap风格，808重低音和高速hi-hats",
    systemParams: { tempo: 140, key: "Cm", timeSignature: "4/4", creativity_level: 0.75 },
    styleTags: ["hiphop", "trap"],
    emotionProfile: {
      primary: "intense",
      secondary: ["aggressive", "dark"],
      intensity: 0.85,
      valence: 0.4,
      arousal: 0.85,
    },
    referenceTracks: ["SICKO MODE", "Goosebumps"],
    promptTemplate: "创作一首Trap风格的嘻哈伴奏。使用808低音、快速hi-hats滚奏和空间感合成器pad。",
  },
  {
    id: "rnb_soulful",
    name: "灵魂 R&B",
    category: "rnb",
    description: "丝滑的R&B风格，强调律动和情感",
    systemParams: { tempo: 85, key: "Eb", timeSignature: "4/4", creativity_level: 0.75 },
    styleTags: ["rnb", "soul"],
    emotionProfile: {
      primary: "romantic",
      secondary: ["dreamy", "nostalgic"],
      intensity: 0.6,
      valence: 0.7,
      arousal: 0.5,
    },
    referenceTracks: ["Blinding Lights", "Ordinary People"],
    promptTemplate: "创作一首R&B灵魂乐。使用柔和的电钢琴、丝滑的贝斯线条和丰富的和声进行，营造浪漫氛围。",
  },
  {
    id: "folk_acoustic",
    name: "原声民谣",
    category: "folk",
    description: "温暖的原声民谣，以吉他和人声为主",
    systemParams: { tempo: 100, key: "G", timeSignature: "4/4", creativity_level: 0.7 },
    styleTags: ["folk", "indie"],
    emotionProfile: {
      primary: "nostalgic",
      secondary: ["calm", "peaceful"],
      intensity: 0.4,
      valence: 0.6,
      arousal: 0.3,
    },
    referenceTracks: ["Fast Car", "The Night We Met"],
    promptTemplate: "创作一首温暖的原声民谣。以原声吉他为主要伴奏乐器，讲述一个动人的故事。",
  },
  {
    id: "metal_heavy",
    name: "重金属",
    category: "metal",
    description: "重型金属风格，双踩鼓和失真吉他",
    systemParams: { tempo: 160, key: "Em", timeSignature: "4/4", creativity_level: 0.85 },
    styleTags: ["metal", "rock"],
    emotionProfile: {
      primary: "aggressive",
      secondary: ["intense", "dark"],
      intensity: 0.95,
      valence: 0.2,
      arousal: 0.95,
    },
    referenceTracks: ["Master of Puppets", "Enter Sandman"],
    promptTemplate: "创作一首重金属歌曲。使用降调吉他、双踩鼓和嘶吼式人声，包含高速吉他solo段落。",
  },
  {
    id: "synthwave_retro",
    name: "合成波复古",
    category: "synthwave",
    description: "80年代复古合成器风格，霓虹色彩",
    systemParams: { tempo: 110, key: "Am", timeSignature: "4/4", creativity_level: 0.8 },
    styleTags: ["synthwave", "electronic"],
    emotionProfile: {
      primary: "nostalgic",
      secondary: ["dreamy", "energetic"],
      intensity: 0.7,
      valence: 0.65,
      arousal: 0.7,
    },
    referenceTracks: ["Nightcall", "Turbo Killer"],
    promptTemplate: "创作一首80年代风格的合成波音乐。使用模拟合成器音色、门控混响鼓和复古琶音。",
  },
  {
    id: "ambient_atmospheric",
    name: "氛围音乐",
    category: "ambient",
    description: "沉浸式氛围音乐，注重空间感和质感",
    systemParams: { tempo: 60, key: "F", timeSignature: "4/4", creativity_level: 0.65 },
    styleTags: ["ambient", "electronic"],
    emotionProfile: {
      primary: "peaceful",
      secondary: ["dreamy", "mysterious"],
      intensity: 0.15,
      valence: 0.5,
      arousal: 0.05,
    },
    referenceTracks: ["Music for Airports", "An Ending"],
    promptTemplate: "创作一首沉浸式氛围音乐。使用长时值的合成器pad、空间混响和微妙的纹理变化。",
  },
  {
    id: "funk_groovy",
    name: "放克律动",
    category: "funk",
    description: "充满律动感的放克音乐，强调贝斯和节奏吉他",
    systemParams: { tempo: 110, key: "E", timeSignature: "4/4", creativity_level: 0.75 },
    styleTags: ["funk", "soul"],
    emotionProfile: {
      primary: "happy",
      secondary: ["energetic"],
      intensity: 0.75,
      valence: 0.9,
      arousal: 0.7,
    },
    referenceTracks: ["Uptown Funk", "Get Lucky"],
    promptTemplate: "创作一首放克音乐。使用 slap bass、切分节奏吉他和紧凑的铜管编排，营造强烈的律动感。",
  },
  {
    id: "blues_slow",
    name: "慢蓝调",
    category: "blues",
    description: "经典12小节蓝调，充满情感表达",
    systemParams: { tempo: 80, key: "A", timeSignature: "4/4", creativity_level: 0.7 },
    styleTags: ["blues"],
    emotionProfile: {
      primary: "melancholic",
      secondary: ["sad", "nostalgic"],
      intensity: 0.4,
      valence: 0.25,
      arousal: 0.25,
    },
    referenceTracks: ["The Thrill Is Gone", "Red House"],
    promptTemplate: "创作一首慢蓝调。使用12小节蓝调结构，包含富有表现力的吉他solo和蓝调音阶。",
  },
  {
    id: "reggae_island",
    name: "雷鬼海岛",
    category: "reggae",
    description: "轻松愉快的雷鬼音乐，反拍节奏",
    systemParams: { tempo: 75, key: "G", timeSignature: "4/4", creativity_level: 0.7 },
    styleTags: ["reggae"],
    emotionProfile: {
      primary: "peaceful",
      secondary: ["happy", "calm"],
      intensity: 0.4,
      valence: 0.8,
      arousal: 0.35,
    },
    referenceTracks: ["Three Little Birds", "No Woman No Cry"],
    promptTemplate: "创作一首轻松的雷鬼音乐。使用反拍吉他节奏（skank）、深沉的贝斯和轻松的律动。",
  },
  {
    id: "indie_dream",
    name: "独立梦幻",
    category: "indie",
    description: "独立音乐风格，梦幻而富有质感",
    systemParams: { tempo: 105, key: "D", timeSignature: "4/4", creativity_level: 0.8 },
    styleTags: ["indie", "alternative"],
    emotionProfile: {
      primary: "dreamy",
      secondary: ["nostalgic", "melancholic"],
      intensity: 0.5,
      valence: 0.5,
      arousal: 0.45,
    },
    referenceTracks: ["Space Song", "Dreams"],
    promptTemplate: "创作一首独立梦幻风格的歌曲。使用混响吉他、朦胧的人声和层次丰富的编曲。",
  },
  {
    id: "kpop_idol",
    name: "K-Pop 偶像",
    category: "kpop",
    description: "韩国流行音乐，制作精良、风格多变",
    systemParams: { tempo: 125, key: "C", timeSignature: "4/4", creativity_level: 0.85 },
    styleTags: ["kpop", "pop", "electronic"],
    emotionProfile: {
      primary: "energetic",
      secondary: ["happy", "uplifting"],
      intensity: 0.8,
      valence: 0.85,
      arousal: 0.8,
    },
    referenceTracks: ["Dynamite", "How You Like That"],
    promptTemplate: "创作一首K-Pop风格的歌曲。使用精良的电子制作、强烈的节奏变化和记忆点突出的hook段落。",
  },
  {
    id: "dubstep_wobble",
    name: "Dubstep 震荡",
    category: "dubstep",
    description: "重型Dubstep，wobble bass和激烈drop",
    systemParams: { tempo: 140, key: "Fm", timeSignature: "4/4", creativity_level: 0.8 },
    styleTags: ["dubstep", "electronic"],
    emotionProfile: {
      primary: "intense",
      secondary: ["aggressive", "dark"],
      intensity: 0.95,
      valence: 0.3,
      arousal: 0.95,
    },
    referenceTracks: ["Scary Monsters", "Cinema (Skrillex Remix)"],
    promptTemplate: "创作一首Dubstep音乐。使用wobble bass、激烈的drop段落和复杂的LFO调制音色。",
  },
  {
    id: "techno_dark",
    name: "暗黑 Techno",
    category: "techno",
    description: "地下Techno风格，重复性节奏和工业质感",
    systemParams: { tempo: 130, key: "Gm", timeSignature: "4/4", creativity_level: 0.7 },
    styleTags: ["techno", "electronic"],
    emotionProfile: {
      primary: "dark",
      secondary: ["intense", "mysterious"],
      intensity: 0.8,
      valence: 0.2,
      arousal: 0.8,
    },
    referenceTracks: ["The Bells", "Phylyps Trak"],
    promptTemplate: "创作一首地下Techno音乐。使用重复性鼓机节奏、工业质感合成器和渐进式编曲结构。",
  },
  {
    id: "trance_uplifting",
    name: "振奋 Trance",
    category: "trance",
    description: "旋律性Trance，情感充沛的电子音乐",
    systemParams: { tempo: 138, key: "A", timeSignature: "4/4", creativity_level: 0.8 },
    styleTags: ["trance", "electronic"],
    emotionProfile: {
      primary: "uplifting",
      secondary: ["energetic", "dreamy"],
      intensity: 0.85,
      valence: 0.85,
      arousal: 0.85,
    },
    referenceTracks: ["Adagio for Strings", "Saltwater"],
    promptTemplate: "创作一首旋律性Trance音乐。使用琶音合成器、情感丰富的pad和长时间的能量渐进。",
  },
];

export function getTemplateById(id: string): StyleTemplate | undefined {
  return styleTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): StyleTemplate[] {
  return styleTemplates.filter((t) => t.category === category);
}

export function getTemplatesByEmotion(emotion: string): StyleTemplate[] {
  return styleTemplates.filter(
    (t) =>
      t.emotionProfile.primary === emotion ||
      t.emotionProfile.secondary.includes(emotion as never)
  );
}

export function searchTemplates(query: string): StyleTemplate[] {
  const lower = query.toLowerCase();
  return styleTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower) ||
      t.category.toLowerCase().includes(lower) ||
      t.styleTags.some((s) => s.toLowerCase().includes(lower))
  );
}

export function getAllCategories(): string[] {
  return [...new Set(styleTemplates.map((t) => t.category))];
}

export function getTemplateCount(): number {
  return styleTemplates.length;
}