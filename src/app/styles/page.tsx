"use client";

import { useState, useEffect } from "react";
import type { StyleTemplate } from "@/lib/types";
import { Search, Filter, Music, Sparkles, Heart, Zap } from "lucide-react";

export default function StylesPage() {
  const [templates, setTemplates] = useState<StyleTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async (category?: string, query?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (query) params.set("query", query);

      const res = await fetch(`/api/styles?${params.toString()}`);
      const response = await res.json();
      const data = response.success ? response.data : response;

      if (category || query) {
        setTemplates(data);
      } else {
        setTemplates(data.templates);
        setCategories(data.categories);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    const newCategory = selectedCategory === category ? "" : category;
    setSelectedCategory(newCategory);
    fetchStyles(newCategory, searchQuery);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStyles(selectedCategory, searchQuery);
  };

  const getEmotionLabel = (emotion: string): string => {
    const labels: Record<string, string> = {
      happy: "开心", sad: "悲伤", energetic: "活力", calm: "平静",
      romantic: "浪漫", nostalgic: "怀旧", mysterious: "神秘",
      epic: "史诗", dark: "黑暗", uplifting: "振奋",
      melancholic: "忧郁", aggressive: "激烈", peaceful: "宁静",
      dreamy: "梦幻", intense: "强烈",
    };
    return labels[emotion] || emotion;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Music className="w-7 h-7 text-brand-500" />
          <h1 className="text-h2 text-surface-900">
            风格模板库
          </h1>
          <span className="text-body-s text-surface-400">
            {templates.length} 个模板
          </span>
        </div>
        <p className="text-body-m text-surface-500">
          浏览预设的音乐风格模板，快速开始创作
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
            placeholder="搜索模板名称、风格或描述..."
          />
        </form>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleCategoryClick("")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            !selectedCategory
              ? "bg-brand-500 text-black"
              : "bg-surface-100 text-surface-600 hover:bg-surface-200"
          }`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === cat
                ? "bg-brand-500 text-black"
                : "bg-surface-100 text-surface-600 hover:bg-surface-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="dark-panel p-6 animate-pulse">
              <div className="h-5 bg-surface-200 rounded w-2/3 mb-3" />
              <div className="h-4 bg-surface-100 rounded w-full mb-2" />
              <div className="h-4 bg-surface-100 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="dark-panel-hover p-5 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-h4 text-surface-900 group-hover:text-brand-500 transition-colors">
                    {template.name}
                  </h3>
                  <span className="text-xs text-brand-400 bg-brand-900/30 px-2 py-0.5 rounded-full">
                    #{template.category}
                  </span>
                </div>
                <Sparkles className="w-4 h-4 text-surface-300 group-hover:text-brand-400 transition-colors" />
              </div>

              <p className="text-body-m text-surface-500 mb-3 line-clamp-2">
                {template.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {template.styleTags.map((tag) => (
                  <span key={tag} className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-surface-400 pt-3 border-t border-surface-100">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {getEmotionLabel(template.emotionProfile.primary)}
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {template.systemParams.tempo} BPM
                </div>
                <div className="flex items-center gap-1">
                  <Music className="w-3 h-3" />
                  {template.systemParams.key}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && templates.length === 0 && (
        <div className="dark-panel p-12 text-center">
          <Music className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">没有找到匹配的模板</p>
        </div>
      )}
    </div>
  );
}