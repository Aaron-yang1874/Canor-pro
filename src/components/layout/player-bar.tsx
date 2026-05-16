"use client";

import { useState } from "react";
import {
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Volume2,
  Music,
} from "lucide-react";

export function PlayerBar() {
  const [playing, setPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [progress, setProgress] = useState(30);
  const [volume, setVolume] = useState(70);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-[#181818] border-t border-[#2F2F2F] z-50 flex items-center px-4">
      <div className="flex items-center gap-3 w-[280px] min-w-[180px]">
        <div className="w-12 h-12 rounded bg-[#282828] flex items-center justify-center flex-shrink-0">
          <Music className="w-6 h-6 text-[#6A6A6A]" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-white truncate">未选择曲目</div>
          <div className="text-xs text-[#B3B3B3] truncate">Canor Player</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center gap-1 max-w-[600px] mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShuffle(!shuffle)}
            className={`btn-icon ${shuffle ? "!text-[#1DB954]" : ""}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button className="btn-icon">
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setPlaying(!playing)}
            className="w-btn-icon h-btn-icon rounded-btn-icon bg-white flex items-center justify-center hover:scale-105 transition-transform"
          >
            {playing ? (
              <Pause className="w-4 h-4 text-black" />
            ) : (
              <Play className="w-4 h-4 text-black ml-0.5" />
            )}
          </button>
          <button className="btn-icon">
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRepeat(!repeat)}
            className={`btn-icon ${repeat ? "!text-[#1DB954]" : ""}`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full">
          <span className="text-xs text-[#B3B3B3] w-10 text-right tabular-nums">
            1:30
          </span>
          <div className="flex-1 h-1 bg-[#2F2F2F] rounded-full group relative cursor-pointer">
            <div
              className="h-full bg-[#1DB954] rounded-full group-hover:bg-[#1ED760] transition-colors relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-xs text-[#B3B3B3] w-10 tabular-nums">
            5:00
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-[280px] min-w-[180px] justify-end">
        <div className="flex-1 h-8 hidden lg:flex items-center gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-[#1DB954] rounded-full animate-pulse"
              style={{
                height: `${Math.sin((i / 20) * Math.PI) * 24 + 8}px`,
                animationDelay: `${i * 0.05}s`,
                opacity: 0.6 + Math.sin((i / 20) * Math.PI) * 0.4,
              }}
            />
          ))}
        </div>
        <button className="btn-icon">
          <Volume2 className="w-4 h-4" />
        </button>
        <div className="w-24 h-1 bg-[#2F2F2F] rounded-full group relative cursor-pointer">
          <div
            className="h-full bg-white rounded-full group-hover:bg-[#1ED760] transition-colors relative"
            style={{ width: `${volume}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
}