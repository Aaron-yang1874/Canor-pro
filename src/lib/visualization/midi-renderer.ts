export interface MidiEvent {
  type: 'noteOn' | 'noteOff' | 'controlChange';
  channel: number;
  note?: number;
  velocity?: number;
  time: number;
  controller?: number;
  value?: number;
}

export interface MidiTrack {
  id: string;
  name: string;
  events: MidiEvent[];
  instrument?: string;
}

export interface NoteBlock {
  id: string;
  pitch: number;
  startTime: number;
  duration: number;
  velocity: number;
  trackId: string;
}

export class MidiRenderer {
  private tracks: MidiTrack[] = [];
  private tempo: number = 120;

  public parseMidi(data: ArrayBuffer): MidiTrack[] {
    const view = new DataView(data);
    let offset = 0;

    if (view.getUint32(offset) !== 0x4D546864) {
      throw new Error('Invalid MIDI file: missing MThd header');
    }
    offset += 4;

    const headerLength = view.getUint32(offset);
    offset += 4;

    const format = view.getUint16(offset);
    offset += 2;

    const numTracks = view.getUint16(offset);
    offset += 2;

    const division = view.getUint16(offset);
    offset += 2;

    this.tracks = [];

    for (let i = 0; i < numTracks; i++) {
      const track = this.parseTrack(view, offset);
      if (track) {
        this.tracks.push(track);
      }
      offset += track ? track.events.length * 4 + 8 : 0;
    }

    return this.tracks;
  }

  private parseTrack(view: DataView, offset: number): MidiTrack | null {
    if (view.getUint32(offset) !== 0x4D54726B) {
      return null;
    }
    offset += 4;

    const trackLength = view.getUint32(offset);
    offset += 4;

    const events: MidiEvent[] = [];
    let eventOffset = offset;
    let absoluteTime = 0;
    let runningStatus = 0;

    while (eventOffset < offset + trackLength) {
      const deltaTime = this.readVariableLength(view, eventOffset);
      eventOffset += this.getVariableLengthSize(deltaTime);
      absoluteTime += deltaTime;

      let status = view.getUint8(eventOffset);
      if (status < 0x80) {
        status = runningStatus;
        eventOffset--;
      }
      eventOffset++;

      const eventType = status >> 4;
      const channel = status & 0x0F;

      if (eventType === 0x08 || eventType === 0x09 || eventType === 0x0A) {
        const note = view.getUint8(eventOffset);
        const velocity = view.getUint8(eventOffset + 1);
        eventOffset += 2;

        if (eventType === 0x09 && velocity > 0) {
          events.push({
            type: 'noteOn',
            channel,
            note,
            velocity,
            time: absoluteTime,
          });
        } else {
          events.push({
            type: 'noteOff',
            channel,
            note,
            velocity,
            time: absoluteTime,
          });
        }
        runningStatus = status;
      } else if (eventType === 0x0B) {
        const controller = view.getUint8(eventOffset);
        const value = view.getUint8(eventOffset + 1);
        eventOffset += 2;

        events.push({
          type: 'controlChange',
          channel,
          controller,
          value,
          time: absoluteTime,
        });
        runningStatus = status;
      } else if (eventType === 0x0F) {
        if (status === 0xFF) {
          const metaType = view.getUint8(eventOffset);
          const metaLength = view.getUint8(eventOffset + 1);
          eventOffset += 2 + metaLength;

          if (metaType === 0x51 && metaLength === 3) {
            const tempoMicroseconds = (view.getUint8(eventOffset) << 16) |
                                      (view.getUint8(eventOffset + 1) << 8) |
                                      view.getUint8(eventOffset + 2);
            this.tempo = 60000000 / tempoMicroseconds;
          }
        } else if (status === 0xF0 || status === 0xF7) {
          const sysexLength = this.readVariableLength(view, eventOffset);
          eventOffset += this.getVariableLengthSize(sysexLength) + sysexLength;
        } else {
          const eventLength = this.readVariableLength(view, eventOffset);
          eventOffset += this.getVariableLengthSize(eventLength) + eventLength;
        }
      }
    }

    return {
      id: `track-${this.tracks.length}`,
      name: 'Track',
      events,
    };
  }

  private readVariableLength(view: DataView, offset: number): number {
    let value = 0;
    let byte: number;

    do {
      byte = view.getUint8(offset++);
      value = (value << 7) + (byte & 0x7F);
    } while (byte & 0x80);

    return value;
  }

  private getVariableLengthSize(value: number): number {
    if (value < 0x80) return 1;
    if (value < 0x4000) return 2;
    if (value < 0x200000) return 3;
    return 4;
  }

  public getNotesFromTrack(track: MidiTrack): NoteBlock[] {
    const notes: NoteBlock[] = [];
    const activeNotes = new Map<number, { startTime: number; velocity: number }>();

    const sortedEvents = [...track.events].sort((a, b) => a.time - b.time);

    for (const event of sortedEvents) {
      if (event.type === 'noteOn' && event.note !== undefined && event.velocity !== undefined) {
        activeNotes.set(event.note, {
          startTime: event.time,
          velocity: event.velocity,
        });
      } else if (event.type === 'noteOff' && event.note !== undefined) {
        const activeNote = activeNotes.get(event.note);
        if (activeNote) {
          notes.push({
            id: `${track.id}-${event.note}-${activeNote.startTime}`,
            pitch: event.note,
            startTime: activeNote.startTime / 480,
            duration: (event.time - activeNote.startTime) / 480,
            velocity: activeNote.velocity,
            trackId: track.id,
          });
          activeNotes.delete(event.note);
        }
      }
    }

    return notes;
  }

  public renderVelocity(velocity: number): { width: number; color: string; opacity: number } {
    const normalized = velocity / 127;
    const width = 20 + normalized * 60;

    let color: string;
    if (normalized < 0.33) {
      color = '#4a9eff';
    } else if (normalized < 0.66) {
      color = '#1DB954';
    } else {
      color = '#ff6b6b';
    }

    return {
      width,
      color,
      opacity: 0.3 + normalized * 0.7,
    };
  }

  public renderTrackDetails(track: MidiTrack): {
    noteCount: number;
    duration: number;
    instruments: string[];
    channels: number[];
  } {
    const noteOnEvents = track.events.filter(e => e.type === 'noteOn');
    const times = track.events.map(e => e.time);
    const duration = times.length > 0 ? Math.max(...times) / 480 : 0;

    const channels = [...new Set(track.events.map(e => e.channel))];
    const instruments = track.instrument ? [track.instrument] : ['Piano'];

    return {
      noteCount: noteOnEvents.length,
      duration,
      instruments,
      channels,
    };
  }
}
