import { logger } from "@/lib/logger";

type EventCallback = (data: unknown) => void;

interface EventSubscription {
  id: string;
  event: string;
  callback: EventCallback;
}

class EventBus {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private eventHistory: { event: string; data: unknown; timestamp: string }[] = [];

  subscribe(event: string, callback: EventCallback): string {
    const id = crypto.randomUUID();
    const subs = this.subscriptions.get(event) || [];
    subs.push({ id, event, callback });
    this.subscriptions.set(event, subs);
    return id;
  }

  unsubscribe(subscriptionId: string): void {
    for (const [event, subs] of this.subscriptions.entries()) {
      const filtered = subs.filter((s) => s.id !== subscriptionId);
      this.subscriptions.set(event, filtered);
    }
  }

  publish(event: string, data: unknown): void {
    const subs = this.subscriptions.get(event) || [];
    this.eventHistory.push({ event, data, timestamp: new Date().toISOString() });
    if (this.eventHistory.length > 1000) this.eventHistory.shift();
    for (const sub of subs) {
      try {
        sub.callback(data);
      } catch (err) {
        logger.error(`Event handler error for "${event}"`, "EventBus", err);
      }
    }
  }

  once(event: string, callback: EventCallback): string {
    const id = this.subscribe(event, (data) => {
      this.unsubscribe(id);
      callback(data);
    });
    return id;
  }

  getHistory(event?: string): { event: string; data: unknown; timestamp: string }[] {
    if (event) return this.eventHistory.filter((h) => h.event === event);
    return [...this.eventHistory];
  }

  clearHistory(): void {
    this.eventHistory = [];
  }
}

export const globalEventBus = new EventBus();

export type CreationStage = "input" | "generating" | "editing" | "export";

export const CREATION_STAGE_EVENTS = {
  STAGE_CHANGE: "creation:stage_change",
  GENERATION_START: "creation:generation_start",
  GENERATION_PROGRESS: "creation:generation_progress",
  GENERATION_COMPLETE: "creation:generation_complete",
  GENERATION_ERROR: "creation:generation_error",
  EDIT_START: "creation:edit_start",
  EDIT_COMPLETE: "creation:edit_complete",
  EXPORT_START: "creation:export_start",
  EXPORT_COMPLETE: "creation:export_complete",
} as const;
