export interface NoteBlock {
  id: string;
  pitch: number;
  startTime: number;
  duration: number;
  velocity: number;
  trackId: string;
  isAiSuggestion?: boolean;
}

export interface PianoRollState {
  notes: NoteBlock[];
  pixelsPerSecond: number;
  pitchRange: [number, number];
}

export class PianoRollRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public state: PianoRollState;
  public viewport: { scrollX: number; scrollY: number; zoom: number };

  private readonly KEY_WIDTH = 60;
  private readonly NOTE_HEIGHT = 20;
  private readonly GRID_COLOR = '#2F2F2F';
  private readonly NOTE_COLORS = {
    default: '#1DB954',
    aiSuggestion: '#1ED760',
    selected: '#1DB954',
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = ctx;
    this.state = {
      notes: [],
      pixelsPerSecond: 100,
      pitchRange: [21, 108],
    };
    this.viewport = {
      scrollX: 0,
      scrollY: 0,
      zoom: 1,
    };
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('wheel', (e) => this.handleScroll(e), { passive: false });
  }

  public setNotes(notes: NoteBlock[]): void {
    this.state.notes = notes;
    this.render();
  }

  public setPixelsPerSecond(pps: number): void {
    this.state.pixelsPerSecond = pps;
    this.render();
  }

  public render(): void {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    this.drawPianoKeys();
    this.drawGrid();
    this.drawNotes();
  }

  private drawPianoKeys(): void {
    const [minPitch, maxPitch] = this.state.pitchRange;
    const keyHeight = this.NOTE_HEIGHT;

    for (let pitch = maxPitch; pitch >= minPitch; pitch--) {
      const y = (maxPitch - pitch) * keyHeight - this.viewport.scrollY;
      if (y < -keyHeight || y > this.canvas.height) continue;

      const isBlackKey = [1, 3, 6, 8, 10].includes(pitch % 12);
      const keyColor = isBlackKey ? '#1a1a1a' : '#ffffff';

      this.ctx.fillStyle = keyColor;
      this.ctx.fillRect(0, y, this.KEY_WIDTH, keyHeight);

      this.ctx.strokeStyle = this.GRID_COLOR;
      this.ctx.strokeRect(0, y, this.KEY_WIDTH, keyHeight);

      if (pitch % 12 === 0) {
        this.ctx.fillStyle = '#B3B3B3';
        this.ctx.font = '10px sans-serif';
        this.ctx.fillText(this.getNoteName(pitch), 5, y + keyHeight / 2 + 3);
      }
    }
  }

  private drawGrid(): void {
    const { width, height } = this.canvas;
    const [minPitch, maxPitch] = this.state.pitchRange;
    const keyHeight = this.NOTE_HEIGHT;
    const pps = this.state.pixelsPerSecond * this.viewport.zoom;

    this.ctx.strokeStyle = this.GRID_COLOR;
    this.ctx.lineWidth = 1;

    for (let pitch = maxPitch; pitch >= minPitch; pitch--) {
      const y = (maxPitch - pitch) * keyHeight - this.viewport.scrollY;
      if (y < 0 || y > height) continue;

      if (pitch % 12 === 0) {
        this.ctx.strokeStyle = '#4a4a4a';
      } else if ([1, 3, 6, 8, 10].includes(pitch % 12)) {
        this.ctx.strokeStyle = '#2a2a2a';
      } else {
        this.ctx.strokeStyle = this.GRID_COLOR;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(this.KEY_WIDTH, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    const startTime = Math.floor(this.viewport.scrollX / pps);
    const endTime = Math.ceil((this.viewport.scrollX + width) / pps);

    for (let time = startTime; time <= endTime; time++) {
      const x = this.KEY_WIDTH + time * pps - this.viewport.scrollX;
      if (x < this.KEY_WIDTH) continue;

      this.ctx.strokeStyle = time % 4 === 0 ? '#3a3a3a' : this.GRID_COLOR;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
  }

  private drawNotes(): void {
    const [minPitch, maxPitch] = this.state.pitchRange;
    const keyHeight = this.NOTE_HEIGHT;
    const pps = this.state.pixelsPerSecond * this.viewport.zoom;

    for (const note of this.state.notes) {
      const x = this.KEY_WIDTH + note.startTime * pps - this.viewport.scrollX;
      const y = (maxPitch - note.pitch) * keyHeight - this.viewport.scrollY;
      const noteWidth = note.duration * pps;

      if (x + noteWidth < this.KEY_WIDTH || x > this.canvas.width) continue;
      if (y + keyHeight < 0 || y > this.canvas.height) continue;

      const alpha = 0.3 + (note.velocity / 127) * 0.7;
      const color = note.isAiSuggestion ? this.NOTE_COLORS.aiSuggestion : this.NOTE_COLORS.default;

      this.ctx.fillStyle = this.hexToRgba(color, alpha);
      this.ctx.fillRect(x, y + 1, noteWidth, keyHeight - 2);

      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, y + 1, noteWidth, keyHeight - 2);

      if (noteWidth > 30) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px sans-serif';
        this.ctx.fillText(this.getNoteName(note.pitch), x + 3, y + keyHeight / 2 + 3);
      }
    }
  }

  private handleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const [maxPitch] = this.state.pitchRange;
    const keyHeight = this.NOTE_HEIGHT;
    const pps = this.state.pixelsPerSecond * this.viewport.zoom;

    const time = (x + this.viewport.scrollX - this.KEY_WIDTH) / pps;
    const pitch = maxPitch - Math.floor((y + this.viewport.scrollY) / keyHeight);

    if (time >= 0 && pitch >= this.state.pitchRange[0] && pitch <= this.state.pitchRange[1]) {
      const clickedNote = this.state.notes.find(note =>
        note.pitch === pitch &&
        time >= note.startTime &&
        time <= note.startTime + note.duration
      );

      if (clickedNote) {
        this.canvas.dispatchEvent(new CustomEvent('noteSelected', { detail: clickedNote }));
      } else {
        this.canvas.dispatchEvent(new CustomEvent('pianoKeyPressed', { detail: { pitch, time } }));
      }
    }
  }

  private handleScroll(e: WheelEvent): void {
    e.preventDefault();

    if (e.ctrlKey) {
      this.handleZoom(e);
    } else {
      const maxScrollY = (this.state.pitchRange[1] - this.state.pitchRange[0]) * this.NOTE_HEIGHT;
      this.viewport.scrollX = Math.max(0, this.viewport.scrollX + e.deltaX);
      this.viewport.scrollY = Math.max(0, Math.min(maxScrollY, this.viewport.scrollY + e.deltaY));
      this.render();
    }
  }

  private handleZoom(e: WheelEvent): void {
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(10, this.viewport.zoom * zoomFactor));

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseTime = (mouseX + this.viewport.scrollX - this.KEY_WIDTH) / (this.state.pixelsPerSecond * this.viewport.zoom);

    this.viewport.zoom = newZoom;

    const newMouseX = mouseTime * this.state.pixelsPerSecond * newZoom - this.viewport.scrollX + this.KEY_WIDTH;
    this.viewport.scrollX += mouseX - newMouseX;

    this.render();
  }

  private getNoteName(pitch: number): string {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(pitch / 12) - 1;
    const noteName = noteNames[pitch % 12];
    return `${noteName}${octave}`;
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
