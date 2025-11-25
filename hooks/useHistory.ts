import { useState, useEffect, useCallback } from 'react';
import { ScanResult } from '../types';

const STORAGE_KEY = 'study_buddy_history_v1';

export const useHistory = () => {
  const [history, setHistory] = useState<ScanResult[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const saveScan = useCallback((scan: ScanResult) => {
    setHistory((prev) => {
      const updated = [scan, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const deleteScan = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { history, saveScan, clearHistory, deleteScan };
};