export interface ScanResult {
  id: string;
  timestamp: number;
  imageUri: string; // Base64 extracted image
  transcription: string;
  explanation: string;
}

export interface HomeworkResponse {
  transcription: string;
  explanation: string;
}

export type AppScreen = 'home' | 'camera' | 'solution' | 'history' | 'image_editor';