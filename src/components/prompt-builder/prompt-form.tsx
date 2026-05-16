"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import {
  Music,
  Hash,
  DollarSign,
  Percent,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Upload,
  Mic,
  Users,
} from "lucide-react";
import { MultimodalInput } from "@/components/multimodal/multimodal-input";
import { CollabIndicator } from "@/components/collaboration/collab-indicator";
import { CollabCursor } from "@/components/collaboration/collab-cursor";
import type { ModalityType } from "@/lib/types";

interface StyleTag {
  id: string;
  label: string;
}

interface FunctionModule {
  id: string;
  label: string;
}

const STYLE_OPTIONS: StyleTag[] = [
  { id: "pop", label: "流行" },
  { id: "rock", label: "摇滚" },
  { id: "jazz", label: "爵士" },
  { id: "classical", label: "古典" },
  { id: "electronic", label: "电子" },
  { id: "hiphop", label: "嘻哈" },
  { id: "rnb", label: "R&B" },
  { id: "folk", label: "民谣" },
  { id: "metal", label: "金属" },
  { id: "punk", label: "朋克" },
  { id: "lofi", label: "Lo-Fi" },
  { id: "ambient", label: "氛围" },
  { id: "edm", label: "EDM" },
  { id: "house", label: "House" },
  { id: "techno", label: "Techno" },
  { id: "trance", label: "Trance" },
  { id: "trap", label: "Trap" },
  { id: "synthwave", label: "合成波" },
  { id: "funk", label: "放克" },
  { id: "soul", label: "灵魂乐" },
  { id: "reggae", label: "雷鬼" },
  { id: "blues", label: "蓝调" },
  { id: "indie", label: "独立" },
  { id: "kpop", label: "K-Pop" },
  { id: "jpop", label: "J-Pop" },
  { id: "dubstep", label: "Dubstep" },
  { id: "latin", label: "拉丁" },
  { id: "country", label: "乡村" },
  { id: "world", label: "世界音乐" },
  { id: "acoustic", label: "原声" },
  { id: "industrial", label: "工业" },
  { id: "gospel", label: "福音" },
  { id: "drum_and_bass", label: "Drum&Bass" },
];

const FUNCTION_MODULES: FunctionModule[] = [
  { id: "mixing", label: "混音处理" },
  { id: "mastering", label: "母带制作" },
  { id: "multi_track_export", label: "多轨导出" },
  { id: "ai_cover", label: "AI 翻唱" },
  { id: "sound_effects", label: "音效库" },
  { id: "midi", label: "MIDI" },
  { id: "stem_separation", label: "分轨分离" },
  { id: "collaboration", label: "协作创作" },
];

const QUALITY_LEVELS = [
  { id: "draft", label: "草稿" },
  { id: "standard", label: "标准" },
  { id: "high", label: "高品质" },
  { id: "master", label: "母带级" },
];

interface PromptFormProps {
  onGenerate: (result: unknown) => void;
}

interface Collaborator {
  userId: string;
  userName: string;
  color: string;
  cursor?: {
    line: number;
    column: number;
  };
}

