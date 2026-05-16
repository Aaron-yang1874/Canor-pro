export interface Plugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  initialize: () => Promise<void>;
  destroy: () => Promise<void>;
  handleEvent?: (event: string, data: unknown) => void;
}

class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private initialized: Set<string> = new Set();

  async register(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin "${plugin.id}" already registered`);
    }
    this.plugins.set(plugin.id, plugin);
    if (plugin.enabled) {
      await this.initializePlugin(plugin.id);
    }
  }

  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;
    if (this.initialized.has(pluginId)) {
      await plugin.destroy();
      this.initialized.delete(pluginId);
    }
    this.plugins.delete(pluginId);
  }

  async initializePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || this.initialized.has(pluginId)) return;
    await plugin.initialize();
    this.initialized.add(pluginId);
    plugin.enabled = true;
  }

  async destroyPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !this.initialized.has(pluginId)) return;
    await plugin.destroy();
    this.initialized.delete(pluginId);
    plugin.enabled = false;
  }

  async hotSwap(pluginId: string, newPlugin: Plugin): Promise<void> {
    await this.destroyPlugin(pluginId);
    this.plugins.delete(pluginId);
    this.plugins.set(newPlugin.id, newPlugin);
    if (newPlugin.enabled) {
      await this.initializePlugin(newPlugin.id);
    }
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getEnabledPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).filter((p) => p.enabled);
  }

  isInitialized(pluginId: string): boolean {
    return this.initialized.has(pluginId);
  }
}

export const globalPluginManager = new PluginManager();
