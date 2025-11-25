import React, { useState } from 'react';
import { Home } from './pages/Home';
import { CameraView } from './pages/CameraView';
import { SolutionView } from './pages/SolutionView';
import { History } from './pages/History';
import { ImageEditor } from './pages/ImageEditor';
import { NavBar } from './components/NavBar';
import { LoadingOverlay } from './components/LoadingOverlay';
import { useHistory } from './hooks/useHistory';
import { analyzeHomework, explainText } from './services/geminiService';
import { AppScreen, ScanResult } from './types';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [currentSolution, setCurrentSolution] = useState<ScanResult | null>(null);
  
  // State to hold image before and after editing
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  
  const { history, saveScan, deleteScan, clearHistory } = useHistory();

  const handleNavigate = (newScreen: AppScreen) => {
    setScreen(newScreen);
    if (newScreen === 'home') {
      setCurrentSolution(null);
      setCurrentImage(null);
    }
  };

  // Step 1: Capture Image
  const handleCapture = (imageData: string) => {
    setCurrentImage(imageData);
    setScreen('image_editor');
  };

  // Step 2: Confirm Edit and Analyze
  const handleEditorConfirm = async (editedImage: string) => {
    setLoadingStatus('Processing image...');
    setIsLoading(true);
    setScreen('home'); // Or stay on a loading screen, but 'home' + overlay works well

    try {
      const base64Data = editedImage.split(',')[1];
      
      setLoadingStatus('AI is solving the problem...');
      const response = await analyzeHomework(base64Data);

      const newScan: ScanResult = {
        id: uuidv4(),
        timestamp: Date.now(),
        imageUri: editedImage,
        transcription: response.transcription,
        explanation: response.explanation,
      };

      saveScan(newScan);
      setCurrentSolution(newScan);
      setScreen('solution');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Something went wrong.");
      setScreen('home');
    } finally {
      setIsLoading(false);
    }
  };

  // Text/Voice-based analysis
  const handleTextSubmit = async (text: string) => {
    setLoadingStatus('Analyzing your question...');
    setIsLoading(true);
    setScreen('home');

    try {
      const response = await explainText(text);

      const newScan: ScanResult = {
        id: uuidv4(),
        timestamp: Date.now(),
        // Use a placeholder image or a generated text-image for history visual
        imageUri: `https://placehold.co/600x400/e2e8f0/475569?text=Text+Query&font=roboto`, 
        transcription: response.transcription,
        explanation: response.explanation,
      };

      saveScan(newScan);
      setCurrentSolution(newScan);
      setScreen('solution');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Something went wrong.");
      setScreen('home');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (item: ScanResult) => {
    setCurrentSolution(item);
    setScreen('solution');
  };

  return (
    <div className="h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {screen === 'home' && (
          <Home onScanClick={() => setScreen('camera')} />
        )}

        {screen === 'camera' && (
          <CameraView 
            onCapture={handleCapture} 
            onTextSubmit={handleTextSubmit}
            onCancel={() => setScreen('home')} 
          />
        )}

        {screen === 'image_editor' && currentImage && (
          <ImageEditor
            imageUri={currentImage}
            onConfirm={handleEditorConfirm}
            onCancel={() => setScreen('camera')}
          />
        )}

        {screen === 'solution' && currentSolution && (
          <SolutionView 
            data={currentSolution} 
            onBack={() => setScreen('home')} 
          />
        )}

        {screen === 'history' && (
          <History 
            history={history} 
            onSelect={handleHistorySelect}
            onDelete={deleteScan}
            onClear={clearHistory}
          />
        )}

        {isLoading && <LoadingOverlay status={loadingStatus} />}
      </main>

      {/* Navigation Bar */}
      <NavBar currentScreen={screen} onNavigate={handleNavigate} />
    </div>
  );
}