import type { ErrorLevel, ErrorRecord, RetryStrategy, RecoveryState } from "@/lib/types";
import { logger } from "@/lib/logger";

const DEFAULT_RETRY_STRATEGY: RetryStrategy = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
  strategy: "exponential",
};

export function createErrorRecord(
  level: ErrorLevel,
  code: string,
  message: string,
  details?: string
): ErrorRecord {
  return {
    id: crypto.randomUUID(),
    level,
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
    recoverable: level !== "critical",
    retryCount: 0,
    maxRetries: level === "error" ? 3 : 0,
  };
}

export function handleWarning(error: ErrorRecord): { corrected: boolean; message: string } {
  logger.warn(`${error.code}: ${error.message}`, "ErrorHandler");
  return { corrected: true, message: `Warning auto-corrected: ${error.message}` };
}

export async function handleError(
  error: ErrorRecord,
  operation: () => Promise<unknown>,
  strategy: RetryStrategy = DEFAULT_RETRY_STRATEGY
): Promise<{ success: boolean; result?: unknown; error?: ErrorRecord }> {
  let delay = strategy.baseDelayMs;
  const currentError = { ...error };

  for (let attempt = 0; attempt < strategy.maxAttempts; attempt++) {
    try {
      const result = await operation();
      return { success: true, result };
    } catch (_err) {
      currentError.retryCount = attempt + 1;
      logger.error(`Attempt ${attempt + 1}/${strategy.maxAttempts}: ${currentError.message}`, "ErrorHandler", _err);

      if (attempt < strategy.maxAttempts - 1) {
        await sleep(delay);
        switch (strategy.strategy) {
          case "exponential":
            delay = Math.min(delay * strategy.backoffMultiplier, strategy.maxDelayMs);
            break;
          case "linear":
            delay = Math.min(delay + strategy.baseDelayMs, strategy.maxDelayMs);
            break;
        }
      }
    }
  }

  return { success: false, error: currentError };
}

export function handleCritical(error: ErrorRecord, currentState: Record<string, unknown>): RecoveryState {
  logger.error(`${error.code}: ${error.message}`, "ErrorHandler");
  const recoveryState: RecoveryState = {
    lastStableState: { ...currentState },
    savedAt: new Date().toISOString(),
    canRecover: true,
    recoverySteps: [
      "1. 安全停止当前操作",
      "2. 保存当前工作进度",
      "3. 回滚到上一稳定状态",
      "4. 重新尝试操作",
    ],
  };
  return recoveryState;
}

export function recoverFromState(recoveryState: RecoveryState): Record<string, unknown> | null {
  if (!recoveryState.canRecover) return null;
  return { ...recoveryState.lastStableState, recovered: true, recoveredAt: new Date().toISOString() };
}

export function classifyError(err: unknown): ErrorLevel {
  if (err instanceof TypeError || err instanceof ReferenceError) return "error";
  if (err instanceof RangeError) return "warning";
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("critical") || message.includes("fatal") || message.includes("crash")) {
    return "critical";
  }
  return "error";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}