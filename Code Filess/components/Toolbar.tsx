"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Eraser, Circle, Square, PaintBucket } from "lucide-react";

type Props = {
  tool: string;
  setTool: (tool: string) => void;
};

export default function Toolbar({ tool, setTool }: Props) {
  return (
    <div className="flex space-x-2">
      <Button variant={tool === "freehand" ? "default" : "outline"} size="icon" onClick={() => setTool("freehand")}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant={tool === "rectangle" ? "default" : "outline"} size="icon" onClick={() => setTool("rectangle")}>
        <Square className="h-4 w-4" />
      </Button>
      <Button variant={tool === "circle" ? "default" : "outline"} size="icon" onClick={() => setTool("circle")}>
        <Circle className="h-4 w-4" />
      </Button>
      <Button variant={tool === "eraser" ? "default" : "outline"} size="icon" onClick={() => setTool("eraser")}>
        <Eraser className="h-4 w-4" />
      </Button>
      <Button variant={tool === "fill" ? "default" : "outline"} size="icon" onClick={() => setTool("fill")}>
        <PaintBucket className="h-4 w-4" />
      </Button>
    </div>
  );
}
