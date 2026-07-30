import { useCallback, useEffect, useState } from 'react';
import { Sport } from '@/app/data/sportsData';

export interface Favorite {
  id: number;
  team_name: string;
  team_abbr?: string;
  league: string;
  sport: Sport;
}

const storageKey = 'scorehub-favorites';
const changeEvent = 'scorehub-favorites-change';

function readFavorites(): Favorite[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(readFavorites);

  useEffect(() => {
    const syncFavorites = () => setFavorites(readFavorites());
    window.addEventListener(changeEvent, syncFavorites);
    return () => window.removeEventListener(changeEvent, syncFavorites);
  }, []);

  const toggleFavorite = useCallback(async (favorite: Omit<Favorite, 'id'>) => {
    const next = readFavorites();
    const index = next.findIndex((item) => item.team_name === favorite.team_name);
    if (index >= 0) next.splice(index, 1);
    else next.push({ ...favorite, id: Date.now() });
    localStorage.setItem(storageKey, JSON.stringify(next));
    window.dispatchEvent(new Event(changeEvent));
  }, []);

  const isFavorite = useCallback((teamName: string) => favorites.some((favorite) => favorite.team_name === teamName), [favorites]);

  return { favorites, isFavorite, toggleFavorite };
}