export function PromptForm({ onGenerate }: PromptFormProps) {
  const [moduleId, setModuleId] = useState("音乐创作");
  const [tempo, setTempo] = useState(120);
  const [key, setKey] = useState("C");
  const [timeSignature, setTimeSignature] = useState("4/4");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [quality, setQuality] = useState("standard");
  const [creativeInstruction, setCreativeInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [duration, setDuration] = useState(180);
  const [lufs, setLufs] = useState(-14);
  const [creativityLevel, setCreativityLevel] = useState(0.75);
  const [contextDepth, setContextDepth] = useState("deep");
  const [activeModality, setActiveModality] = useState<ModalityType>("text");
  const [multimodalData, setMultimodalData] = useState<{ modality: ModalityType; data: string }>({ modality: "text", data: "" });
  const [hasVocals, setHasVocals] = useState(true);
  
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId] = useState(() => `prompt-room-${Date.now()}`);
  const [currentUserId] = useState(() => `user-${Math.random().toString(36).substr(2, 9)}`);
  const [currentUserName] = useState(() => `用户 ${Math.floor(Math.random() * 1000)}`);
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    const newSocket = io(socketUrl, {
      query: {
        roomId,
        userId: currentUserId,
        userName: currentUserName
      },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsCollaborating(true);
    });

    newSocket.on('room-joined', (data: { users: Collaborator[] }) => {
      setCollaborators(data.users || []);
    });

    newSocket.on('presence-update', (data: Collaborator) => {
      setCollaborators(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        return [...filtered, data];
      });
    });

    newSocket.on('user-left', (data: { userId: string }) => {
      setCollaborators(prev => prev.filter(u => u.userId !== data.userId));
    });

    newSocket.on('disconnect', () => {
      setIsCollaborating(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [roomId, currentUserId, currentUserName]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCreativeInstruction(e.target.value);
    
    if (socket && isCollaborating) {
      const textarea = e.target;
      const text = textarea.value;
      const cursorPos = textarea.selectionStart;
      const lines = text.substring(0, cursorPos).split('\n');
      const line = lines.length - 1;
      const column = lines[lines.length - 1].length;
      
      setCursorPosition({ line, column });
      
      socket.emit('cursor-update', { line, column });
    }
  };

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prompt/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          systemParams: {
            tempo,
            key,
            timeSignature,
            duration,
            context_depth: contextDepth,
            creativity_level: creativityLevel,
            hasVocals,
          },
          styleTags: selectedStyles,
          functionModules: selectedModules,
          qualityParams: {
            quality,
            lufs,
          },
          creativeInstruction,
        }),
      });

      const response = await res.json();
      onGenerate(response.success ? response.data : response);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const KEYS = ["C", "Cm", "D", "Dm", "E", "Em", "F", "Fm", "G", "Gm", "A", "Am", "B", "Bm"];

  return (
    <div className="space-y-6">
      <div className="dark-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <Music className="w-5 h-5 text-brand-500" />
          <span className="section-title mb-0">模块标识</span>
        </div>
        <input
          type="text"
          value={moduleId}
          onChange={(e) => setModuleId(e.target.value)}
          className="input-field text-lg font-medium"
          placeholder="输入模块名称，如：音乐创作、混音母带、歌曲分析..."
        />
      </div>

      <div className="dark-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="w-5 h-5 text-[#1DB954]" />
          <span className="section-title mb-0">多模态输入</span>
        </div>
        <MultimodalInput
          activeModality={activeModality}
          onModalityChange={setActiveModality}
          onInputChange={(data) => setMultimodalData(data)}
        />
      </div>

      <div className="dark-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <Hash className="w-5 h-5 text-brand-500" />
          <span className="section-title mb-0">系统参数 @</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="param-label">速度 (BPM)</label>
            <input
              type="number"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="input-field"
              min={20}
              max={300}
            />
          </div>
          <div>
            <label className="param-label">调性</label>
            <select
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="input-field"
            >
              {KEYS.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="param-label">拍号</label>
            <select
              value={timeSignature}
              onChange={(e) => setTimeSignature(e.target.value)}
              className="input-field"
            >
              {["2/4", "3/4", "4/4", "5/4", "6/8", "7/8", "12/8"].map((ts) => (
                <option key={ts} value={ts}>{ts}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="param-label">时长 (秒)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="input-field"
              min={5}
              max={3600}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="param-label">人声</label>
          <button
            type="button"
            onClick={() => setHasVocals(!hasVocals)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              hasVocals
                ? "bg-[#1DB954] text-black"
                : "bg-[#282828] text-[#B3B3B3] border border-[#2F2F2F]"
            }`}
          >
            <Mic className="w-4 h-4" />
            {hasVocals ? "包含人声" : "纯音乐"}
          </button>
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 mt-4 text-sm text-surface-500 hover:text-surface-700 transition-colors"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          高级参数
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-surface-200">
            <div>
              <label className="param-label">创意度</label>
              <input
                type="range"
                value={creativityLevel}
                onChange={(e) => setCreativityLevel(Number(e.target.value))}
                className="w-full"
                min={0}
                max={1}
                step={0.05}
              />
              <span className="text-xs text-surface-500">{creativityLevel}</span>
            </div>
            <div>
              <label className="param-label">上下文深度</label>
              <select
                value={contextDepth}
                onChange={(e) => setContextDepth(e.target.value)}
                className="input-field"
              >
                <option value="shallow">浅层</option>
                <option value="medium">中等</option>
                <option value="deep">深度</option>
              </select>
            </div>
            <div>
              <label className="param-label">LUFS 响度</label>
              <input
                type="number"
                value={lufs}
                onChange={(e) => setLufs(Number(e.target.value))}
                className="input-field"
                min={-70}
                max={0}
              />
            </div>
          </div>
        )}
      </div>

      <div className="dark-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <Hash className="w-5 h-5 text-brand-500" />
          <span className="section-title mb-0">风格标签 #</span>
          <span className="text-sm text-surface-400">
            已选 {selectedStyles.length} 个
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((style) => (
            <button
              key={style.id}
              onClick={() => toggleStyle(style.id)}
              className={selectedStyles.includes(style.id) ? "tag-selected" : "tag"}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dark-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-5 h-5 text-brand-500" />
          <span className="section-title mb-0">功能模块 $</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FUNCTION_MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => toggleModule(mod.id)}
              className={selectedModules.includes(mod.id) ? "tag-selected" : "tag"}
            >
              {mod.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dark-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <Percent className="w-5 h-5 text-brand-500" />
          <span className="section-title mb-0">质量控制 %</span>
        </div>
        <div className="flex gap-2">
          {QUALITY_LEVELS.map((q) => (
            <button
              key={q.id}
              onClick={() => setQuality(q.id)}
              className={quality === q.id ? "btn-primary-sm" : "px-4 py-2 rounded-btn-sm text-body-m font-medium bg-surface-100 text-surface-600 hover:bg-surface-200 transition-all duration-200"}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dark-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-brand-500" />
            <span className="section-title mb-0">协作创作</span>
          </div>
          {isCollaborating && (
            <div className="flex items-center gap-2 text-xs text-green-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>已连接</span>
            </div>
          )}
        </div>
        <CollabIndicator collaborators={collaborators} currentUserId={currentUserId} />
      </div>

      <div className="dark-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-brand-500" />
          <span className="section-title mb-0">创作指令</span>
        </div>
        <div className="relative">
          <textarea
            value={creativeInstruction}
            onChange={handleTextareaChange}
            className="input-field min-h-[120px] resize-y"
            placeholder="描述你的创作需求，例如：创作一首充满活力的流行歌曲，使用明亮的钢琴和合成器音色，副歌部分要有强烈的记忆点..."
          />
          {collaborators.map((collab) => (
            collab.cursor && (
              <CollabCursor
                key={collab.userId}
                userId={collab.userId}
                userName={collab.userName}
                color={collab.color}
                position={collab.cursor}
              />
            )
          ))}
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !creativeInstruction.trim()}
        className="btn-primary w-full text-base"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            生成 Prompt
          </>
        )}
      </button>
    </div>
  );
}