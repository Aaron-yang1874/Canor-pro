import { Plugin, PluginManifest } from "./schema";

export type PluginCategory = "all" | "audio" | "visual" | "tool" | "social";

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins: Map<string, Plugin>;

  private constructor() {
    this.plugins = new Map();
  }

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }
    return PluginRegistry.instance;
  }

  public register(plugin: Plugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with id ${plugin.id} already registered`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  public unregister(pluginId: string): boolean {
    return this.plugins.delete(pluginId);
  }

  public get(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  public list(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  public search(query: string): Plugin[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.plugins.values()).filter(
      (plugin) =>
        plugin.manifest.name.toLowerCase().includes(lowerQuery) ||
        plugin.manifest.description.toLowerCase().includes(lowerQuery) ||
        plugin.manifest.author.toLowerCase().includes(lowerQuery)
    );
  }

  public filterByCategory(category: PluginCategory): Plugin[] {
    if (category === "all") {
      return this.list();
    }
    return this.list();
  }

  public updateStats(
    pluginId: string,
    downloads?: number,
    rating?: number
  ): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    if (downloads !== undefined) {
      plugin.downloads = downloads;
    }
    if (rating !== undefined) {
      plugin.rating = rating;
    }

    return true;
  }

  public updateStatus(
    pluginId: string,
    status: Plugin["status"]
  ): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }
    plugin.status = status;
    return true;
  }

  public createPlugin(manifest: PluginManifest, id?: string): Plugin {
    const pluginId = id || this.generatePluginId(manifest.name);
    return {
      id: pluginId,
      manifest,
      status: "pending",
      installedAt: new Date(),
      size: 0,
      downloads: 0,
      rating: 0,
    };
  }

  private generatePluginId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  public clear(): void {
    this.plugins.clear();
  }

  public getPluginCount(): number {
    return this.plugins.size;
  }

  public getPluginsByStatus(status: Plugin["status"]): Plugin[] {
    return this.list().filter((plugin) => plugin.status === status);
  }
}

export const pluginRegistry = PluginRegistry.getInstance();
