"use client";

import { useState, useCallback, useEffect } from "react";
import { globalEventBus, CREATION_STAGE_EVENTS, type CreationStage } from "@/lib/kernel/event-bus";

export function useCreationStage(initialStage: CreationStage = "input") {
  const [stage, setStage] = useState<CreationStage>(initialStage);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubStageChange = globalEventBus.subscribe(
      CREATION_STAGE_EVENTS.STAGE_CHANGE,
      (data) => {
        const parsed = data as { stage: CreationStage };
        setStage(parsed.stage);
      }
    );

    const unsubProgress = globalEventBus.subscribe(
      CREATION_STAGE_EVENTS.GENERATION_PROGRESS,
      (data) => {
        const parsed = data as { progress: number };
        setProgress(parsed.progress);
      }
    );

    const unsubError = globalEventBus.subscribe(
      CREATION_STAGE_EVENTS.GENERATION_ERROR,
      (data) => {
        const parsed = data as { error: string };
        setError(parsed.error);
      }
    );

    return () => {
      globalEventBus.unsubscribe(unsubStageChange);
      globalEventBus.unsubscribe(unsubProgress);
      globalEventBus.unsubscribe(unsubError);
    };
  }, []);

  const transitionTo = useCallback((newStage: CreationStage) => {
    setStage(newStage);
    setError(null);
    if (newStage !== "generating") setProgress(0);
    globalEventBus.publish(CREATION_STAGE_EVENTS.STAGE_CHANGE, { stage: newStage });
  }, []);

  const startGeneration = useCallback(() => {
    transitionTo("generating");
    globalEventBus.publish(CREATION_STAGE_EVENTS.GENERATION_START, {});
  }, [transitionTo]);

  const updateProgress = useCallback((p: number) => {
    setProgress(p);
    globalEventBus.publish(CREATION_STAGE_EVENTS.GENERATION_PROGRESS, { progress: p });
  }, []);

  const completeGeneration = useCallback(() => {
    transitionTo("editing");
    globalEventBus.publish(CREATION_STAGE_EVENTS.GENERATION_COMPLETE, {});
  }, [transitionTo]);

  const startExport = useCallback(() => {
    transitionTo("export");
    globalEventBus.publish(CREATION_STAGE_EVENTS.EXPORT_START, {});
  }, [transitionTo]);

  const resetToInput = useCallback(() => {
    transitionTo("input");
    setProgress(0);
    setError(null);
  }, [transitionTo]);

  return {
    stage,
    progress,
    error,
    transitionTo,
    startGeneration,
    updateProgress,
    completeGeneration,
    startExport,
    resetToInput,
  };
}
