import React, { useRef, useState, MouseEvent } from 'react';
import './Whiteboard.css'; // Import the CSS file

type StrokeType = 'Begin' | 'Draw';

interface Stroke {
  stroke_type: StrokeType;
  x: number;
  y: number;
  color: [number, number, number]; // RGB color tuple
}

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentColor, setCurrentColor] = useState<[number, number, number]>([0, 0, 0]); // Default to black

  // Initialize the canvas with a white background
  const initializeCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'white';
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
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
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

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    const rgb = hexToRgb(color);
    if (rgb) {
      setCurrentColor(rgb);
    }
  };

  const hexToRgb = (hex: string): [number, number, number] | null => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] as [number, number, number] : null;
  };

  // Ensure canvas is initialized with a white background on mount
  React.useEffect(() => {
    initializeCanvas();
  }, []);

  return (
    <div className="container">
      <div className="whiteboardWrapper">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="canvas"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
      <div className="controls">
        <button className="button" onClick={resetCanvas}>Reset</button>
        <button className="button" onClick={saveDrawingAsImage}>Save as PNG</button>
        <button className="button" onClick={saveDrawingAsJSON}>Save as JSON</button>
        <label className="colorLabel">
          <span>Select Color:</span>
          <input 
            type="color" 
            onChange={handleColorChange} 
            value={`#${((1 << 24) + (currentColor[0] << 16) + (currentColor[1] << 8) + currentColor[2]).toString(16).slice(1)}`} 
            className="colorPicker"
          />
        </label>
      </div>
    </div>
  );
};

export default Whiteboard;
