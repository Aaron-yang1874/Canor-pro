export interface PipelineStep {
  id: string;
  name: string;
  input: any;
  output: any;
  duration: number;
  status: "pending" | "running" | "completed" | "error";
}

export interface PipelineRecord {
  id: string;
  timestamp: number;
  steps: PipelineStep[];
  totalDuration: number;
}

interface InspectorState {
  records: PipelineRecord[];
  breakpoints: Set<string>;
  pausedStepId: string | null;
  isPaused: boolean;
}

class PromptInspector {
  private state: InspectorState = {
    records: [],
    breakpoints: new Set(),
    pausedStepId: null,
    isPaused: false,
  };

  private listeners: Set<(state: InspectorState) => void> = new Set();

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  public subscribe(listener: (state: InspectorState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getState(): InspectorState {
    return { ...this.state, breakpoints: new Set(this.state.breakpoints) };
  }

  public async interceptPipeline(steps: PipelineStep[]): Promise<PipelineStep[]> {
    const recordId = `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const record: PipelineRecord = {
      id: recordId,
      timestamp: Date.now(),
      steps: steps.map((step) => ({ ...step })),
      totalDuration: 0,
    };

    const updatedSteps: PipelineStep[] = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepIndex = record.steps.findIndex((s) => s.id === step.id);
      if (stepIndex !== -1) {
        record.steps[stepIndex].status = "running";
      }

      if (this.state.pausedStepId === step.id && this.state.isPaused) {
        if (stepIndex !== -1) {
          record.steps[stepIndex].status = "pending";
        }
        updatedSteps.push(step);
        continue;
      }

      const startTime = Date.now();
      let output = step.output;
      let status: PipelineStep["status"] = "completed";
      let error: any = null;

      try {
        if (this.state.breakpoints.has(step.id)) {
          if (stepIndex !== -1) {
            record.steps[stepIndex].status = "completed";
          }
          output = step.output;
        }
      } catch (e) {
        status = "error";
        error = e;
        if (stepIndex !== -1) {
          record.steps[stepIndex].output = error;
        }
      }

      const duration = Date.now() - startTime;
      if (stepIndex !== -1) {
        record.steps[stepIndex].duration = duration;
        record.steps[stepIndex].status = status;
        record.steps[stepIndex].output = output;
      }

      updatedSteps.push({
        ...step,
        duration,
        status,
        output,
      });

      if (this.state.breakpoints.has(step.id)) {
        this.state.pausedStepId = step.id;
        this.state.isPaused = true;
        this.notifyListeners();
        break;
      }
    }

    record.totalDuration = record.steps.reduce((sum, s) => sum + (s.duration || 0), 0);
    this.state.records.unshift(record);
    if (this.state.records.length > 100) {
      this.state.records = this.state.records.slice(0, 100);
    }

    this.notifyListeners();
    return updatedSteps;
  }

  public getRecords(): PipelineRecord[] {
    return [...this.state.records];
  }

  public setBreakpoint(stepId: string): void {
    this.state.breakpoints.add(stepId);
    this.notifyListeners();
  }

  public clearBreakpoint(stepId: string): void {
    this.state.breakpoints.delete(stepId);
    this.notifyListeners();
  }

  public pauseAt(stepId: string): void {
    this.state.pausedStepId = stepId;
    this.state.isPaused = true;
    this.notifyListeners();
  }

  public resume(): void {
    this.state.pausedStepId = null;
    this.state.isPaused = false;
    this.notifyListeners();
  }

  public clearRecords(): void {
    this.state.records = [];
    this.notifyListeners();
  }

  public getBreakpoints(): string[] {
    return Array.from(this.state.breakpoints);
  }

  public isPaused(): boolean {
    return this.state.isPaused;
  }

  public getPausedStepId(): string | null {
    return this.state.pausedStepId;
  }
}

export const inspector = new PromptInspector();
