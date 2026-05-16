"use client";

import { useEffect, useRef } from "react";
import { PianoRollRenderer, NoteBlock } from "@/lib/visualization/piano-roll";

interface PianoRollCanvasProps {
  notes: NoteBlock[];
  width: number;
  height: number;
  onNoteClick?: (note: NoteBlock) => void;
  zoom?: number;
}

export function PianoRollCanvas({
  notes,
  width,
  height,
  onNoteClick,
  zoom = 1,
}: PianoRollCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<PianoRollRenderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const renderer = new PianoRollRenderer(canvas);
    rendererRef.current = renderer;

    renderer.setNotes(notes);

    const handleNoteSelected = (e: CustomEvent<NoteBlock>) => {
      if (onNoteClick) {
        onNoteClick(e.detail);
      }
    };

    canvas.addEventListener("noteSelected", handleNoteSelected as EventListener);

    return () => {
      canvas.removeEventListener("noteSelected", handleNoteSelected as EventListener);
    };
  }, [width, height, onNoteClick]);

  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setNotes(notes);
    }
  }, [notes]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="bg-[#121212] cursor-crosshair"
      style={{
        maxWidth: "100%",
      }}
    />
  );
}
