import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Camera as CameraIcon, RefreshCw, AlertCircle, Image as ImageIcon, Mic, MicOff, Keyboard, ArrowRight } from 'lucide-react';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  onTextSubmit: (text: string) => void;
  onCancel: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, onTextSubmit, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  // Voice/Text Mode State
  const [isTextMode, setIsTextMode] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // --- Camera Logic ---

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = useCallback(async () => {
    if (isTextMode) {
      stopCamera();
      return;
    }

    stopCamera();
    setError(null);

    try {
      let newStream: MediaStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (constraintErr: any) {
        if (constraintErr.name === 'OverconstrainedError' || constraintErr.name === 'ConstraintNotSatisfiedError') {
           console.warn("Camera constraints failed, falling back to basic config.");
           newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } else {
          throw constraintErr;
        }
      }
      
      streamRef.current = newStream;
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.error("Camera Access Error:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError("Camera access denied. Please allow permissions or use manual input.");
      } else if (err.name === 'NotFoundError') {
        setError("No camera found. Please use manual input.");
      } else {
        setError("Unable to access camera.");
      }
    }
  }, [facingMode, isTextMode]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const imageData = canvas.toDataURL('image/jpeg', 0.8);
              onCapture(imageData);
            }
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  // --- Voice / Text Logic ---

  const toggleTextMode = () => {
    setIsTextMode(!isTextMode);
    setInputText('');
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInputText(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // --- Render ---

  if (isTextMode) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-50 flex flex-col">
        {/* Text Mode Header */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
           <button onClick={toggleTextMode} className="p-2 -ml-2 text-slate-600 dark:text-slate-300">
             <X className="w-6 h-6" />
           </button>
           <span className="font-semibold text-slate-900 dark:text-white">Dictate Question</span>
           <div className="w-8" /> {/* Spacer */}
        </div>

        {/* Text Area */}
        <div className="flex-1 p-4 flex flex-col">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tap the microphone to speak, or type your question here..."
            className="flex-1 w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-lg leading-relaxed text-slate-900 dark:text-slate-100 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Voice Controls */}
        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-center gap-6">
            <button 
              onClick={toggleListening}
              className={`p-6 rounded-full transition-all shadow-lg ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-red-500/40 scale-110' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 h-5">
            {isListening ? "Listening..." : "Tap mic to start"}
          </p>

          <button 
            onClick={() => onTextSubmit(inputText)}
            disabled={!inputText.trim()}
            className="w-full mt-2 bg-blue-600 disabled:bg-slate-300 disabled:dark:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            Solve Question
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect}/>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onCancel} className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white font-medium text-sm tracking-wide">Take a Photo</span>
        <button onClick={toggleCamera} className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative overflow-hidden bg-black flex items-center justify-center">
        {error ? (
          <div className="px-6 text-center text-white max-w-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="mb-6">{error}</p>
            <div className="flex flex-col gap-3 w-full">
               <button onClick={() => startCamera()} className="w-full px-6 py-3 bg-blue-600 rounded-xl font-medium hover:bg-blue-700">Retry Camera</button>
               <button onClick={toggleTextMode} className="w-full px-6 py-3 bg-white/10 border border-white/30 rounded-xl font-medium hover:bg-white/20 flex items-center justify-center gap-2">
                 <Keyboard className="w-5 h-5" /> Use Text Input
               </button>
            </div>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="h-32 bg-black flex items-center justify-around pb-8 pt-4 px-6">
        <div className="flex gap-4">
             <button onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20" title="Upload image">
              <ImageIcon className="w-6 h-6" />
            </button>
            <button onClick={toggleTextMode} className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20" title="Voice/Text Input">
              <Keyboard className="w-6 h-6" />
            </button>
        </div>

        <button
          onClick={handleCapture}
          disabled={!!error}
          className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group transition-transform ${!!error ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
        >
          <div className="w-16 h-16 bg-white rounded-full group-hover:bg-slate-200 transition-colors" />
        </button>
        
        {/* Spacer for layout balance */}
        <div className="w-20" />
      </div>
    </div>
  );
};