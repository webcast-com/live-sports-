import { useCallback, useEffect, useState } from 'react';

const storageKey = 'scorehub-saved-predictions';
const changeEvent = 'scorehub-saved-predictions-change';

function readSavedPredictions(): string[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch {
    return [];
  }
}

export function useSavedPredictions() {
  const [savedPredictions, setSavedPredictions] = useState<string[]>(readSavedPredictions);

  useEffect(() => {
    const syncSavedPredictions = () => setSavedPredictions(readSavedPredictions());
    window.addEventListener(changeEvent, syncSavedPredictions);
    return () => window.removeEventListener(changeEvent, syncSavedPredictions);
  }, []);

  const toggleSaved = useCallback(async (predictionId: string) => {
    const saved = readSavedPredictions();
    const next = saved.includes(predictionId) ? saved.filter((id) => id !== predictionId) : [...saved, predictionId];
    localStorage.setItem(storageKey, JSON.stringify(next));
    window.dispatchEvent(new Event(changeEvent));
  }, []);

  const isSaved = useCallback((predictionId: string) => savedPredictions.includes(predictionId), [savedPredictions]);
  return { savedPredictions, isSaved, toggleSaved };
}
