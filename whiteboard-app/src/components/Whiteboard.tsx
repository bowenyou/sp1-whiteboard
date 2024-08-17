"use client";

import React, { useRef, useState, MouseEvent } from 'react';

type StrokeType = 'Begin' | 'Draw';

interface Stroke {
  stroke_type: StrokeType;
  x: number;
  y: number;
  color: [number, number, number]; // RGB color tuple
}

const drawLineBresenham = (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) => {
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = (x0 < x1) ? 1 : -1;
  let sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;

  while (true) {
    ctx.fillRect(x0, y0, 1, 1); // Draw a single pixel

    if (x0 === x1 && y0 === y1) break;
    let e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }
};

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentColor, setCurrentColor] = useState<[number, number, number]>([255, 255, 255]); // Default to white

  // Initialize the canvas with a black background
  const initializeCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    }
  };

  const startDrawing = (event: MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = event.nativeEvent;
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      ctx.strokeStyle = `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`;
    }
    setStrokes(prevStrokes => [
      ...prevStrokes,
      { stroke_type: 'Begin', x: offsetX, y: offsetY, color: currentColor }
    ]);
  };

  const draw = (event: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = event.nativeEvent;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      const lastStroke = strokes[strokes.length - 1];
      ctx.fillStyle = `rgb(${currentColor[0]}, ${currentColor[1]}, ${currentColor[2]})`;
      drawLineBresenham(ctx, lastStroke.x, lastStroke.y, offsetX, offsetY);
      setStrokes(prevStrokes => [
        ...prevStrokes,
        { stroke_type: 'Draw', x: offsetX, y: offsetY, color: currentColor }
      ]);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const resetCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      initializeCanvas();
      setStrokes([]); // Clear all strokes
    }
  };

  const saveDrawingAsImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const image = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = image;
      a.download = 'whiteboard.png';
      a.click();
    }
  };

  const saveDrawingAsJSON = () => {
    const json = JSON.stringify(strokes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drawing.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadDrawing = (file: File) => {
    const reader = new FileReader();
    reader.onload = function() {
      const json = reader.result as string;
      const loadedStrokes: Stroke[] = JSON.parse(json);
      setStrokes(loadedStrokes);
      redraw(loadedStrokes);
    };
    reader.readAsText(file);
  };

  const redraw = (loadedStrokes: Stroke[]) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      initializeCanvas(); // Reinitialize to ensure black background

      let lastX: number | null = null;
      let lastY: number | null = null;

      loadedStrokes.forEach((stroke) => {
        ctx.fillStyle = `rgb(${stroke.color[0]}, ${stroke.color[1]}, ${stroke.color[2]})`;

        if (stroke.stroke_type === 'Begin') {
          lastX = stroke.x;
          lastY = stroke.y;
        } else if (stroke.stroke_type === 'Draw' && lastX !== null && lastY !== null) {
          drawLineBresenham(ctx, lastX, lastY, stroke.x, stroke.y);
          lastX = stroke.x;
          lastY = stroke.y;
        }
      });
    }
  };


  const handleColorChange = (color: string, index: number) => {
    const rgb = [...currentColor] as [number, number, number];
    rgb[index] = parseInt(color, 10);
    setCurrentColor(rgb);
  };

  // Ensure canvas is initialized with a black background on mount
  React.useEffect(() => {
    initializeCanvas();
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        style={{ border: '1px solid black' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div>
        <button onClick={resetCanvas}>Reset</button>
        <button onClick={saveDrawingAsImage}>Save as PNG</button>
        <button onClick={saveDrawingAsJSON}>Save as JSON</button>
        <input type="file" onChange={(e) => loadDrawing(e.target.files![0])} />
      </div>
      <div>
        <label>
          R:
          <input
            type="number"
            min="0"
            max="255"
            value={currentColor[0]}
            onChange={(e) => handleColorChange(e.target.value, 0)}
          />
        </label>
        <label>
          G:
          <input
            type="number"
            min="0"
            max="255"
            value={currentColor[1]}
            onChange={(e) => handleColorChange(e.target.value, 1)}
          />
        </label>
        <label>
          B:
          <input
            type="number"
            min="0"
            max="255"
            value={currentColor[2]}
            onChange={(e) => handleColorChange(e.target.value, 2)}
          />
        </label>
      </div>
    </div>
  );
};

export default Whiteboard;


