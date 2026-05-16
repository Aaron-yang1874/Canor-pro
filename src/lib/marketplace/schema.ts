export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: string[];
  entryPoint: string;
  signature: string;
  homepage?: string;
  repository?: string;
}

export interface Plugin {
  id: string;
  manifest: PluginManifest;
  status: "pending" | "installed" | "enabled" | "disabled";
  installedAt: Date;
  size: number;
  downloads: number;
  rating: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateManifest(manifest: unknown): ValidationResult {
  const errors: string[] = [];

  if (!manifest || typeof manifest !== "object") {
    return { valid: false, errors: ["Manifest must be an object"] };
  }

  const m = manifest as Record<string, unknown>;

  if (typeof m.name !== "string" || m.name.trim() === "") {
    errors.push("name is required and must be a non-empty string");
  }

  if (typeof m.version !== "string" || !/^\d+\.\d+\.\d+$/.test(m.version)) {
    errors.push("version must be a valid semver string (e.g., 1.0.0)");
  }

  if (typeof m.description !== "string" || m.description.trim() === "") {
    errors.push("description is required and must be a non-empty string");
  }

  if (typeof m.author !== "string" || m.author.trim() === "") {
    errors.push("author is required and must be a non-empty string");
  }

  if (!Array.isArray(m.permissions)) {
    errors.push("permissions must be an array");
  } else if (!m.permissions.every((p) => typeof p === "string")) {
    errors.push("all permissions must be strings");
  }

  if (typeof m.entryPoint !== "string" || m.entryPoint.trim() === "") {
    errors.push("entryPoint is required and must be a non-empty string");
  }

  if (typeof m.signature !== "string" || m.signature.trim() === "") {
    errors.push("signature is required and must be a non-empty string");
  }

  if (m.homepage !== undefined && typeof m.homepage !== "string") {
    errors.push("homepage must be a string if provided");
  }

  if (m.repository !== undefined && typeof m.repository !== "string") {
    errors.push("repository must be a string if provided");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function serializeManifest(manifest: PluginManifest): string {
  return JSON.stringify(manifest, null, 2);
}

export function deserializeManifest(json: string): PluginManifest | null {
  try {
    const parsed = JSON.parse(json);
    const validation = validateManifest(parsed);
    if (!validation.valid) {
      console.error("Manifest validation failed:", validation.errors);
      return null;
    }
    return parsed as PluginManifest;
  } catch (error) {
    console.error("Failed to parse manifest JSON:", error);
    return null;
  }
}
