import { NextRequest, NextResponse } from "next/server";
import { pluginRegistry } from "@/lib/marketplace/registry";
import { installer } from "@/lib/marketplace/installer";
import { PluginManifest } from "@/lib/marketplace/schema";

const SAMPLE_PLUGINS = [
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const pluginId = searchParams.get("pluginId");

  if (query) {
    const searchResults = pluginRegistry.search(query);
    return NextResponse.json({
      plugins: searchResults.length > 0 ? searchResults : SAMPLE_PLUGINS,
      total: searchResults.length > 0 ? searchResults.length : SAMPLE_PLUGINS.length,
    });
  }

  if (pluginId) {
    const plugin = pluginRegistry.get(pluginId) || SAMPLE_PLUGINS.find((p) => p.id === pluginId);
    if (!plugin) {
      return NextResponse.json({ error: "Plugin not found" }, { status: 404 });
    }
    return NextResponse.json(plugin.manifest);
  }

  const listedPlugins = pluginRegistry.list();
  return NextResponse.json({
    plugins: listedPlugins.length > 0 ? listedPlugins : SAMPLE_PLUGINS,
    total: listedPlugins.length > 0 ? listedPlugins.length : SAMPLE_PLUGINS.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, pluginId } = body;

    switch (action) {
      case "install":
      case "install-plugin": {
        const installPluginId = pluginId || body.pluginId;
        if (!installPluginId) {
          return NextResponse.json({ error: "pluginId is required" }, { status: 400 });
        }
        const success = await installer.install(installPluginId);
        return NextResponse.json({ success, pluginId: installPluginId });
      }

      case "uninstall": {
        if (!pluginId) {
          return NextResponse.json({ error: "pluginId is required" }, { status: 400 });
        }
        const success = await installer.uninstall(pluginId);
        return NextResponse.json({ success, pluginId });
      }

      case "enable": {
        if (!pluginId) {
          return NextResponse.json({ error: "pluginId is required" }, { status: 400 });
        }
        const success = await installer.enable(pluginId);
        return NextResponse.json({ success, pluginId });
      }

      case "disable": {
        if (!pluginId) {
          return NextResponse.json({ error: "pluginId is required" }, { status: 400 });
        }
        const success = await installer.disable(pluginId);
        return NextResponse.json({ success, pluginId });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Marketplace API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
