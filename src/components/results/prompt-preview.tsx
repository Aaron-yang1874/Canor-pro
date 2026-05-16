"use client";

import type { BuiltPrompt } from "@/lib/types";
import { Copy, Check, Code, Music, Clock, Zap } from "lucide-react";
import { useState } from "react";

interface PromptPreviewProps {
  prompt: BuiltPrompt | null;
}

export function PromptPreview({ prompt }: PromptPreviewProps) {
  const [copied, setCopied] = useState(false);

  if (!prompt) {
    return (
      <div className="dark-panel p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
        <Music className="w-16 h-16 text-surface-300 mb-4" />
        <h3 className="text-lg font-semibold text-surface-500 mb-2">
          等待创作
        </h3>
        <p className="text-sm text-surface-400 max-w-sm">
          在左侧填写创作参数和指令，点击「生成 Prompt」按钮，这里将展示生成的 V4 Prompt
        </p>
      </div>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const complexityColors = {
    simple: "bg-green-900/30 text-green-400",
    moderate: "bg-yellow-900/30 text-yellow-400",
    complex: "bg-red-900/30 text-red-400",
  };

  return (
    <div className="space-y-4">
      <div className="dark-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-brand-500" />
            <h3 className="section-title mb-0">生成的 Prompt</h3>
          </div>
          <button onClick={handleCopy} className="btn-secondary text-sm py-1.5">
            {copied ? (
              <>
                <Check className="w-4 h-4 text-brand-400" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制
              </>
            )}
          </button>
        </div>
        <pre className="bg-surface-50 border border-surface-200 rounded-xl p-4 text-sm font-mono text-surface-700 overflow-x-auto whitespace-pre-wrap max-h-[500px] overflow-y-auto">
          {prompt.raw}
        </pre>
      </div>

      <div className="dark-panel p-6">
        <h3 className="section-title">Prompt 元数据</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
            <Zap className="w-5 h-5 text-brand-500" />
            <div>
              <div className="text-xs text-surface-500">Token 数</div>
              <div className="text-sm font-semibold">{prompt.metadata.tokenCount}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
            <Clock className="w-5 h-5 text-brand-500" />
            <div>
              <div className="text-xs text-surface-500">预估时长</div>
              <div className="text-sm font-semibold">{prompt.metadata.estimatedDuration}s</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
            <div className={`w-2 h-2 rounded-full ${complexityColors[prompt.metadata.complexity].split(" ")[0]}`} />
            <div>
              <div className="text-xs text-surface-500">复杂度</div>
              <div className="text-sm font-semibold">
                <span className={`px-2 py-0.5 rounded-full text-xs ${complexityColors[prompt.metadata.complexity]}`}>
                  {prompt.metadata.complexity === "simple" ? "简单" : prompt.metadata.complexity === "moderate" ? "中等" : "复杂"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl">
            <Music className="w-5 h-5 text-brand-500" />
            <div>
              <div className="text-xs text-surface-500">版本</div>
              <div className="text-sm font-semibold">{prompt.metadata.version}</div>
            </div>
          </div>
        </div>
      </div>

      {prompt.components.styleTags.length > 0 && (
        <div className="dark-panel p-6">
          <h3 className="section-title">已选风格</h3>
          <div className="flex flex-wrap gap-2">
            {prompt.components.styleTags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {prompt.components.functionModules.length > 0 && (
        <div className="dark-panel p-6">
          <h3 className="section-title">已启功能模块</h3>
          <div className="flex flex-wrap gap-2">
            {prompt.components.functionModules.map((mod) => (
              <span key={mod} className="tag">
                ${mod}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}