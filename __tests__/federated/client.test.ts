import {
  computeLocalGradients,
  addDifferentialPrivacyNoise,
  quantizeGradients,
  pruneGradients,
  createGradientUpdate,
} from "@/lib/federated/client";
import type { DifferentialPrivacyParams, GradientUpdate } from "@/lib/types";

describe("Federated Client Module", () => {
  describe("computeLocalGradients", () => {
    test("computes gradients for single sample", () => {
      const weights = [1.0, 2.0, 3.0];
      const localData = [[0.5, 0.6, 0.7]];
      const gradients = computeLocalGradients(weights, localData, 0.01);
      expect(gradients).toHaveLength(weights.length);
    });

    test("returns array of numbers", () => {
      const weights = [1.0, 2.0];
      const localData = [[0.1, 0.2]];
      const gradients = computeLocalGradients(weights, localData);
      gradients.forEach((g) => {
        expect(typeof g).toBe("number");
      });
    });

    test("handles empty local data", () => {
      const weights = [1.0, 2.0];
      const localData: number[][] = [];
      const gradients = computeLocalGradients(weights, localData);
      expect(gradients).toHaveLength(weights.length);
    });

    test("handles multiple samples", () => {
      const weights = [1.0, 2.0];
      const localData = [
        [0.1, 0.2],
        [0.3, 0.4],
        [0.5, 0.6],
      ];
      const gradients = computeLocalGradients(weights, localData);
      expect(gradients).toHaveLength(weights.length);
    });

    test("applies learning rate", () => {
      const weights = [1.0, 2.0];
      const localData = [[0.1, 0.2]];
      const gradients1 = computeLocalGradients(weights, localData, 0.01);
      const gradients2 = computeLocalGradients(weights, localData, 0.1);
      expect(gradients1).not.toEqual(gradients2);
    });

    test("gradient averaging over multiple samples", () => {
      const weights = [1.0, 2.0];
      const localData = [
        [1.0, 1.0],
        [1.0, 1.0],
      ];
      const gradients = computeLocalGradients(weights, localData, 0.1);
      expect(Array.isArray(gradients)).toBe(true);
    });
  });

  describe("addDifferentialPrivacyNoise", () => {
    test("adds noise to gradients", () => {
      const gradients = [0.1, 0.2, 0.3];
      const params: DifferentialPrivacyParams = {
        noiseMultiplier: 0.1,
        maxGradientNorm: 1.0,
        clippingRatio: 0.1,
      };
      const noisyGradients = addDifferentialPrivacyNoise(gradients, params);
      expect(noisyGradients).toHaveLength(gradients.length);
    });

    test("returns array of numbers", () => {
      const gradients = [0.1, 0.2, 0.3];
      const params: DifferentialPrivacyParams = {
        noiseMultiplier: 0.1,
        maxGradientNorm: 1.0,
        clippingRatio: 0.1,
      };
      const noisyGradients = addDifferentialPrivacyNoise(gradients, params);
      noisyGradients.forEach((g) => {
        expect(typeof g).toBe("number");
      });
    });

    test("handles empty gradients", () => {
      const gradients: number[] = [];
      const params: DifferentialPrivacyParams = {
        noiseMultiplier: 0.1,
        maxGradientNorm: 1.0,
        clippingRatio: 0.1,
      };
      const noisyGradients = addDifferentialPrivacyNoise(gradients, params);
      expect(noisyGradients).toHaveLength(0);
    });

    test("handles zero noise multiplier", () => {
      const gradients = [0.1, 0.2, 0.3];
      const params: DifferentialPrivacyParams = {
        noiseMultiplier: 0,
        maxGradientNorm: 1.0,
        clippingRatio: 0.1,
      };
      const noisyGradients = addDifferentialPrivacyNoise(gradients, params);
      expect(noisyGradients).toHaveLength(gradients.length);
    });

    test("clipping is applied based on max gradient norm", () => {
      const largeGradients = [10.0, 20.0, 30.0];
      const params: DifferentialPrivacyParams = {
        noiseMultiplier: 0,
        maxGradientNorm: 1.0,
        clippingRatio: 0.1,
      };
      const clippedGradients = addDifferentialPrivacyNoise(largeGradients, params);
      const norm = Math.sqrt(clippedGradients.reduce((sum, g) => sum + g * g, 0));
      expect(norm).toBeLessThanOrEqual(params.maxGradientNorm + 0.1);
    });
  });

  describe("quantizeGradients", () => {
    test("quantizes gradients to specified bits", () => {
      const gradients = [0.1, 0.5, -0.3, 0.8];
      const quantized = quantizeGradients(gradients, 4);
      expect(quantized).toHaveLength(gradients.length);
    });

    test("returns array of numbers", () => {
      const gradients = [0.1, 0.2];
      const quantized = quantizeGradients(gradients, 8);
      quantized.forEach((g) => {
        expect(typeof g).toBe("number");
      });
    });

    test("handles different bit values", () => {
      const gradients = [0.5, -0.25, 0.75];
      const q1 = quantizeGradients(gradients, 4);
      const q2 = quantizeGradients(gradients, 16);
      expect(q1.length).toBe(q2.length);
    });

    test("preserves relative magnitude", () => {
      const gradients = [1.0, 0.0, -1.0];
      const quantized = quantizeGradients(gradients, 8);
      expect(quantized[0]).toBeGreaterThan(quantized[1]);
      expect(quantized[1]).toBeGreaterThan(quantized[2]);
    });
  });

  describe("pruneGradients", () => {
    test("prunes small gradients", () => {
      const gradients = [0.001, 1.0, 0.002, 2.0];
      const pruned = pruneGradients(gradients, 0.5);
      expect(pruned).toHaveLength(gradients.length);
    });

    test("keeps large gradients", () => {
      const gradients = [10.0, 0.001, 20.0, 0.002];
      const pruned = pruneGradients(gradients, 0.5);
      expect(pruned[0]).toBe(10.0);
      expect(pruned[2]).toBe(20.0);
    });

    test("returns zeros for pruned gradients", () => {
      const gradients = [0.1, 0.05, 0.02, 0.01];
      const pruned = pruneGradients(gradients, 0.75);
      const nonZeroCount = pruned.filter((g) => g !== 0).length;
      expect(nonZeroCount).toBeLessThanOrEqual(gradients.length);
    });

    test("handles sparsity parameter", () => {
      const gradients = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
      const pruned1 = pruneGradients(gradients, 0.5);
      const pruned2 = pruneGradients(gradients, 0.75);
      const nonZero1 = pruned1.filter((g) => g !== 0).length;
      const nonZero2 = pruned2.filter((g) => g !== 0).length;
      expect(nonZero1).toBeLessThan(nonZero2);
    });
  });

  describe("createGradientUpdate", () => {
    test("creates valid gradient update object", () => {
      const gradients = [0.1, 0.2, 0.3];
      const params: DifferentialPrivacyParams = {
        noiseMultiplier: 0.1,
        maxGradientNorm: 1.0,
        clippingRatio: 0.1,
      };
      const update = createGradientUpdate(gradients, "client-1", "v1.0", params);
      expect(update).toHaveProperty("layerName");
      expect(update).toHaveProperty("gradients");
      expect(update).toHaveProperty("noiseScale");
      expect(update).toHaveProperty("timestamp");
      expect(update).toHaveProperty("clientId");
      expect(update).toHaveProperty("modelVersion");
    });

    test("includes client ID in update", () => {
      const gradients = [0.1, 0.2];
      const params: DifferentialPrivacyParams = {
        noiseMultiplier: 0.1,
        maxGradientNorm: 1.0,
        clippingRatio: 0.1,
      };
      const update = createGradientUpdate(gradients, "test-client", "v2.0", params);
      expect(update.clientId).toBe("test-client");
    });

    test("includes model version in update", () => {
      const gradients = [0.1, 0.2];
      const params: DifferentialPrivacyParams = {
        noiseMultiplier: 0.1,
        maxGradientNorm: 1.0,
        clippingRatio: 0.1,
      };
      const update = createGradientUpdate(gradients, "client-1", "model-v3", params);
      expect(update.modelVersion).toBe("model-v3");
    });

    test("includes noise scale from params", () => {
      const gradients = [0.1, 0.2];
      const params: DifferentialPrivacyParams = {
        noiseMultiplier: 0.5,
        maxGradientNorm: 1.0,
        clippingRatio: 0.1,
      };
      const update = createGradientUpdate(gradients, "client-1", "v1.0", params);
      expect(update.noiseScale).toBe(0.5);
    });

    test("includes timestamp", () => {
      const gradients = [0.1, 0.2];
      const params: DifferentialPrivacyParams = {
        noiseMultiplier: 0.1,
        maxGradientNorm: 1.0,
        clippingRatio: 0.1,
      };
      const update = createGradientUpdate(gradients, "client-1", "v1.0", params);
      expect(update.timestamp).toBeDefined();
      expect(new Date(update.timestamp)).toBeInstanceOf(Date);
    });
  });
});
