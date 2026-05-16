import { Plugin, PluginManifest, validateManifest } from "./schema";
import { pluginRegistry } from "./registry";
import { verifySignature } from "./signature";

export class Installer {
  private static instance: Installer;

  private constructor() {}

  public static getInstance(): Installer {
    if (!Installer.instance) {
      Installer.instance = new Installer();
    }
    return Installer.instance;
  }

  public async download(pluginUrl: string): Promise<PluginManifest | null> {
    try {
      const response = await fetch(pluginUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const manifest = await response.json();
      const validation = validateManifest(manifest);

      if (!validation.valid) {
        console.error("Invalid plugin manifest:", validation.errors);
        return null;
      }

      return manifest as PluginManifest;
    } catch (error) {
      console.error("Failed to download plugin:", error);
      return null;
    }
  }

  public async verifySignature(
    plugin: Plugin,
    signature: string
  ): Promise<boolean> {
    try {
      const manifestJson = JSON.stringify(plugin.manifest);
      const isValid = await verifySignature(
        manifestJson,
        signature,
        plugin.manifest.signature
      );
      return isValid;
    } catch (error) {
      console.error("Signature verification error:", error);
      return false;
    }
  }

  public async install(pluginId: string): Promise<boolean> {
    try {
      const existingPlugin = pluginRegistry.get(pluginId);
      if (existingPlugin) {
        if (existingPlugin.status === "installed" || existingPlugin.status === "enabled") {
          console.log(`Plugin ${pluginId} is already installed`);
          return true;
        }
      }

      const manifestResponse = await fetch(`/api/marketplace?pluginId=${pluginId}`);
      if (!manifestResponse.ok) {
        console.error("Failed to fetch plugin manifest");
        return false;
      }

      const manifest: PluginManifest = await manifestResponse.json();
      const validation = validateManifest(manifest);
      if (!validation.valid) {
        console.error("Invalid manifest:", validation.errors);
        return false;
      }

      const plugin = pluginRegistry.createPlugin(manifest, pluginId);
      plugin.size = await this.estimatePluginSize(manifest);
      plugin.status = "installed";

      pluginRegistry.register(plugin);
      pluginRegistry.updateStatus(pluginId, "installed");

      return true;
    } catch (error) {
      console.error("Installation failed:", error);
      return false;
    }
  }

  public async uninstall(pluginId: string): Promise<boolean> {
    try {
      const plugin = pluginRegistry.get(pluginId);
      if (!plugin) {
        console.log(`Plugin ${pluginId} not found, nothing to uninstall`);
        return true;
      }

      if (plugin.status === "enabled") {
        await this.disable(pluginId);
      }

      pluginRegistry.unregister(pluginId);

      return true;
    } catch (error) {
      console.error("Uninstallation failed:", error);
      return false;
    }
  }

  public async enable(pluginId: string): Promise<boolean> {
    try {
      const plugin = pluginRegistry.get(pluginId);
      if (!plugin) {
        console.error(`Plugin ${pluginId} not found`);
        return false;
      }

      if (plugin.status !== "installed" && plugin.status !== "disabled") {
        console.error(`Plugin ${pluginId} cannot be enabled from status: ${plugin.status}`);
        return false;
      }

      pluginRegistry.updateStatus(pluginId, "enabled");
      return true;
    } catch (error) {
      console.error("Enable failed:", error);
      return false;
    }
  }

  public async disable(pluginId: string): Promise<boolean> {
    try {
      const plugin = pluginRegistry.get(pluginId);
      if (!plugin) {
        console.error(`Plugin ${pluginId} not found`);
        return false;
      }

      if (plugin.status !== "enabled") {
        console.log(`Plugin ${pluginId} is not enabled`);
        return true;
      }

      pluginRegistry.updateStatus(pluginId, "disabled");
      return true;
    } catch (error) {
      console.error("Disable failed:", error);
      return false;
    }
  }

  private async estimatePluginSize(manifest: PluginManifest): Promise<number> {
    const manifestSize = new Blob([JSON.stringify(manifest)]).size;
    const estimatedCodeSize = manifestSize * 10;
    return estimatedCodeSize;
  }

  public getInstallStatus(pluginId: string): Plugin["status"] | null {
    const plugin = pluginRegistry.get(pluginId);
    return plugin ? plugin.status : null;
  }

  public isInstalled(pluginId: string): boolean {
    const plugin = pluginRegistry.get(pluginId);
    return plugin !== undefined;
  }

  public isEnabled(pluginId: string): boolean {
    const plugin = pluginRegistry.get(pluginId);
    return plugin?.status === "enabled";
  }
}

export const installer = Installer.getInstance();
