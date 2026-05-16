"use client";

import { useState } from "react";
import { PromptForm } from "@/components/prompt-builder/prompt-form";
import { useCreationStage } from "@/lib/hooks/use-creation-stage";
import { Sparkles, Loader2, Sliders, Download, ArrowLeft } from "lucide-react";
import type { GenerationOutput } from "@/lib/types";

export default function Home() {
  const {
    stage, progress, error,
    startGeneration, updateProgress, completeGeneration,
    startExport, resetToInput,
  } = useCreationStage();
  const [generationOutput, setGenerationOutput] = useState<GenerationOutput | null>(null);

  const handleGenerate = async (result: unknown) => {
    startGeneration();
    updateProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 200));
      updateProgress(i);
    }

    const output = (result as { output?: GenerationOutput })?.output;
    if (output) setGenerationOutput(output);
    completeGeneration();
  };

  return (
    <div className="px-lg py-lg space-y-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <Sparkles className="w-6 h-6 text-[#1DB954]" />
          <h1 className="text-h2 text-white">AI 音乐创作工坊</h1>
        </div>
        <div className="flex items-center gap-sm">
          {(["input", "generating", "editing", "export"] as const).map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                stage === s ? "w-8 bg-[#1DB954]" : i < ["input", "generating", "editing", "export"].indexOf(stage) ? "w-4 bg-[#1DB954]/60" : "w-4 bg-[#2F2F2F]"
              }`}
            />
          ))}
          <span className="text-body-s text-[#B3B3B3] ml-sm">
            {{ input: "创意输入", generating: "生成中", editing: "编辑优化", export: "完成导出" }[stage]}
          </span>
        </div>
      </div>

      {stage === "input" && (
        <PromptForm onGenerate={handleGenerate} />
      )}

      {stage === "generating" && (
        <div className="flex flex-col items-center justify-center py-2xl space-y-lg">
          <div className="relative">
            <Loader2 className="w-16 h-16 text-[#1DB954] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-body-s text-black font-bold">{progress}%</span>
            </div>
          </div>
          <p className="text-h4 text-white">正在生成你的音乐作品...</p>
          <div className="w-80 h-2 bg-[#282828] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1DB954] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button onClick={resetToInput} className="btn-ghost text-body-m">
            取消生成
          </button>
          {error && <p className="text-red-400 text-body-m">{error}</p>}
        </div>
      )}

      {stage === "editing" && generationOutput && (
        <div className="space-y-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <Sliders className="w-5 h-5 text-[#1DB954]" />
              <h2 className="text-h3 text-white">编辑优化</h2>
            </div>
            <button onClick={resetToInput} className="btn-ghost text-body-m">
              <ArrowLeft className="w-4 h-4" /> 重新创作
            </button>
          </div>

          <div className="dark-panel p-md">
            <h3 className="text-h4 text-white mb-sm">质量评分</h3>
            <div className="grid grid-cols-3 gap-sm">
              {Object.entries(generationOutput.qualityScores).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between bg-[#282828] rounded-lg px-sm py-xs">
                  <span className="text-body-s text-[#B3B3B3]">{key}</span>
                  <span className={`text-body-m font-bold ${value >= 0.8 ? "text-[#1DB954]" : value >= 0.6 ? "text-yellow-400" : "text-red-400"}`}>
                    {(value * 100).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="dark-panel p-md">
            <h3 className="text-h4 text-white mb-sm">分轨编辑</h3>
            <div className="space-y-xs">
              {generationOutput.stems.map((stem) => (
                <div key={stem.type} className="flex items-center gap-sm bg-[#282828] rounded-lg px-sm py-sm">
                  <div className="w-2 h-8 bg-[#1DB954] rounded-full" />
                  <span className="text-body-m text-white flex-1">{stem.type}</span>
                  <span className="text-body-s text-[#B3B3B3]">{stem.format.toUpperCase()} · {stem.sampleRate / 1000}kHz</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={startExport} className="btn-primary w-full">
            <Download className="w-5 h-5" /> 导出作品
          </button>
        </div>
      )}

      {stage === "export" && generationOutput && (
        <div className="flex flex-col items-center justify-center py-2xl space-y-lg">
          <div className="w-20 h-20 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
            <Download className="w-10 h-10 text-[#1DB954]" />
          </div>
          <h2 className="text-h2 text-white">作品已完成</h2>
          <p className="text-body-m text-[#B3B3B3]">你的音乐作品已生成完毕，可以导出或分享</p>

          <div className="dark-panel p-lg w-full max-w-md space-y-sm">
            <div className="flex justify-between text-body-m">
              <span className="text-[#B3B3B3]">格式</span>
              <span className="text-white">WAV / MP3 / FLAC</span>
            </div>
            <div className="flex justify-between text-body-m">
              <span className="text-[#B3B3B3]">采样率</span>
              <span className="text-white">{generationOutput.audioSpec.sampleRate / 1000}kHz</span>
            </div>
            <div className="flex justify-between text-body-m">
              <span className="text-[#B3B3B3]">位深度</span>
              <span className="text-white">{generationOutput.audioSpec.bitDepth}bit</span>
            </div>
            <div className="flex justify-between text-body-m">
              <span className="text-[#B3B3B3]">版权Token</span>
              <span className="text-[#1DB954]">{generationOutput.copyrightToken.tokenId.slice(0, 8)}...</span>
            </div>
          </div>

          <div className="flex gap-sm">
            <button onClick={resetToInput} className="btn-secondary">
              <ArrowLeft className="w-4 h-4" /> 重新创作
            </button>
            <button className="btn-primary">
              <Download className="w-4 h-4" /> 导出音频
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
