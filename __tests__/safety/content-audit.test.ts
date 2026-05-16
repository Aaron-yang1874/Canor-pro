import { preAudit, auditContent } from "@/lib/safety/content-audit";
import { classifyContent, mapClassificationToIntent, resolveContext } from "@/lib/nlp";

jest.mock("@/lib/nlp", () => ({
  classifyContent: jest.fn(),
  mapClassificationToIntent: jest.fn(),
  resolveContext: jest.fn(),
}));

jest.mock("@/lib/fingerprint", () => ({
  fingerprintAndCompare: jest.fn(),
}));

describe("Content Audit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("preAudit", () => {
    test("blocks content with violence keyword", () => {
      const result = preAudit("This contains violence content");
      expect(result.blocked).toBe(true);
      expect(result.matchedKeywords).toContain("violence");
    });

    test("blocks content with hate keyword", () => {
      const result = preAudit("This is hate speech content");
      expect(result.blocked).toBe(true);
      expect(result.matchedKeywords).toContain("hate");
    });

    test("blocks content with Chinese violence keyword", () => {
      const result = preAudit("这是暴力内容");
      expect(result.blocked).toBe(true);
      expect(result.matchedKeywords).toContain("暴力");
    });

    test("blocks content with discrimination keyword", () => {
      const result = preAudit("Contains discrimination against groups");
      expect(result.blocked).toBe(true);
      expect(result.matchedKeywords).toContain("discrimination");
    });

    test("blocks content with illegal keyword", () => {
      const result = preAudit("This is illegal activity");
      expect(result.blocked).toBe(true);
      expect(result.matchedKeywords).toContain("illegal");
    });

    test("blocks content with explicit keyword", () => {
      const result = preAudit("Contains explicit material");
      expect(result.blocked).toBe(true);
      expect(result.matchedKeywords).toContain("explicit");
    });

    test("passes content without blocked keywords", () => {
      const result = preAudit("This is a normal music composition prompt");
      expect(result.blocked).toBe(false);
      expect(result.matchedKeywords).toHaveLength(0);
      expect(result.reason).toBe("");
    });

    test("is case insensitive", () => {
      const result = preAudit("This contains VIOLENCE and HATE");
      expect(result.blocked).toBe(true);
      expect(result.matchedKeywords).toContain("violence");
      expect(result.matchedKeywords).toContain("hate");
    });

    test("detects multiple blocked keywords", () => {
      const result = preAudit("Contains violence and hate speech");
      expect(result.blocked).toBe(true);
      expect(result.matchedKeywords).toContain("violence");
      expect(result.matchedKeywords).toContain("hate");
      expect(result.matchedKeywords).toHaveLength(2);
    });

    test("returns proper reason for blocked content", () => {
      const result = preAudit("Contains violence");
      expect(result.reason).toContain("违禁关键词");
      expect(result.reason).toContain("violence");
    });
  });

  describe("auditContent integration", () => {
    test("returns critical risk for blocked keywords", async () => {
      const result = await auditContent("This contains violence content");
      expect(result.passed).toBe(false);
      expect(result.overallRisk).toBe("critical");
      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.flags[0].action).toBe("block");
    });

    test("returns low risk for clean content with normal NLP result", async () => {
      (classifyContent as jest.Mock).mockResolvedValue([
        { label: "normal", score: 0.95 },
      ]);
      (mapClassificationToIntent as jest.Mock).mockReturnValue({
        category: "normal",
        confidence: 0.95,
        subLabels: [],
      });
      (resolveContext as jest.Mock).mockReturnValue({
        resolved: false,
        resolvedCategory: "normal",
        reason: "",
      });

      const result = await auditContent("A beautiful melody in C major");
      expect(result.passed).toBe(true);
      expect(result.overallRisk).toBe("low");
      expect(result.flags).toHaveLength(0);
    });

    test("returns medium risk for suspicious content with low confidence", async () => {
      (classifyContent as jest.Mock).mockResolvedValue([
        { label: "violence", score: 0.5 },
      ]);
      (mapClassificationToIntent as jest.Mock).mockReturnValue({
        category: "violence",
        confidence: 0.5,
        subLabels: [],
      });
      (resolveContext as jest.Mock).mockReturnValue({
        resolved: false,
        resolvedCategory: "violence",
        reason: "",
      });

      const result = await auditContent("Some intense battle music");
      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.flags[0].action).toBe("warn");
      expect(result.overallRisk).toBe("medium");
    });

    test("returns critical risk for suspicious content with high confidence", async () => {
      (classifyContent as jest.Mock).mockResolvedValue([
        { label: "violence", score: 0.85 },
      ]);
      (mapClassificationToIntent as jest.Mock).mockReturnValue({
        category: "violence",
        confidence: 0.85,
        subLabels: [],
      });
      (resolveContext as jest.Mock).mockReturnValue({
        resolved: false,
        resolvedCategory: "violence",
        reason: "",
      });

      const result = await auditContent("Extreme violent content");
      expect(result.flags.length).toBeGreaterThan(0);
      expect(result.flags[0].action).toBe("block");
      expect(result.overallRisk).toBe("critical");
      expect(result.passed).toBe(false);
    });

    test("includes timestamp in result", async () => {
      const result = await auditContent("Normal content");
      expect(result.auditTimestamp).toBeDefined();
      expect(new Date(result.auditTimestamp)).toBeInstanceOf(Date);
    });

    test("preAudit blocks content before NLP check", async () => {
      (classifyContent as jest.Mock).mockResolvedValue([
        { label: "normal", score: 0.95 },
      ]);
      (mapClassificationToIntent as jest.Mock).mockReturnValue({
        category: "normal",
        confidence: 0.95,
        subLabels: [],
      });
      (resolveContext as jest.Mock).mockReturnValue({
        resolved: false,
        resolvedCategory: "normal",
        reason: "",
      });

      const result = await auditContent("This has violence and hate");
      expect(result.passed).toBe(false);
      expect(result.overallRisk).toBe("critical");
      expect(result.flags.some((f) => f.category === "hate_speech")).toBe(true);
      expect(classifyContent).not.toHaveBeenCalled();
    });

    test("NLP check runs when preAudit passes", async () => {
      (classifyContent as jest.Mock).mockResolvedValue([
        { label: "normal", score: 0.95 },
      ]);
      (mapClassificationToIntent as jest.Mock).mockReturnValue({
        category: "normal",
        confidence: 0.95,
        subLabels: [],
      });
      (resolveContext as jest.Mock).mockReturnValue({
        resolved: false,
        resolvedCategory: "normal",
        reason: "",
      });

      await auditContent("A peaceful song");
      expect(classifyContent).toHaveBeenCalledWith("A peaceful song");
    });
  });
});
