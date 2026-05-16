import { NoteBlock } from './piano-roll';

export interface AISuggestion {
  id: string;
  noteId: string;
  type: 'add' | 'delete' | 'modify';
  confidence: number;
  reason?: string;
  targetNote?: Partial<NoteBlock>;
}

export interface SuggestionCallbacks {
  onAccept?: (suggestion: AISuggestion) => void;
  onReject?: (suggestion: AISuggestion) => void;
}

export class AISuggestionRenderer {
  private suggestions: AISuggestion[] = [];
  private highlightedId: string | null = null;
  private callbacks: SuggestionCallbacks = {};
  private ctx: CanvasRenderingContext2D | null = null;
  private pixelsPerSecond: number = 100;
  private pitchRange: [number, number] = [21, 108];
  private noteHeight: number = 20;
  private viewport: { scrollX: number; scrollY: number; zoom: number } = {
    scrollX: 0,
    scrollY: 0,
    zoom: 1,
  };

  public setContext(ctx: CanvasRenderingContext2D): void {
    this.ctx = ctx;
  }

  public setConfiguration(
    pixelsPerSecond: number,
    pitchRange: [number, number],
    noteHeight: number
  ): void {
    this.pixelsPerSecond = pixelsPerSecond;
    this.pitchRange = pitchRange;
    this.noteHeight = noteHeight;
  }

  public setViewport(viewport: { scrollX: number; scrollY: number; zoom: number }): void {
    this.viewport = viewport;
  }

  public setSuggestions(suggestions: AISuggestion[]): void {
    this.suggestions = suggestions;
  }

  public setCallbacks(callbacks: SuggestionCallbacks): void {
    this.callbacks = callbacks;
  }

  public drawSuggestion(suggestion: AISuggestion): void {
    if (!this.ctx) return;

    const ctx = this.ctx;
    const [maxPitch] = this.pitchRange;
    const pps = this.pixelsPerSecond * this.viewport.zoom;

    let x: number, y: number, width: number, height: number;

    if (suggestion.type === 'add' && suggestion.targetNote) {
      const target = suggestion.targetNote;
      x = target.startTime! * pps - this.viewport.scrollX;
      y = (maxPitch - target.pitch!) * this.noteHeight - this.viewport.scrollY;
      width = target.duration! * pps;
      height = this.noteHeight;
    } else {
      return;
    }

    ctx.save();

    if (this.highlightedId === suggestion.id) {
      ctx.shadowColor = this.getSuggestionColor(suggestion.type);
      ctx.shadowBlur = 10;
    }

    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = this.getSuggestionColor(suggestion.type);
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    const confidence = Math.round(suggestion.confidence * 100);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y - 16, 40, 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px sans-serif';
    ctx.fillText(`${confidence}%`, x + 4, y - 6);

    ctx.restore();
  }

  public highlightSuggestion(id: string): void {
    this.highlightedId = id;
  }

  public acceptSuggestion(id: string): void {
    const suggestion = this.suggestions.find(s => s.id === id);
    if (suggestion && this.callbacks.onAccept) {
      this.callbacks.onAccept(suggestion);
      this.suggestions = this.suggestions.filter(s => s.id !== id);
    }
  }

  public rejectSuggestion(id: string): void {
    const suggestion = this.suggestions.find(s => s.id === id);
    if (suggestion && this.callbacks.onReject) {
      this.callbacks.onReject(suggestion);
      this.suggestions = this.suggestions.filter(s => s.id !== id);
    }
  }

  public drawAllSuggestions(): void {
    for (const suggestion of this.suggestions) {
      this.drawSuggestion(suggestion);
    }
  }

  private getSuggestionColor(type: 'add' | 'delete' | 'modify'): string {
    switch (type) {
      case 'add':
        return '#1ED760';
      case 'delete':
        return '#ff4444';
      case 'modify':
        return '#ffaa00';
      default:
        return '#ffffff';
    }
  }

  public getSuggestionAtPoint(x: number, y: number): AISuggestion | null {
    const [maxPitch] = this.pitchRange;
    const pps = this.pixelsPerSecond * this.viewport.zoom;

    for (const suggestion of this.suggestions) {
      if (suggestion.type !== 'add' || !suggestion.targetNote) continue;

      const target = suggestion.targetNote;
      const noteX = target.startTime! * pps - this.viewport.scrollX;
      const noteY = (maxPitch - target.pitch!) * this.noteHeight - this.viewport.scrollY;
      const noteWidth = target.duration! * pps;

      if (
        x >= noteX &&
        x <= noteX + noteWidth &&
        y >= noteY &&
        y <= noteY + this.noteHeight
      ) {
        return suggestion;
      }
    }

    return null;
  }

  public getSuggestions(): AISuggestion[] {
    return this.suggestions;
  }

  public clearSuggestions(): void {
    this.suggestions = [];
    this.highlightedId = null;
  }
}
