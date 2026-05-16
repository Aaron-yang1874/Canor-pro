"use client";

import { useState, useEffect } from "react";
import { Search, Download, Star, User, Check, X } from "lucide-react";

interface Plugin {
  id: string;
  manifest: {
    name: string;
    version: string;
    description: string;
    author: string;
    permissions: string[];
    entryPoint: string;
    signature: string;
    homepage?: string;
    repository?: string;
  };
  status: "pending" | "installed" | "enabled" | "disabled";
  installedAt: string;
  size: number;
  downloads: number;
  rating: number;
}

type Category = "all" | "audio" | "visual" | "tool" | "social";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "audio", label: "音频" },
  { id: "visual", label: "视觉" },
  { id: "tool", label: "工具" },
  { id: "social", label: "社交" },
];

const SAMPLE_PLUGINS: Plugin[] = [
  {
    id: "audio-mixer-pro",
    manifest: {
      name: "Audio Mixer Pro",
      version: "1.2.0",
      description: "专业音频混音工具，支持多轨混音、均衡器调节和音效处理",
      author: "SoundLab",
      permissions: ["audio:read", "audio:write", "storage:access"],
      entryPoint: "./dist/audio-mixer.js",
      signature: "sample-signature-key",
      homepage: "https://example.com/audio-mixer",
    },
    status: "installed",
    installedAt: new Date().toISOString(),
    size: 2457600,
    downloads: 12500,
    rating: 4.8,
  },
  {
    id: "visual-spectrum",
    manifest: {
      name: "Visual Spectrum Analyzer",
      version: "2.0.1",
      description: "实时音频频谱可视化，支持多种视觉风格和动画效果",
      author: "VisuWave",
      permissions: ["audio:read", "visual:render"],
      entryPoint: "./dist/spectrum.js",
      signature: "sample-signature-key",
    },
    status: "installed",
    installedAt: new Date().toISOString(),
    size: 1843200,
    downloads: 8900,
    rating: 4.5,
  },
  {
    id: "ai-lyrics-generator",
    manifest: {
      name: "AI Lyrics Generator",
      version: "1.5.3",
      description: "基于AI的歌词生成器，根据旋律和风格自动生成歌词",
      author: "AI Creative",
      permissions: ["audio:read", "ai:generate", "storage:access"],
      entryPoint: "./dist/lyrics-gen.js",
      signature: "sample-signature-key",
      homepage: "https://example.com/lyrics-ai",
    },
    status: "pending",
    installedAt: new Date().toISOString(),
    size: 3145728,
    downloads: 15200,
    rating: 4.9,
  },
  {
    id: "collab-suite",
    manifest: {
      name: "Collaboration Suite",
      version: "3.1.0",
      description: "团队协作工具，支持实时多人编辑和评论功能",
      author: "TeamSync",
      permissions: ["network:access", "storage:access", "user:info"],
      entryPoint: "./dist/collab.js",
      signature: "sample-signature-key",
      repository: "https://github.com/teamsync/collab",
    },
    status: "pending",
    installedAt: new Date().toISOString(),
    size: 2097152,
    downloads: 6800,
    rating: 4.3,
  },
  {
    id: "stem-separator",
    manifest: {
      name: "Advanced Stem Separator",
      version: "2.3.0",
      description: "使用深度学习技术分离音乐音轨，提取人声、鼓点、贝斯等",
      author: "DeepAudio",
      permissions: ["audio:read", "ai:process", "storage:access"],
      entryPoint: "./dist/stem-sep.js",
      signature: "sample-signature-key",
      homepage: "https://example.com/stem-separator",
    },
    status: "pending",
    installedAt: new Date().toISOString(),
    size: 5242880,
    downloads: 21000,
    rating: 4.7,
  },
  {
    id: "mastering-assistant",
    manifest: {
      name: "Smart Mastering Assistant",
      version: "1.8.2",
      description: "智能母带处理助手，自动优化音频响度、动态范围和频谱平衡",
      author: "AudioMaster",
      permissions: ["audio:read", "audio:write", "ai:process"],
      entryPoint: "./dist/mastering.js",
      signature: "sample-signature-key",
    },
    status: "pending",
    installedAt: new Date().toISOString(),
    size: 1572864,
    downloads: 9800,
    rating: 4.6,
  },
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [plugins, setPlugins] = useState<Plugin[]>(SAMPLE_PLUGINS);
  const [installingIds, setInstallingIds] = useState<Set<string>>(new Set());
  const [uninstallingIds, setUninstallingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        const response = await fetch("/api/marketplace");
        if (response.ok) {
          const data = await response.json();
          if (data.plugins && data.plugins.length > 0) {
            setPlugins(data.plugins);
          }
        }
      } catch (error) {
        console.error("Failed to fetch plugins from API:", error);
      }
    };
    fetchPlugins();
  }, []);

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesSearch =
      searchQuery === "" ||
      plugin.manifest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.manifest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.manifest.author.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleInstall = async (pluginId: string) => {
    setInstallingIds((prev) => new Set(prev).add(pluginId));
    try {
      const response = await fetch("/api/marketplace/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pluginId }),
      });

      if (response.ok) {
        setPlugins((prev) =>
          prev.map((p) =>
            p.id === pluginId ? { ...p, status: "installed" as const } : p
          )
        );
      }
    } catch (error) {
      console.error("Installation failed:", error);
    } finally {
      setInstallingIds((prev) => {
        const next = new Set(prev);
        next.delete(pluginId);
        return next;
      });
    }
  };

  const handleUninstall = async (pluginId: string) => {
    setUninstallingIds((prev) => new Set(prev).add(pluginId));
    try {
      const response = await fetch("/api/marketplace/uninstall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pluginId }),
      });

      if (response.ok) {
        setPlugins((prev) =>
          prev.map((p) => (p.id === pluginId ? { ...p, status: "pending" as const } : p))
        );
      }
    } catch (error) {
      console.error("Uninstallation failed:", error);
    } finally {
      setUninstallingIds((prev) => {
        const next = new Set(prev);
        next.delete(pluginId);
        return next;
      });
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">插件市场</h1>
          <p className="text-[#B3B3B3]">探索和安装增强 Canor 功能的插件</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B3B3B3]" />
            <input
              type="text"
              placeholder="搜索插件名称、描述或作者..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#282828] border border-[#3E3E3E] rounded-lg text-white placeholder-[#B3B3B3] focus:outline-none focus:border-[#1DB954] transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? "bg-[#1DB954] text-black"
                  : "bg-[#282828] text-[#B3B3B3] hover:bg-[#3E3E3E] hover:text-white"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlugins.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-[#181818] rounded-xl p-6 border border-[#282828] hover:border-[#3E3E3E] transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-[#1DB954] transition-colors">
                    {plugin.manifest.name}
                  </h3>
                  <p className="text-xs text-[#B3B3B3] mt-1">
                    v{plugin.manifest.version}
                  </p>
                </div>
                {plugin.status === "installed" && (
                  <span className="px-2 py-1 bg-[#1DB954]/20 text-[#1DB954] text-xs rounded-full">
                    已安装
                  </span>
                )}
              </div>

              <p className="text-sm text-[#B3B3B3] mb-4 line-clamp-2">
                {plugin.manifest.description}
              </p>

              <div className="flex items-center gap-4 mb-4 text-xs text-[#B3B3B3]">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{plugin.manifest.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  <span>{plugin.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  <span>{formatNumber(plugin.downloads)}</span>
                </div>
                <span className="text-[#666]">
                  {formatSize(plugin.size)}
                </span>
              </div>

              <button
                onClick={() =>
                  plugin.status === "installed"
                    ? handleUninstall(plugin.id)
                    : handleInstall(plugin.id)
                }
                disabled={
                  installingIds.has(plugin.id) || uninstallingIds.has(plugin.id)
                }
                className={`w-full py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  plugin.status === "installed"
                    ? "bg-[#282828] text-[#B3B3B3] hover:bg-[#3E3E3E] hover:text-white"
                    : "bg-[#1DB954] text-black hover:bg-[#1ED760]"
                }`}
              >
                {installingIds.has(plugin.id) || uninstallingIds.has(plugin.id) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    处理中...
                  </>
                ) : plugin.status === "installed" ? (
                  <>
                    <X className="w-4 h-4" />
                    卸载
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    安装
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {filteredPlugins.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#282828] rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-[#B3B3B3]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              未找到插件
            </h3>
            <p className="text-[#B3B3B3]">
              尝试调整搜索条件或浏览其他分类
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
