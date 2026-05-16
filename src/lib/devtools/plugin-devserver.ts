import chokidar, { FSWatcher } from "chokidar";
import { globalPluginManager, Plugin } from "../kernel";

export interface DevServerState {
  isRunning: boolean;
  watchingPaths: string[];
  lastCompileTime: number;
}

export interface DevServerEventData {
  filePath?: string;
  event?: string;
  errors?: string[];
  error?: string;
  success?: boolean;
  outputPath?: string;
  timestamp?: number;
  [key: string]: string | boolean | number | string[] | undefined;
}

export type DevServerEvent = {
  type: "change" | "error" | "compile" | "ready";
  data?: DevServerEventData;
};

type FileChangeCallback = (filePath: string, event: string) => void;
type CompileErrorCallback = (error: Error, filePath?: string) => void;

class FileWatcher {
  private watcher: FSWatcher | null = null;
  private fileChangeCallbacks: FileChangeCallback[] = [];
  private compileErrorCallbacks: CompileErrorCallback[] = [];
  private watchingPaths: string[] = [];

  watch(pluginPath: string): void {
    if (this.watcher) {
      this.watcher.close();
    }

    const watchPattern = `${pluginPath}/**/*.{ts,tsx,js,jsx}`.replace(/\\/g, "/");
    this.watcher = chokidar.watch(watchPattern, {
      ignored: /(^|[\/\\])\..|node_modules/,
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher
      .on("change", (filePath) => {
        this.fileChangeCallbacks.forEach((cb) => cb(filePath, "change"));
      })
      .on("add", (filePath) => {
        this.fileChangeCallbacks.forEach((cb) => cb(filePath, "add"));
      })
      .on("unlink", (filePath) => {
        this.fileChangeCallbacks.forEach((cb) => cb(filePath, "unlink"));
      })
      .on("error", (error: unknown) => {
        this.compileErrorCallbacks.forEach((cb) => cb(error as Error));
      });

    this.watchingPaths.push(pluginPath);
  }

  onFileChange(callback: FileChangeCallback): void {
    this.fileChangeCallbacks.push(callback);
  }

  onCompileError(callback: CompileErrorCallback): void {
    this.compileErrorCallbacks.push(callback);
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    this.watchingPaths = [];
  }

  getWatchingPaths(): string[] {
    return [...this.watchingPaths];
  }
}

interface CompileResult {
  success: boolean;
  errors?: string[];
  outputPath?: string;
  timestamp: number;
}

async function compilePlugin(pluginPath: string): Promise<CompileResult> {
  try {
    const timestamp = Date.now();
    
    const tempModule = await import(pluginPath);
    
    if (!tempModule.default && !tempModule.plugin) {
      return {
        success: false,
        errors: ["Plugin module does not export default or plugin"],
        timestamp,
      };
    }

    return {
      success: true,
      outputPath: pluginPath,
      timestamp,
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : String(error)],
      timestamp: Date.now(),
    };
  }
}

type EventCallback = (event: DevServerEvent) => void;
const eventListeners: EventCallback[] = [];

function emitEvent(event: DevServerEvent): void {
  eventListeners.forEach((listener) => listener(event));
}

function onDevServerEvent(callback: EventCallback): void {
  eventListeners.push(callback);
}

const devServerState: DevServerState = {
  isRunning: false,
  watchingPaths: [],
  lastCompileTime: 0,
};

const fileWatcher = new FileWatcher();

async function startServer(pluginsDir: string): Promise<void> {
  if (devServerState.isRunning) {
    return;
  }

  devServerState.watchingPaths = [pluginsDir];
  devServerState.isRunning = true;
  devServerState.lastCompileTime = Date.now();

  fileWatcher.watch(pluginsDir);

  fileWatcher.onFileChange(async (filePath, event) => {
    emitEvent({
      type: "change",
      data: { filePath, event },
    });

    const result = await compilePlugin(filePath);
    devServerState.lastCompileTime = result.timestamp;

    if (result.success) {
      emitEvent({ type: "compile", data: { success: result.success, outputPath: result.outputPath, timestamp: result.timestamp } });
    } else {
      emitEvent({
        type: "error",
        data: { errors: result.errors, filePath },
      });
    }
  });

  fileWatcher.onCompileError((error, filePath) => {
    emitEvent({
      type: "error",
      data: { error: error.message, filePath },
    });
  });

  emitEvent({ type: "ready", data: { isRunning: devServerState.isRunning, watchingPaths: devServerState.watchingPaths, lastCompileTime: devServerState.lastCompileTime } });
}

function stopServer(): void {
  fileWatcher.stop();
  devServerState.isRunning = false;
  devServerState.watchingPaths = [];
  emitEvent({ type: "change", data: { type: "stopped" } });
}

function getDevServerState(): DevServerState {
  return { ...devServerState };
}

async function hotSwapPlugin(pluginId: string, newPlugin: Plugin): Promise<void> {
  await globalPluginManager.hotSwap(pluginId, newPlugin);
}

export {
  compilePlugin,
  startServer,
  stopServer,
  emitEvent,
  onDevServerEvent,
  getDevServerState,
  hotSwapPlugin,
  fileWatcher,
};
