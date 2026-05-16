"use client";

import { useEffect, useState } from "react";
import { globalEventBus, CREATION_STAGE_EVENTS, type CreationStage } from "@/lib/kernel/event-bus";
import { Info, Sliders, FileAudio, Settings } from "lucide-react";

interface PropertyPanelProps {
  title?: string;
  children?: React.ReactNode;
}

const STAGE_INFO: Record<CreationStage, { icon: typeof Info; label: string; description: string }> = {
  input: { icon: Info, label: "创作设置", description: "配置音乐创作参数" },
  generating: { icon: Settings, label: "生成中", description: "AI 正在创作你的音乐" },
  editing: { icon: Sliders, label: "编辑属性", description: "调整音轨和效果参数" },
  export: { icon: FileAudio, label: "导出选项", description: "选择格式并导出" },
};

export function PropertyPanel({ title, children }: PropertyPanelProps) {
  const [stage, setStage] = useState<CreationStage>("input");

  useEffect(() => {
    const unsub = globalEventBus.subscribe(
      CREATION_STAGE_EVENTS.STAGE_CHANGE,
      (data) => {
        setStage((data as { stage: CreationStage }).stage);
      }
    );
    return () => { globalEventBus.unsubscribe(unsub); };
  }, []);

  const stageInfo = STAGE_INFO[stage];
  const StageIcon = stageInfo.icon;

  return (
    <aside className="w-[320px] bg-[#121212] border-l border-[#2F2F2F] flex flex-col h-full">
      <div className="px-md py-md border-b border-[#2F2F2F]">
        <div className="flex items-center gap-sm">
          <StageIcon className="w-4 h-4 text-[#1DB954]" />
          <h2 className="text-h4 text-white">{title || stageInfo.label}</h2>
        </div>
        <p className="text-body-s text-[#B3B3B3] mt-xs">{stageInfo.description}</p>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-md">
        {children || (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-sm">
            <div className="w-12 h-12 rounded-full bg-[#282828] flex items-center justify-center">
              <StageIcon className="w-6 h-6 text-[#6A6A6A]" />
            </div>
            <p className="text-body-m text-[#6A6A6A]">
              {stage === "input" && "开始创作以查看属性"}
              {stage === "generating" && "生成完成后可编辑"}
              {stage === "editing" && "选择音轨以编辑参数"}
              {stage === "export" && "选择导出格式"}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
