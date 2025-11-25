import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Sun, Contrast, ArrowRight, Wand2 } from 'lucide-react';

interface ImageEditorProps {
  imageUri: string;
  onConfirm: (editedImage: string) => void;
  onCancel: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageUri, onConfirm, onCancel }) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isGrayscale, setIsGrayscale] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Style for the preview image to show instant feedback without constant canvas redraws
  const [previewStyle, setPreviewStyle] = useState({});

  useEffect(() => {
    const filters = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      isGrayscale ? 'grayscale(100%)' : ''
    ].filter(Boolean).join(' ');

    setPreviewStyle({ filter: filters });
  }, [brightness, contrast, isGrayscale]);

  const handleDone = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Fill white background (handles transparent PNGs if any)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply filters
      const filters = [
        `brightness(${brightness}%)`,
        `contrast(${contrast}%)`,
        isGrayscale ? 'grayscale(100%)' : ''
      ].filter(Boolean).join(' ');
      
      ctx.filter = filters;
      ctx.drawImage(img, 0, 0);
      
      // Reset filter for good measure
      ctx.filter = 'none';
      
      onConfirm(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = imageUri;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <button 
          onClick={onCancel}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="font-semibold text-lg">Enhance Image</span>
        <button 
          onClick={handleDone}
          className="p-2 text-blue-400 hover:text-blue-300 font-bold flex items-center gap-2"
        >
          Next <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Image Preview Area */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4 bg-black/50">
        <img 
          src={imageUri} 
          alt="Preview" 
          className="max-w-full max-h-full object-contain shadow-2xl transition-all duration-100"
          style={previewStyle} 
        />
        {/* Hidden Canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-6 pb-safe">
        
        {/* Sliders */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-slate-300 text-sm font-medium">
              <div className="flex items-center gap-2 text-blue-400">
                <Sun className="w-4 h-4" /> Brightness
              </div>
              <span>{brightness}%</span>
            </div>
            <input 
              type="range" min="50" max="200" value={brightness} 
              onChange={e => setBrightness(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-slate-300 text-sm font-medium">
              <div className="flex items-center gap-2 text-purple-400">
                <Contrast className="w-4 h-4" /> Contrast
              </div>
              <span>{contrast}%</span>
            </div>
            <input 
              type="range" min="50" max="200" value={contrast} 
              onChange={e => setContrast(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-4">
          <button
            onClick={() => setIsGrayscale(!isGrayscale)}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all border ${
              isGrayscale 
                ? 'bg-slate-100 text-slate-900 border-slate-100' 
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            {isGrayscale ? "B&W On" : "B&W Off"}
          </button>
          
          <button
            onClick={() => { setBrightness(100); setContrast(100); setIsGrayscale(false); }}
            className="px-6 py-3 rounded-xl font-medium text-sm text-slate-400 border border-slate-700 hover:bg-slate-800 transition-all"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};