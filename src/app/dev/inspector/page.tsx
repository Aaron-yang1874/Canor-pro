"use client";

import { useState, useEffect } from "react";
import { Bug, Play, Pause, Trash2, Clock, CheckCircle2, XCircle, Loader2, Circle } from "lucide-react";
import { inspector, PipelineStep, PipelineRecord } from "@/lib/devtools/inspector";

const PIPELINE_STEPS: PipelineStep[] = [
  { id: "parse", name: "解析", input: null, output: null, duration: 0, status: "pending" },
  { id: "assemble", name: "组装", input: null, output: null, duration: 0, status: "pending" },
  { id: "audit", name: "审核", input: null, output: null, duration: 0, status: "pending" },
  { id: "enhance", name: "增强", input: null, output: null, duration: 0, status: "pending" },
  { id: "optimize", name: "优化", input: null, output: null, duration: 0, status: "pending" },
  { id: "output", name: "输出", input: null, output: null, duration: 0, status: "pending" },
];

export default function InspectorPage() {
  const [records, setRecords] = useState<PipelineRecord[]>([]);
  const [breakpoints, setBreakpoints] = useState<Set<string>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const [pausedStepId, setPausedStepId] = useState<string | null>(null);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = inspector.subscribe((state) => {
      setRecords([...state.records]);
      setBreakpoints(new Set(state.breakpoints));
      setIsPaused(state.isPaused);
      setPausedStepId(state.pausedStepId);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleBreakpoint = (stepId: string) => {
    if (breakpoints.has(stepId)) {
      inspector.clearBreakpoint(stepId);
    } else {
      inspector.setBreakpoint(stepId);
    }
  };

  const handleRunPipeline = async () => {
    const steps = PIPELINE_STEPS.map((step) => ({
      ...step,
      input: { type: "user_prompt", content: "示例 Prompt 输入内容" },
      output: { type: "processed", content: `处理后的 ${step.name} 结果` },
      duration: Math.floor(Math.random() * 100) + 10,
      status: "completed" as const,
    }));

    await inspector.interceptPipeline(steps);
  };

  const handleClearRecords = () => {
    inspector.clearRecords();
  };

  const handleResume = () => {
    inspector.resume();
  };

  const handleToggleRecord = (recordId: string) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedRecords(newExpanded);
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusIcon = (status: PipelineStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "running":
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <Circle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Bug className="w-7 h-7 text-[#1DB954]" />
            <h1 className="text-2xl font-bold text-white">Prompt Inspector</h1>
            <span className="text-sm text-[#B3B3B3] bg-[#282828] px-3 py-1 rounded-full">
              调试面板
            </span>
          </div>
          <p className="text-[#B3B3B3]">实时监控 Prompt 构建流水线，追踪每一步的执行状态</p>
        </div>
        <div className="flex items-center gap-3">
          {isPaused && (
            <button onClick={handleResume} className="btn-primary-md">
              <Play className="w-4 h-4" />
              继续
            </button>
          )}
          <button onClick={handleClearRecords} className="btn-secondary text-sm">
            <Trash2 className="w-4 h-4" />
            清空记录
          </button>
        </div>
      </div>

      <div className="dark-panel p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">流水线预览</h2>
          <button
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="hidden max-md:block btn-ghost text-sm"
          >
            {isMobileExpanded ? "收起" : "展开"}
          </button>
        </div>

        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 ${isMobileExpanded ? "" : "hidden md:grid"}`}>
          {PIPELINE_STEPS.map((step) => (
            <div
              key={step.id}
              className="bg-[#282828] border border-[#2F2F2F] rounded-xl p-4 text-center"
            >
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(step.status)}
              </div>
              <div className="text-white font-medium mb-2">{step.name}</div>
              <button
                onClick={() => handleToggleBreakpoint(step.id)}
                className={`text-xs px-3 py-1 rounded-full transition-all ${
                  breakpoints.has(step.id)
                    ? "bg-red-500/20 text-red-400 border border-red-500"
                    : "bg-[#333333] text-[#B3B3B3] border border-[#444444] hover:bg-[#404040]"
                }`}
              >
                {breakpoints.has(step.id) ? "断点" : "设置断点"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button onClick={handleRunPipeline} className="btn-primary-md" disabled={isPaused}>
            <Play className="w-4 h-4" />
            运行流水线
          </button>
        </div>
      </div>

      {isPaused && pausedStepId && (
        <div className="dark-panel p-4 mb-6 border-l-4 border-yellow-500 bg-yellow-500/10">
          <div className="flex items-center gap-3">
            <Pause className="w-5 h-5 text-yellow-500" />
            <span className="text-yellow-400 font-medium">
              流水线已暂停于: {PIPELINE_STEPS.find((s) => s.id === pausedStepId)?.name}
            </span>
            <button onClick={handleResume} className="ml-auto btn-primary-sm">
              继续执行
            </button>
          </div>
        </div>
      )}

      <div className="dark-panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">执行记录</h2>
          <span className="text-sm text-[#B3B3B3]">{records.length} 条记录</span>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-[#6A6A6A] mx-auto mb-4" />
            <p className="text-[#6A6A6A]">暂无执行记录</p>
            <p className="text-sm text-[#6A6A6A] mt-1">点击「运行流水线」开始调试</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="bg-[#282828] border border-[#2F2F2F] rounded-xl overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#333333] transition-colors"
                  onClick={() => handleToggleRecord(record.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#B3B3B3]">{formatTime(record.timestamp)}</span>
                    <span className="text-white font-medium">{record.steps.length} 步</span>
                    <span className="text-sm text-[#B3B3B3]">总耗时: {formatDuration(record.totalDuration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      record.steps.every(s => s.status === "completed")
                        ? "bg-green-500/20 text-green-400"
                        : record.steps.some(s => s.status === "error")
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {record.steps.every(s => s.status === "completed") ? "完成" : 
                       record.steps.some(s => s.status === "error") ? "错误" : "进行中"}
                    </span>
                  </div>
                </div>

                {expandedRecords.has(record.id) && (
                  <div className="border-t border-[#2F2F2F] p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {record.steps.map((step) => (
                        <div
                          key={step.id}
                          className="bg-[#181818] border border-[#2F2F2F] rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(step.status)}
                              <span className="text-white font-medium text-sm">{step.name}</span>
                            </div>
                            <span className="text-xs text-[#B3B3B3]">{formatDuration(step.duration)}</span>
                          </div>
                          
                          {step.input && (
                            <div className="mb-2">
                              <div className="text-xs text-[#B3B3B3] mb-1">输入:</div>
                              <pre className="text-xs text-[#888888] bg-[#0a0a0a] rounded p-2 overflow-x-auto max-h-20">
                                {JSON.stringify(step.input, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          {step.output && (
                            <div>
                              <div className="text-xs text-[#B3B3B3] mb-1">输出:</div>
                              <pre className="text-xs text-[#888888] bg-[#0a0a0a] rounded p-2 overflow-x-auto max-h-20">
                                {JSON.stringify(step.output, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
