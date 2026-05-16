"use client";

import { useState, useEffect } from "react";
import { Disc, Play, Pause, Trash2, Music, Clock, Tag, Heart } from "lucide-react";

interface LibraryTrack {
  id: string;
  name: string;
  style: string;
  duration: number;
  createdAt: string;
  prompt: string;
  favorite: boolean;
}

export default function LibraryPage() {
  const [tracks, setTracks] = useState<LibraryTrack[]>([]);
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  useEffect(() => {
    const stored = localStorage.getItem("canor_library");
    if (stored) {
      try {
        setTracks(JSON.parse(stored));
      } catch {
        localStorage.removeItem("canor_library");
      }
    }
  }, []);

  const saveTracks = (updated: LibraryTrack[]) => {
    setTracks(updated);
    localStorage.setItem("canor_library", JSON.stringify(updated));
  };

  const toggleFavorite = (id: string) => {
    const updated = tracks.map((t) =>
      t.id === id ? { ...t, favorite: !t.favorite } : t
    );
    saveTracks(updated);
  };

  const handleDelete = (id: string) => {
    const updated = tracks.filter((t) => t.id !== id);
    saveTracks(updated);
  };

  const handleClearAll = () => {
    saveTracks([]);
  };

  const filteredTracks = filter === "favorites"
    ? tracks.filter((t) => t.favorite)
    : tracks;

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
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
            <Disc className="w-7 h-7 text-brand-500" />
            <h1 className="text-2xl font-bold text-surface-900">
              我的曲库
            </h1>
            <span className="text-sm text-surface-400">
              {tracks.length} 首作品
            </span>
          </div>
          <p className="text-surface-500">
            管理你收藏和生成的音乐作品
          </p>
        </div>
        {tracks.length > 0 && (
          <button onClick={handleClearAll} className="btn-secondary text-sm">
            <Trash2 className="w-4 h-4" />
            清空曲库
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === "all"
              ? "bg-brand-600 text-white"
              : "bg-surface-100 text-surface-600 hover:bg-surface-200"
          }`}
        >
          全部 ({tracks.length})
        </button>
        <button
          onClick={() => setFilter("favorites")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            filter === "favorites"
              ? "bg-brand-600 text-white"
              : "bg-surface-100 text-surface-600 hover:bg-surface-200"
          }`}
        >
          <Heart className="w-4 h-4 inline mr-1" />
          收藏 ({tracks.filter((t) => t.favorite).length})
        </button>
      </div>

      {filteredTracks.length === 0 ? (
        <div className="dark-panel p-12 text-center">
          <Disc className="w-16 h-16 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-500 mb-2">
            {filter === "favorites" ? "暂无收藏作品" : "曲库为空"}
          </h3>
          <p className="text-sm text-surface-400 max-w-sm mx-auto">
            {filter === "favorites"
              ? "点击作品旁的心形图标将其添加到收藏"
              : "前往「创作工坊」生成 AI 音乐创作 Prompt，完成的作品将保存在这里"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTracks.map((track) => (
            <div
              key={track.id}
              className="dark-panel p-4 flex items-center gap-4 group hover:bg-surface-50/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-900/20 flex items-center justify-center flex-shrink-0">
                <Music className="w-5 h-5 text-brand-400" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-surface-900 truncate">
                  {track.name}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-surface-500 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {track.style}
                  </span>
                  <span className="text-xs text-surface-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(track.duration)}
                  </span>
                  <span className="text-xs text-surface-400">
                    {formatDate(track.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavorite(track.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    track.favorite
                      ? "text-red-500 hover:text-red-600"
                      : "text-surface-400 hover:text-surface-600"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${track.favorite ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() => handleDelete(track.id)}
                  className="p-2 rounded-lg text-surface-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
