"use client";

import { useState, useEffect, useRef } from "react";
import { PianoRollCanvas } from "@/components/visualization/piano-roll-canvas";
import { MidiDetailPanel } from "@/components/visualization/midi-detail-panel";
import { NoteBlock } from "@/lib/visualization/piano-roll";
import { AISuggestion } from "@/lib/visualization/ai-suggestion";
import {
  Layers,
  Music2,
  Wand2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface Track {
  id: string;
  name: string;
  instrument: string;
  color: string;
  notes: NoteBlock[];
}

function getSuggestionNoteName(pitch: number): string {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(pitch / 12) - 1;
  const note = noteNames[pitch % 12];
  return `${note}${octave}`;
}

export default function WorkspacePage() {
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: "track-1",
      name: "Piano",
      instrument: "Acoustic Grand Piano",
      color: "#1DB954",
      notes: [
        { id: "n1", pitch: 60, startTime: 0, duration: 1, velocity: 80, trackId: "track-1" },
        { id: "n2", pitch: 64, startTime: 1, duration: 1, velocity: 75, trackId: "track-1" },
        { id: "n3", pitch: 67, startTime: 2, duration: 1, velocity: 85, trackId: "track-1" },
      ],
    },
    {
      id: "track-2",
      name: "Bass",
      instrument: "Electric Bass",
      color: "#ff6b6b",
      notes: [
        { id: "n4", pitch: 36, startTime: 0, duration: 2, velocity: 90, trackId: "track-2" },
        { id: "n5", pitch: 38, startTime: 2, duration: 2, velocity: 85, trackId: "track-2" },
      ],
    },
    {
      id: "track-3",
      name: "Drums",
      instrument: "Standard Drum Kit",
      color: "#4a9eff",
      notes: [
        { id: "n6", pitch: 42, startTime: 0, duration: 0.5, velocity: 100, trackId: "track-3" },
        { id: "n7", pitch: 42, startTime: 1, duration: 0.5, velocity: 95, trackId: "track-3" },
      ],
    },
  ]);

  const [selectedTrack, setSelectedTrack] = useState<string | null>("track-1");
  const [selectedNote, setSelectedNote] = useState<NoteBlock | null>(null);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([
    {
      id: "sug-1",
      noteId: "n1",
      type: "modify",
      confidence: 0.92,
      reason: "建议增加力度以增强节奏感",
      targetNote: { pitch: 60, startTime: 0, duration: 1, velocity: 95 },
    },
    {
      id: "sug-2",
      noteId: "",
      type: "add",
      confidence: 0.87,
      reason: "建议在第4小节添加过渡音符",
      targetNote: { pitch: 65, startTime: 3, duration: 1, velocity: 70 },
    },
  ]);

  const [zoom, setZoom] = useState(1);

  const currentNotes = selectedTrack
    ? tracks.find((t) => t.id === selectedTrack)?.notes || []
    : [];

  const handleNoteClick = (note: NoteBlock) => {
    setSelectedNote(note);
  };

  const handleAcceptSuggestion = (suggestion: AISuggestion) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    if (suggestion.targetNote && selectedTrack) {
      setTracks((prev) =>
        prev.map((track) =>
          track.id === selectedTrack
            ? {
                ...track,
                notes: [
                  ...track.notes,
                  {
                    id: `new-${Date.now()}`,
                    pitch: suggestion.targetNote!.pitch!,
                    startTime: suggestion.targetNote!.startTime!,
                    duration: suggestion.targetNote!.duration!,
                    velocity: suggestion.targetNote!.velocity!,
                    trackId: track.id,
                    isAiSuggestion: true,
                  },
                ],
              }
            : track
        )
      );
    }
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
  };

  return (
    <div className="flex h-screen bg-[#121212] text-white overflow-hidden">
      <div
        className="w-64 bg-[#181818] border-r border-[#282828] flex flex-col"
        style={{ height: "calc(100vh - 80px)" }}
      >
        <div className="p-4 border-b border-[#282828]">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#1DB954]" />
            音轨列表
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {tracks.map((track) => (
            <div
              key={track.id}
              onClick={() => setSelectedTrack(track.id)}
              className={`p-3 rounded-lg mb-2 cursor-pointer transition-all ${
                selectedTrack === track.id
                  ? "bg-[#282828] border-l-4 border-[#1DB954]"
                  : "hover:bg-[#242424]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: track.color }}
                />
                <span className="font-medium">{track.name}</span>
              </div>
              <div className="text-xs text-[#B3B3B3]">{track.instrument}</div>
              <div className="text-xs text-[#666] mt-1">
                {track.notes.length} 个音符
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#282828]">
          <button className="w-full py-2 px-4 bg-[#1DB954] hover:bg-[#1ED760] text-black rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
            <Music2 className="w-4 h-4" />
            添加音轨
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-12 bg-[#181818] border-b border-[#282828] flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[#282828] rounded transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium">小节 1-16</span>
            <button className="p-2 hover:bg-[#282828] rounded transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              className="p-2 hover:bg-[#282828] rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
              className="p-2 hover:bg-[#282828] rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <PianoRollCanvas
              notes={currentNotes}
              width={1200}
              height={600}
              onNoteClick={handleNoteClick}
              zoom={zoom}
            />
          </div>

          <div className="w-80 border-l border-[#282828] overflow-y-auto">
            <MidiDetailPanel selectedNote={selectedNote} />
          </div>
        </div>
      </div>

      <div
        className="w-80 bg-[#181818] border-l border-[#282828] flex flex-col"
        style={{ height: "calc(100vh - 80px)" }}
      >
        <div className="p-4 border-b border-[#282828]">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-[#1ED760]" />
            AI 编曲建议
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {suggestions.length === 0 ? (
            <div className="text-center text-[#666] py-8">
              暂无建议
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-[#242424] rounded-lg p-4 mb-3 border border-[#333]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      suggestion.type === "add"
                        ? "bg-[#1ED760]/20 text-[#1ED760]"
                        : suggestion.type === "delete"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {suggestion.type === "add"
                      ? "添加"
                      : suggestion.type === "delete"
                      ? "删除"
                      : "修改"}
                  </span>
                  <span className="text-xs text-[#666]">
                    置信度 {Math.round(suggestion.confidence * 100)}%
                  </span>
                </div>

                {suggestion.reason && (
                  <p className="text-sm text-[#B3B3B3] mb-3">
                    {suggestion.reason}
                  </p>
                )}

                {suggestion.targetNote && (
                  <div className="text-xs text-[#666] mb-3 space-y-1">
                    <div>
                      音高:{" "}
                      {suggestion.targetNote.pitch !== undefined
                        ? getSuggestionNoteName(suggestion.targetNote.pitch)
                        : "N/A"}
                    </div>
                    <div>力度: {suggestion.targetNote.velocity || "N/A"}</div>
                    <div>时长: {suggestion.targetNote.duration || "N/A"}</div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    className="flex-1 py-2 px-3 bg-[#1DB954] hover:bg-[#1ED760] text-black rounded text-sm font-medium transition-colors"
                  >
                    采纳
                  </button>
                  <button
                    onClick={() => handleRejectSuggestion(suggestion.id)}
                    className="flex-1 py-2 px-3 bg-[#333] hover:bg-[#444] rounded text-sm font-medium transition-colors"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-[#282828]">
          <button className="w-full py-2 px-4 bg-[#1ED760] hover:bg-[#1DB954] text-black rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
            <Wand2 className="w-4 h-4" />
            生成新建议
          </button>
        </div>
      </div>
    </div>
  );
}
