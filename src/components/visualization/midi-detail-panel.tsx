"use client";

import { NoteBlock } from "@/lib/visualization/piano-roll";
import { Music2, Clock, Gauge, Disc, AlertCircle } from "lucide-react";

interface MidiDetailPanelProps {
  selectedNote: NoteBlock | null;
}

export function MidiDetailPanel({ selectedNote }: MidiDetailPanelProps) {
  const getNoteName = (pitch: number): string => {
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = Math.floor(pitch / 12) - 1;
    const noteName = noteNames[pitch % 12];
    return `${noteName}${octave}`;
  };

  const getVelocityLabel = (velocity: number): string => {
    if (velocity < 32) return "很弱";
    if (velocity < 64) return "弱";
    if (velocity < 96) return "中";
    if (velocity < 112) return "强";
    return "很强";
  };

  const getDurationLabel = (duration: number): string => {
    if (duration < 0.25) return "十六分音符";
    if (duration < 0.5) return "八分音符";
    if (duration < 1) return "四分音符";
    if (duration < 2) return "二分音符";
    return "全音符";
  };

  if (!selectedNote) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-[#282828]">
          <h3 className="font-semibold flex items-center gap-2">
            <Music2 className="w-4 h-4 text-[#1DB954]" />
            音符详情
          </h3>
        </div>

        <div className="flex-1 flex items-center justify-center text-[#666]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>选择音符以查看详情</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[#282828]">
        <h3 className="font-semibold flex items-center gap-2">
          <Music2 className="w-4 h-4 text-[#1DB954]" />
          音符详情
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-[#242424] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Disc className="w-4 h-4 text-[#1DB954]" />
            <span className="text-sm font-medium text-[#B3B3B3]">基本信息</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666]">音符 ID</span>
              <span className="text-sm font-mono">{selectedNote.id}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666]">音高</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{getNoteName(selectedNote.pitch)}</span>
                <span className="text-xs text-[#666]">({selectedNote.pitch})</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666]">MIDI 编号</span>
              <span className="text-sm">{selectedNote.pitch}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#242424] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-[#4a9eff]" />
            <span className="text-sm font-medium text-[#B3B3B3]">时间信息</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666]">开始时间</span>
              <span className="text-sm">{selectedNote.startTime.toFixed(2)} s</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666]">持续时间</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{selectedNote.duration.toFixed(2)} s</span>
                <span className="text-xs text-[#1DB954]">
                  ({getDurationLabel(selectedNote.duration)})
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666]">结束时间</span>
              <span className="text-sm">
                {(selectedNote.startTime + selectedNote.duration).toFixed(2)} s
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#242424] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-4 h-4 text-[#ff6b6b]" />
            <span className="text-sm font-medium text-[#B3B3B3]">力度</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666]">力度值</span>
              <span className="text-sm font-bold">{selectedNote.velocity}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#666]">力度等级</span>
              <span className="text-sm text-[#1DB954]">
                {getVelocityLabel(selectedNote.velocity)}
              </span>
            </div>

            <div>
              <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4a9eff] via-[#1DB954] to-[#ff6b6b] transition-all"
                  style={{ width: `${(selectedNote.velocity / 127) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#666] mt-1">
                <span>0</span>
                <span>64</span>
                <span>127</span>
              </div>
            </div>
          </div>
        </div>

        {selectedNote.isAiSuggestion && (
          <div className="bg-[#1ED760]/10 border border-[#1ED760]/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-[#1ED760] rounded-full animate-pulse" />
              <span className="text-sm font-medium text-[#1ED760]">AI 建议音符</span>
            </div>
            <p className="text-xs text-[#B3B3B3]">
              此音符由 AI 生成，可根据需要采纳或修改
            </p>
          </div>
        )}

        <div className="bg-[#242424] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Music2 className="w-4 h-4 text-[#ffaa00]" />
            <span className="text-sm font-medium text-[#B3B3B3]">所属音轨</span>
          </div>

          <div className="text-sm">{selectedNote.trackId}</div>
        </div>
      </div>

      <div className="p-4 border-t border-[#282828] space-y-2">
        <button className="w-full py-2 px-4 bg-[#1DB954] hover:bg-[#1ED760] text-black rounded-lg font-medium transition-colors">
          编辑音符
        </button>
        <button className="w-full py-2 px-4 bg-[#333] hover:bg-[#444] rounded-lg font-medium transition-colors">
          删除音符
        </button>
      </div>
    </div>
  );
}
