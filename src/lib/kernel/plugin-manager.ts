export interface Plugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  initialize: () => Promise<void>;
  destroy: () => Promise<void>;
  handleEvent?: (event: string, data: unknown) => void;
  serializeState?: () => Promise<PluginState>;
  deserializeState?: (state: PluginState) => Promise<void>;
}

export interface PluginState {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  [key: string]: unknown;
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
    const oldPlugin = this.plugins.get(pluginId);
    
    let oldState: PluginState | null = null;
    if (oldPlugin && oldPlugin.serializeState) {
      try {
        oldState = await oldPlugin.serializeState();
      } catch (error) {
        console.error(`Failed to serialize state for plugin ${pluginId}:`, error);
      }
    }

    await this.destroyPlugin(pluginId);
    this.plugins.delete(pluginId);

    this.plugins.set(newPlugin.id, newPlugin);
    if (newPlugin.enabled || (oldPlugin && oldPlugin.enabled)) {
      await this.initializePlugin(newPlugin.id);
    }

    if (newPlugin.deserializeState && oldState) {
      try {
        await newPlugin.deserializeState(oldState);
      } catch (error) {
        console.error(`Failed to deserialize state for plugin ${newPlugin.id}:`, error);
      }
    }
  }

  async serializeState(pluginId: string): Promise<PluginState | null> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !this.initialized.has(pluginId)) {
      return null;
    }

    if (plugin.serializeState) {
      try {
        return await plugin.serializeState();
      } catch (error) {
        console.error(`Failed to serialize state for plugin ${pluginId}:`, error);
        return null;
      }
    }

    return {
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      enabled: plugin.enabled,
    };
  }

  async deserializeState(pluginId: string, state: PluginState): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }

    if (plugin.deserializeState) {
      await plugin.deserializeState(state);
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
