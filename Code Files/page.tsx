"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Circle, Download, Eraser, Pencil, Square, Undo, Redo, PaintBucket, Trash2 } from "lucide-react"

type Tool = "freehand" | "rectangle" | "circle" | "eraser" | "fill" | "line"

export default function ExcalidrawClone() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>("freehand")
  const [color, setColor] = useState("#000000")
  const [penSize, setPenSize] = useState(2)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [snapshot, setSnapshot] = useState<ImageData | null>(null)
  const [history, setHistory] = useState<ImageData[]>([])
  const [redoStack, setRedoStack] = useState<ImageData[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const handleResize = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      ctx.putImageData(imageData, 0, 0)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setStartPoint({ x, y })

    if (tool === "fill") {
      fillArea(x, y)
    } else {
      // Take a snapshot of the current canvas state
      const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height)
      setSnapshot(currentState)
      setHistory(prevHistory => [...prevHistory, currentState])
      setRedoStack([])
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.strokeStyle = color
    ctx.lineWidth = penSize
    ctx.lineCap = "round"

    if (snapshot) {
      ctx.putImageData(snapshot, 0, 0)
    }

    switch (tool) {
      case "freehand":
        ctx.lineTo(x, y)
        ctx.stroke()
        break
      case "rectangle":
        ctx.beginPath()
        ctx.rect(startPoint.x, startPoint.y, x - startPoint.x, y - startPoint.y)
        ctx.stroke()
        break
      case "circle":
        ctx.beginPath()
        const radius = Math.sqrt(
          Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2)
        )
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI)
        ctx.stroke()
        break
      case "eraser":
        ctx.strokeStyle = "#FFFFFF"
        ctx.lineTo(x, y)
        ctx.stroke()
        break
      case "line":
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(x, y)
        ctx.stroke()
        break
    }
  }

  const endDrawing = () => {
    setIsDrawing(false)
    setSnapshot(null)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
  }

  const fillArea = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory(prevHistory => [...prevHistory, currentState])
    setRedoStack([])

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const targetColor = getPixelColor(imageData, x, y)
    const fillColor = hexToRgb(color)

    if (!fillColor) return

    const stack = [{ x, y }]
    const visited = new Set<string>()

    while (stack.length > 0) {
      const { x, y } = stack.pop()!
      const key = `${x},${y}`

      if (
        x < 0 ||
        x >= canvas.width ||
        y < 0 ||
        y >= canvas.height ||
        visited.has(key)
      ) {
        continue
      }

      visited.add(key)

      if (colorMatch(getPixelColor(imageData, x, y), targetColor)) {
        setPixelColor(imageData, x, y, fillColor)

        stack.push({ x: x + 1, y })
        stack.push({ x: x - 1, y })
        stack.push({ x, y: y + 1 })
        stack.push({ x, y: y - 1 })
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const getPixelColor = (
    imageData: ImageData,
    x: number,
    y: number
  ): [number, number, number, number] => {
    const index = (y * imageData.width + x) * 4
    return [
      imageData.data[index],
      imageData.data[index + 1],
      imageData.data[index + 2],
      imageData.data[index + 3],
    ]
  }

  const setPixelColor = (
    imageData: ImageData,
    x: number,
    y: number,
    color: [number, number, number, number]
  ) => {
    const index = (y * imageData.width + x) * 4
    imageData.data[index] = color[0]
    imageData.data[index + 1] = color[1]
    imageData.data[index + 2] = color[2]
    imageData.data[index + 3] = color[3]
  }

  const colorMatch = (
    color1: [number, number, number, number],
    color2: [number, number, number, number]
  ): boolean => {
    return (
      color1[0] === color2[0] &&
      color1[1] === color2[1] &&
      color1[2] === color2[2] &&
      color1[3] === color2[3]
    )
  }

  const hexToRgb = (hex: string): [number, number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
          255,
        ]
      : null
  }

  const saveDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = 'drawing.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  const undo = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (history.length > 0) {
      const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height)
      setRedoStack(prevRedoStack => [...prevRedoStack, currentState])

      const previousState = history.pop()
      if (previousState) {
        ctx.putImageData(previousState, 0, 0)
        setHistory([...history])
      }
    }
  }

  const redo = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (redoStack.length > 0) {
      const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height)
      setHistory(prevHistory => [...prevHistory, currentState])

      const nextState = redoStack.pop()
      if (nextState) {
        ctx.putImageData(nextState, 0, 0)
        setRedoStack([...redoStack])
      }
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setHistory(prevHistory => [...prevHistory, currentState])
    setRedoStack([])

    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex justify-between items-center p-4 bg-gray-100">
        <div className="flex space-x-2">
          <Button
            variant={tool === "freehand" ? "default" : "outline"}
            size="icon"
            onClick={() => setTool("freehand")}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Freehand</span>
          </Button>
          <Button
            variant={tool === "rectangle" ? "default" : "outline"}
            size="icon"
            onClick={() => setTool("rectangle")}
          >
            <Square className="h-4 w-4" />
            <span className="sr-only">Rectangle</span>
          </Button>
          <Button
            variant={tool === "circle" ? "default" : "outline"}
            size="icon"
            onClick={() => setTool("circle")}
          >
            <Circle className="h-4 w-4" />
            <span className="sr-only">Circle</span>
          </Button>
          <Button
            variant={tool === "eraser" ? "default" : "outline"}
            size="icon"
            onClick={() => setTool("eraser")}
          >
            <Eraser className="h-4 w-4" />
            <span className="sr-only">Eraser</span>
          </Button>
          <Button
            variant={tool === "fill" ? "default" : "outline"}
            size="icon"
            onClick={() => setTool("fill")}
          >
            <PaintBucket className="h-4 w-4" />
            <span className="sr-only">Fill</span>
          </Button>
          <Button
            variant={tool === "line" ? "default" : "outline"}
            size="icon"
            onClick={() => setTool("line")}
          >
            <span className="font-bold">/</span>
            <span className="sr-only">Line</span>
          </Button>
        </div>
        <div className="flex items-center space-x-4">
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
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Pick a color</h4>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-[50px]"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Pen Size:</span>
            <Slider
              min={1}
              max={20}
              step={1}
              value={[penSize]}
              onValueChange={(value) => setPenSize(value[0])}
              className="w-[100px]"
            />
          </div>
          <Button onClick={saveDrawing} variant="outline" size="icon">
            <Download className="h-4 w-4" />
            <span className="sr-only">Save</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={undo}
            disabled={history.length === 0}
          >
            <Undo className="h-4 w-4" />
            <span className="sr-only">Undo</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={redo}
            disabled={redoStack.length === 0}
          >
            <Redo className="h-4 w-4" />
            <span className="sr-only">Redo</span>
          </Button>
          <Button onClick={clearCanvas} variant="outline">
            CLEAR
          </Button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseOut={endDrawing}
        className="flex-grow cursor-crosshair"
      />
    </div>
  )
}