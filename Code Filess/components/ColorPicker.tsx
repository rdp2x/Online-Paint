"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function ColorPicker({ color, setColor }: { color: string, setColor: (color: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[80px] h-[35px]"
          style={{ backgroundColor: color }}
        >
          <span className="sr-only">Pick a color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px]">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Pick a color</h4>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-[50px]"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
