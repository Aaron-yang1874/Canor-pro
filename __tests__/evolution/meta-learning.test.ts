import {
  initializeMetaLearningState,
  sampleTask,
  innerLoopAdapt,
  outerLoopMetaUpdate,
  ewcPenalty,
  loraUpdate,
  computeConvergenceScore,
  updateMetaLearningState,
} from "@/lib/evolution/meta-learning";
import type { MetaLearningState, EvolutionConfig } from "@/lib/types";

describe("Meta Learning Module", () => {
  describe("initializeMetaLearningState", () => {
    test("returns valid initial state", () => {
      const state = initializeMetaLearningState();
      expect(state).toHaveProperty("taskDistribution");
      expect(state).toHaveProperty("adaptedParameters");
      expect(state).toHaveProperty("metaGradient");
      expect(state).toHaveProperty("innerLoopSteps");
      expect(state).toHaveProperty("outerLoopSteps");
      expect(state).toHaveProperty("currentEpoch");
      expect(state).toHaveProperty("convergenceScore");
    });

    test("sets correct default values", () => {
      const state = initializeMetaLearningState();
      expect(state.innerLoopSteps).toBe(5);
      expect(state.outerLoopSteps).toBe(10);
      expect(state.currentEpoch).toBe(0);
      expect(state.convergenceScore).toBe(0);
    });
  });

  describe("sampleTask", () => {
    test("returns a task from distribution", () => {
      const tasks = ["task1", "task2", "task3"];
      const result = sampleTask(tasks);
      expect(tasks).toContain(result);
    });

    test("handles single task", () => {
      const tasks = ["onlyTask"];
      const result = sampleTask(tasks);
      expect(result).toBe("onlyTask");
    });

    test("handles empty distribution", () => {
      const tasks: string[] = [];
      const result = sampleTask(tasks);
      expect(result).toBeUndefined();
    });
  });

  describe("innerLoopAdapt", () => {
    test("returns adapted parameters", () => {
      const params = { weight1: 1.0, weight2: 2.0 };
      const result = innerLoopAdapt(params, 0.1, 5);
      expect(result).toHaveProperty("weight1");
      expect(result).toHaveProperty("weight2");
    });

    test("modifies parameter values", () => {
      const params = { weight: 1.0 };
      const result = innerLoopAdapt(params, 0.1, 5);
      expect(typeof result.weight).toBe("number");
    });

    test("handles empty parameters", () => {
      const params: Record<string, number> = {};
      const result = innerLoopAdapt(params, 0.1, 5);
      expect(Object.keys(result)).toHaveLength(0);
    });

    test("returns new object without mutating original", () => {
      const params = { weight: 1.0 };
      const result = innerLoopAdapt(params, 0.1, 5);
      expect(result).not.toBe(params);
    });

    test("applies learning rate to adaptation", () => {
      const params = { w: 0.0 };
      const result = innerLoopAdapt(params, 0.01, 5);
      expect(result.w).toBeDefined();
    });
  });

  describe("outerLoopMetaUpdate", () => {
    test("returns meta gradients", () => {
      const metaGradient = [0.1, 0.2, 0.3];
      const taskLosses = [1.0, 2.0, 3.0];
      const result = outerLoopMetaUpdate(metaGradient, taskLosses, 0.01);
      expect(result).toHaveLength(metaGradient.length);
    });

    test("returns array of numbers", () => {
      const metaGradient = [0.5, -0.5, 0.1];
      const taskLosses = [1.0, 2.0, 3.0];
      const result = outerLoopMetaUpdate(metaGradient, taskLosses, 0.1);
      result.forEach((g) => {
        expect(typeof g).toBe("number");
      });
    });

    test("handles empty arrays", () => {
      const metaGradient: number[] = [];
      const taskLosses: number[] = [];
      const result = outerLoopMetaUpdate(metaGradient, taskLosses, 0.1);
      expect(result).toHaveLength(0);
    });

    test("applies beta parameter", () => {
      const metaGradient = [1.0, 1.0, 1.0];
      const taskLosses = [1.0, 1.0, 1.0];
      const result1 = outerLoopMetaUpdate(metaGradient, taskLosses, 0.1);
      const result2 = outerLoopMetaUpdate(metaGradient, taskLosses, 0.0);
      expect(result1).not.toEqual(result2);
    });
  });

  describe("ewcPenalty", () => {
    test("calculates penalty for changed parameters", () => {
      const current = { w1: 2.0, w2: 3.0 };
      const previous = { w1: 1.0, w2: 1.0 };
      const penalty = ewcPenalty(current, previous, 1.0);
      expect(penalty).toBeGreaterThan(0);
    });

    test("returns zero when parameters unchanged", () => {
      const params = { w1: 1.0, w2: 2.0 };
      const penalty = ewcPenalty(params, params, 1.0);
      expect(penalty).toBe(0);
    });

    test("scales with importance parameter", () => {
      const current = { w: 2.0 };
      const previous = { w: 1.0 };
      const penalty1 = ewcPenalty(current, previous, 1.0);
      const penalty2 = ewcPenalty(current, previous, 2.0);
      expect(penalty2).toBe(penalty1 * 2);
    });

    test("handles missing keys in previous params", () => {
      const current = { w1: 2.0, w2: 2.0 };
      const previous = { w1: 1.0 };
      const penalty = ewcPenalty(current, previous, 1.0);
      expect(penalty).toBeGreaterThan(0);
    });

    test("handles empty parameters", () => {
      const penalty = ewcPenalty({}, {}, 1.0);
      expect(penalty).toBe(0);
    });
  });

  describe("loraUpdate", () => {
    test("updates weights based on gradients", () => {
      const weights = [1.0, 2.0, 3.0];
      const gradients = [0.1, 0.2, 0.3];
      const result = loraUpdate(weights, gradients, 4, 0.1);
      expect(result).toHaveLength(weights.length);
    });

    test("returns array of numbers", () => {
      const weights = [1.0, 2.0];
      const gradients = [0.1, 0.2];
      const result = loraUpdate(weights, gradients, 2, 0.1);
      result.forEach((w) => {
        expect(typeof w).toBe("number");
      });
    });

    test("handles different ranks", () => {
      const weights = [1.0, 2.0];
      const gradients = [0.1, 0.2];
      const result1 = loraUpdate(weights, gradients, 2, 0.1);
      const result2 = loraUpdate(weights, gradients, 4, 0.1);
      expect(result1).not.toEqual(result2);
    });
  });

  describe("computeConvergenceScore", () => {
    test("returns 0 for empty history", () => {
      const score = computeConvergenceScore([]);
      expect(score).toBe(0);
    });

    test("returns 0 for single element", () => {
      const score = computeConvergenceScore([1.0]);
      expect(score).toBe(0);
    });

    test("returns higher score for stable loss", () => {
      const stableLoss = [1.0, 1.0, 1.0, 1.0, 1.0];
      const volatileLoss = [1.0, 2.0, 1.0, 2.0, 1.0];
      const stableScore = computeConvergenceScore(stableLoss);
      const volatileScore = computeConvergenceScore(volatileLoss);
      expect(stableScore).toBeGreaterThan(volatileScore);
    });
  });

  describe("updateMetaLearningState", () => {
    test("increments current epoch", () => {
      const state: MetaLearningState = initializeMetaLearningState();
      const config: EvolutionConfig = {
        enableEvolution: true,
        adaptationRate: 0.1,
        mutationProbability: 0.1,
      };
      const result = updateMetaLearningState(state, config, 1.0);
      expect(result.currentEpoch).toBe(state.currentEpoch + 1);
    });

    test("updates convergence score", () => {
      const state: MetaLearningState = initializeMetaLearningState();
      const config: EvolutionConfig = {
        enableEvolution: true,
        adaptationRate: 0.1,
        mutationProbability: 0.1,
      };
      const result = updateMetaLearningState(state, config, 1.0);
      expect(result.convergenceScore).toBeDefined();
    });

    test("preserves other state properties", () => {
      const state: MetaLearningState = {
        ...initializeMetaLearningState(),
        innerLoopSteps: 10,
        outerLoopSteps: 20,
      };
      const config: EvolutionConfig = {
        enableEvolution: true,
        adaptationRate: 0.1,
        mutationProbability: 0.1,
      };
      const result = updateMetaLearningState(state, config, 1.0);
      expect(result.innerLoopSteps).toBe(10);
      expect(result.outerLoopSteps).toBe(20);
    });
  });
});
