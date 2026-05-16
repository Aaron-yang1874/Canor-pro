import {
  fedAvgAggregation,
  fedProxAggregation,
  validateModel,
  incrementalUpdate,
} from "@/lib/federated/cloud";
import type { GradientUpdate } from "@/lib/types";

jest.mock("@/lib/homomorphic", () => ({
  secureAggregate: jest.fn(),
}));

describe("Federated Cloud Module", () => {
  describe("fedAvgAggregation", () => {
    test("aggregates single client update", () => {
      const clientUpdates: GradientUpdate[] = [
        {
          layerName: "model",
          gradients: [[0.1, 0.2, 0.3]],
          noiseScale: 0.1,
          timestamp: new Date().toISOString(),
          clientId: "client-1",
          modelVersion: "v1.0",
        },
      ];
      const dataSizes = [100];
      const result = fedAvgAggregation(clientUpdates, dataSizes);
      expect(result).toEqual([0.1, 0.2, 0.3]);
    });

    test("aggregates multiple clients with equal weights", () => {
      const clientUpdates: GradientUpdate[] = [
        {
          layerName: "model",
          gradients: [[1.0, 2.0]],
          noiseScale: 0,
          timestamp: new Date().toISOString(),
          clientId: "client-1",
          modelVersion: "v1.0",
        },
        {
          layerName: "model",
          gradients: [[3.0, 4.0]],
          noiseScale: 0,
          timestamp: new Date().toISOString(),
          clientId: "client-2",
          modelVersion: "v1.0",
        },
      ];
      const dataSizes = [50, 50];
      const result = fedAvgAggregation(clientUpdates, dataSizes);
      expect(result).toEqual([2.0, 3.0]);
    });

    test("aggregates with weighted average based on data size", () => {
      const clientUpdates: GradientUpdate[] = [
        {
          layerName: "model",
          gradients: [[0.0, 10.0]],
          noiseScale: 0,
          timestamp: new Date().toISOString(),
          clientId: "client-1",
          modelVersion: "v1.0",
        },
        {
          layerName: "model",
          gradients: [[10.0, 0.0]],
          noiseScale: 0,
          timestamp: new Date().toISOString(),
          clientId: "client-2",
          modelVersion: "v1.0",
        },
      ];
      const dataSizes = [75, 25];
      const result = fedAvgAggregation(clientUpdates, dataSizes);
      expect(result[0]).toBeCloseTo(2.5, 5);
      expect(result[1]).toBeCloseTo(7.5, 5);
    });

    test("returns empty array for empty updates", () => {
      const result = fedAvgAggregation([], []);
      expect(result).toEqual([]);
    });

    test("handles single client with full data", () => {
      const clientUpdates: GradientUpdate[] = [
        {
          layerName: "model",
          gradients: [[5.0, 5.0]],
          noiseScale: 0,
          timestamp: new Date().toISOString(),
          clientId: "client-1",
          modelVersion: "v1.0",
        },
      ];
      const dataSizes = [1000];
      const result = fedAvgAggregation(clientUpdates, dataSizes);
      expect(result).toEqual([5.0, 5.0]);
    });

    test("handles missing gradient values", () => {
      const clientUpdates: GradientUpdate[] = [
        {
          layerName: "model",
          gradients: [[1.0]],
          noiseScale: 0,
          timestamp: new Date().toISOString(),
          clientId: "client-1",
          modelVersion: "v1.0",
        },
      ];
      const dataSizes = [50];
      const result = fedAvgAggregation(clientUpdates, dataSizes);
      expect(result[0]).toBe(1.0);
      expect(result[1]).toBeUndefined();
    });
  });

  describe("fedProxAggregation", () => {
    test("applies proximal term to FedAvg result", () => {
      const clientUpdates: GradientUpdate[] = [
        {
          layerName: "model",
          gradients: [[1.0, 2.0]],
          noiseScale: 0,
          timestamp: new Date().toISOString(),
          clientId: "client-1",
          modelVersion: "v1.0",
        },
      ];
      const globalWeights = [0.0, 0.0];
      const result = fedProxAggregation(clientUpdates, globalWeights, 0.01);
      expect(result).toHaveLength(2);
    });

    test("returns different result from regular FedAvg", () => {
      const clientUpdates: GradientUpdate[] = [
        {
          layerName: "model",
          gradients: [[5.0, 5.0]],
          noiseScale: 0,
          timestamp: new Date().toISOString(),
          clientId: "client-1",
          modelVersion: "v1.0",
        },
      ];
      const globalWeights = [10.0, 10.0];
      const proxResult = fedProxAggregation(clientUpdates, globalWeights, 0.1);
      const avgResult = fedAvgAggregation(clientUpdates, [1]);
      expect(proxResult).not.toEqual(avgResult);
    });
  });

  describe("validateModel", () => {
    test("returns valid for empty validation data", () => {
      const result = validateModel([1.0, 2.0], []);
      expect(result.valid).toBe(true);
      expect(result.accuracy).toBe(1);
    });

    test("validates model against validation samples", () => {
      const weights = [1.0, 0.0];
      const validationData = [
        [1.0, 0.0, 1.0],
        [2.0, 0.0, 2.0],
      ];
      const result = validateModel(weights, validationData, 0.8);
      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("accuracy");
    });

    test("accuracy is between 0 and 1", () => {
      const weights = [1.0, 1.0];
      const validationData = [[1.0, 1.0, 2.0]];
      const result = validateModel(weights, validationData);
      expect(result.accuracy).toBeGreaterThanOrEqual(0);
      expect(result.accuracy).toBeLessThanOrEqual(1);
    });

    test("respects threshold parameter", () => {
      const weights = [1.0, 0.0];
      const validationData = [
        [1.0, 0.0, 1.0],
        [2.0, 0.0, 2.0],
      ];
      const result1 = validateModel(weights, validationData, 0.5);
      const result2 = validateModel(weights, validationData, 0.9);
      expect(result1.valid).toBe(true);
      expect(result1.accuracy).toBe(1);
    });
  });

  describe("incrementalUpdate", () => {
    test("updates global weights with delta", () => {
      const globalWeights = [1.0, 2.0, 3.0];
      const delta = [0.1, 0.2, 0.3];
      const result = incrementalUpdate(globalWeights, delta, 0.1);
      expect(result).toEqual([1.01, 2.02, 3.03]);
    });

    test("uses default learning rate of 0.1", () => {
      const globalWeights = [1.0, 2.0];
      const delta = [1.0, 1.0];
      const result = incrementalUpdate(globalWeights, delta);
      expect(result).toEqual([1.1, 2.1]);
    });

    test("handles empty arrays", () => {
      const result = incrementalUpdate([], []);
      expect(result).toEqual([]);
    });

    test("handles partial delta", () => {
      const globalWeights = [1.0, 2.0, 3.0];
      const delta = [0.1];
      const result = incrementalUpdate(globalWeights, delta, 0.1);
      expect(result[0]).toBe(1.01);
      expect(result[1]).toBe(2.0);
      expect(result[2]).toBe(3.0);
    });

    test("applies custom learning rate", () => {
      const globalWeights = [10.0];
      const delta = [5.0];
      const result1 = incrementalUpdate(globalWeights, delta, 0.1);
      const result2 = incrementalUpdate(globalWeights, delta, 1.0);
      expect(result1[0]).toBe(10.5);
      expect(result2[0]).toBe(15.0);
    });
  });
});
