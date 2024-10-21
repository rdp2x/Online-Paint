"use client";

import { useState } from "react";
import Toolbar from "@/components/Toolbar";
import Canvas from "@/components/Canvas";
import ColorPicker from "@/components/ColorPicker";
import UndoRedoButtons from "@/components/UndoRedoButtons";

export default function ExcalidrawClone() {
  const [tool, setTool] = useState("freehand");
  const [color, setColor] = useState("#000000");
  const [history, setHistory] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  const undo = () => { /* undo logic */ };
  const redo = () => { /* redo logic */ };
  const clearCanvas = () => { /* clear logic */ };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-4 bg-gray-100">
        <Toolbar tool={tool} setTool={setTool} />
        <ColorPicker color={color} setColor={setColor} />
        <UndoRedoButtons undo={undo} redo={redo} clearCanvas={clearCanvas} canUndo={history.length > 0} canRedo={redoStack.length > 0} />
      </div>
      <Canvas tool={tool} />
    </div>
  );
}
