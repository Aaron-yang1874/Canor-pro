"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Image, Music, Video, Type, X } from "lucide-react";
import type { ModalityType } from "@/lib/types";

interface MultimodalInputProps {
  onInputChange: (data: { modality: ModalityType; data: string; file?: File }) => void;
  activeModality: ModalityType;
  onModalityChange: (modality: ModalityType) => void;
}

const MODALITY_TABS: { id: ModalityType; label: string; icon: typeof Type; accept: string }[] = [
  { id: "text", label: "文本", icon: Type, accept: "" },
  { id: "image", label: "图片", icon: Image, accept: "image/*" },
  { id: "audio", label: "音频", icon: Music, accept: "audio/*" },
  { id: "video", label: "视频", icon: Video, accept: "video/*" },
];

export function MultimodalInput({ onInputChange, activeModality, onModalityChange }: MultimodalInputProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [textValue, setTextValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        onInputChange({ modality: activeModality, data: dataUrl, file });
      };
      reader.readAsDataURL(file);
    },
    [activeModality, onInputChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleTextChange = (value: string) => {
    setTextValue(value);
    onInputChange({ modality: "text", data: value });
  };

  const clearInput = () => {
    setPreview(null);
    setTextValue("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onInputChange({ modality: activeModality, data: "" });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 p-1 bg-[#282828] rounded-xl">
        {MODALITY_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onModalityChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 h-btn-sm rounded-btn-sm text-body-m font-medium transition-all duration-200 ${
                activeModality === tab.id
                  ? "bg-[#1DB954] text-black"
                  : "text-[#B3B3B3] hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeModality === "text" ? (
        <textarea
          value={textValue}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="描述你想要的音乐风格、情绪、乐器..."
          className="w-full min-h-[120px] px-4 py-3 bg-[#282828] border border-[#2F2F2F] rounded-xl text-white placeholder:text-[#6A6A6A] resize-y focus:outline-none focus:border-[#1DB954] transition-colors"
        />
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
            dragOver
              ? "border-[#1DB954] bg-[#1DB954]/10"
              : "border-[#2F2F2F] hover:border-[#4A4A4A]"
          }`}
        >
          {preview ? (
            <div className="space-y-3">
              {activeModality === "image" && (
                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
              )}
              {activeModality === "audio" && (
                <div className="flex items-center justify-center gap-2 text-[#1DB954]">
                  <Music className="w-12 h-12" />
                  <span className="text-sm text-[#B3B3B3]">音频已加载</span>
                </div>
              )}
              {activeModality === "video" && (
                <div className="flex items-center justify-center gap-2 text-[#1DB954]">
                  <Video className="w-12 h-12" />
                  <span className="text-sm text-[#B3B3B3]">视频已加载</span>
                </div>
              )}
              <button onClick={clearInput} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-[#B3B3B3] hover:text-white bg-[#282828] rounded-lg transition-colors">
                <X className="w-3.5 h-3.5" /> 清除
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className={`w-10 h-10 mx-auto ${dragOver ? "text-[#1DB954]" : "text-[#6A6A6A]"}`} />
              <p className="text-sm text-[#B3B3B3]">拖拽文件到此处，或点击选择</p>
              <p className="text-xs text-[#6A6A6A]">
                支持 {activeModality === "image" ? "JPG/PNG/WebP" : activeModality === "audio" ? "MP3/WAV/FLAC" : "MP4/MOV/WebM"} 格式
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary-sm mt-2"
              >
                选择文件
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={MODALITY_TABS.find((t) => t.id === activeModality)?.accept}
            onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); }}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}