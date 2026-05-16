import type { MIDIConfig, Instrument } from "@/lib/types";

interface MIDIGenerationInput {
  instrument: Instrument;
  key: string;
  tempo: number;
  timeSignature: string;
  duration: number;
  complexity: "simple" | "moderate" | "complex";
  articulation: "legato" | "staccato" | "normal" | "accented";
}

const MIDI_PROGRAMS: Record<Instrument, number> = {
  piano: 0,
  guitar: 24,
  bass: 32,
  drums: 0,
  violin: 40,
  cello: 42,
  flute: 73,
  saxophone: 65,
  trumpet: 56,
  synth: 80,
  vocals: 53,
  choir: 52,
  strings: 48,
  brass: 61,
  woodwinds: 71,
  percussion: 0,
  harp: 46,
  organ: 16,
  accordion: 21,
  theremin: 88,
};

export function buildMIDIPrompt(input: MIDIGenerationInput): string {
  const {
    instrument,
    key,
    tempo,
    timeSignature,
    duration,
    complexity,
    articulation,
  } = input;

  const program = MIDI_PROGRAMS[instrument] ?? 0;

  const lines: string[] = [
    "【MIDI生成】",
    "$midi",
    `@tempo=${tempo}`,
    `@key=${key}`,
    `@time_signature=${timeSignature}`,
    `@duration=${duration}`,
    "",
    `乐器: ${instrument} (Program ${program})`,
    `复杂度: ${complexity}`,
    `演奏法: ${articulation}`,
    "",
    getComplexityInstruction(complexity),
    getArticulationInstruction(articulation, instrument),
    "",
    "MIDI 配置:",
    `通道: 1`,
    `力度范围: ${getVelocityRange(complexity)}`,
    `表情控制: CC11`,
  ];

  return lines.join("\n");
}

function getComplexityInstruction(complexity: string): string {
  switch (complexity) {
    case "simple":
      return "生成简洁的旋律线条，音符密度低，节奏规整，适合初学者或背景音乐";
    case "moderate":
      return "生成中等复杂度的旋律，包含适度的装饰音和节奏变化";
    case "complex":
      return "生成高复杂度旋律，包含丰富的装饰音、切分节奏和音阶跑动";
    default:
      return "生成适中的旋律";
  }
}

function getArticulationInstruction(articulation: string, instrument: Instrument): string {
  const base = {
    legato: "使用连奏技法，音符之间平滑连接",
    staccato: "使用断奏技法，音符短促有力",
    normal: "使用常规演奏法，自然过渡",
    accented: "使用重音演奏法，强调拍点",
  }[articulation] || "使用常规演奏法";

  const instrumentSpecific: Partial<Record<Instrument, string>> = {
    piano: articulation === "legato" ? "使用延音踏板，营造连贯感" : "",
    guitar: articulation === "staccato" ? "使用闷音技法，制造短促音效" : "",
    violin: articulation === "legato" ? "使用全弓连奏，线条流畅" : "",
    drums: "根据风格选择合适的节奏型填充",
  };

  const specific = instrumentSpecific[instrument] || "";
  return specific ? `${base}。${specific}` : base;
}

function getVelocityRange(complexity: string): string {
  switch (complexity) {
    case "simple": return "60-90";
    case "moderate": return "40-100";
    case "complex": return "20-127";
    default: return "50-100";
  }
}

export function getMIDIConfig(instrument: Instrument): MIDIConfig {
  return {
    channel: 1,
    program: MIDI_PROGRAMS[instrument] ?? 0,
    velocity: 80,
    expression: 100,
    pitchBend: 0,
    ccMessages: {
      1: 0,
      7: 100,
      10: 64,
      11: 100,
      64: 0,
    },
  };
}

export function getAvailableInstruments(): Instrument[] {
  return Object.keys(MIDI_PROGRAMS) as Instrument[];
}

export function buildMultiTrackMIDIPrompt(
  inputs: MIDIGenerationInput[]
): string {
  const mainInput = inputs[0];
  const lines: string[] = [
    "【多轨MIDI生成】",
    "$midi",
    `@tempo=${mainInput.tempo}`,
    `@key=${mainInput.key}`,
    `@time_signature=${mainInput.timeSignature}`,
    `@duration=${mainInput.duration}`,
    "",
    "分轨配置:",
  ];

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const channel = i + 1;
    const program = MIDI_PROGRAMS[input.instrument] ?? 0;
    lines.push(
      `通道${channel}: ${input.instrument} (Program ${program}) | 复杂度:${input.complexity} | 演奏法:${input.articulation}`
    );
  }

  return lines.join("\n");
}