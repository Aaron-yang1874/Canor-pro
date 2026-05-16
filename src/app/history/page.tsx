"use client";

import { useState, useEffect } from "react";
import { History, Trash2, Clock, Copy, Check, Music, Tag, Hash } from "lucide-react";

interface HistoryItem {
  id: string;
  prompt: string;
  metadata: {
    tokenCount: number;
    complexity: string;
    createdAt: string;
    version: string;
  };
  styleTags: string[];
  quality: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("canor_history");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch {
        localStorage.removeItem("canor_history");
      }
    }
  }, []);

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem("canor_history", JSON.stringify(updated));
  };

  const handleClearAll = () => {
    setHistory([]);
    localStorage.removeItem("canor_history");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <History className="w-7 h-7 text-brand-500" />
            <h1 className="text-h2 text-surface-900">
              创作历史
            </h1>
            <span className="text-body-s text-surface-400">
              {history.length} 条记录
            </span>
          </div>
          <p className="text-body-m text-surface-500">
            查看和管理你的创作历史记录
          </p>
        </div>
        {history.length > 0 && (
          <button onClick={handleClearAll} className="btn-secondary text-sm">
            <Trash2 className="w-4 h-4" />
            清空历史
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="dark-panel p-12 text-center">
          <History className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 className="text-h4 text-surface-500 mb-2">
            暂无创作记录
          </h3>
          <p className="text-body-s text-surface-400 max-w-sm mx-auto">
            前往「创作工坊」生成你的第一个 AI 音乐创作 Prompt，记录将自动保存在这里
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="dark-panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <pre className="text-sm font-mono text-surface-700 bg-surface-50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {item.prompt}
                  </pre>

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 text-xs text-surface-500">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.metadata.createdAt)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-surface-500">
                      <Hash className="w-3 h-3" />
                      {item.metadata.tokenCount} tokens
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.metadata.complexity === "simple"
                        ? "bg-green-900/30 text-green-400"
                        : item.metadata.complexity === "moderate"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-red-900/30 text-red-400"
                    }`}>
                      {item.metadata.complexity === "simple" ? "简单" : item.metadata.complexity === "moderate" ? "中等" : "复杂"}
                    </span>
                    <span className="text-xs bg-brand-900/30 text-brand-400 px-2 py-0.5 rounded-full">
                      {item.metadata.version}
                    </span>
                    {item.styleTags.map((tag) => (
                      <span key={tag} className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleCopy(item.id, item.prompt)}
                    className="btn-ghost p-2"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-brand-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-ghost p-2 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}