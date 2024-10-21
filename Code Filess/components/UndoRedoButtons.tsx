"use client";

import { Button } from "@/components/ui/button";
import { Undo, Redo, Trash2 } from "lucide-react";

export default function UndoRedoButtons({
  undo,
  redo,
  clearCanvas,
  canUndo,
  canRedo
}: {
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  canUndo: boolean;
  canRedo: boolean;
}) {
  return (
    <div className="flex items-center space-x-4">
      <Button onClick={undo} variant="outline" size="icon" disabled={!canUndo}>
        <Undo className="h-4 w-4" />
        <span className="sr-only">Undo</span>
      </Button>
      <Button onClick={redo} variant="outline" size="icon" disabled={!canRedo}>
        <Redo className="h-4 w-4" />
        <span className="sr-only">Redo</span>
      </Button>
      <Button onClick={clearCanvas} variant="outline">
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Clear</span>
      </Button>
    </div>
  );
}
