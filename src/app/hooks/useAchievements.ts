import { useMemo } from 'react';
import { useFavorites } from './useFavorites';

export const achievementDefinitions = {
  firstFavorite: { type: 'first_favorite', title: 'First Favorite', description: 'Save your first favorite team.', icon: '⭐', points: 10 },
  devotedFan: { type: 'devoted_fan', title: 'Devoted Fan', description: 'Save five favorite teams.', icon: '💙', points: 25 },
  predictionScout: { type: 'prediction_scout', title: 'Prediction Scout', description: 'Explore sports predictions.', icon: '🎯', points: 15 },
};

export function useAchievements() {
  const { favorites } = useFavorites();
  const achievements = useMemo(() => {
    const unlocked = [] as { achievement_type: string }[];
    if (favorites.length > 0) unlocked.push({ achievement_type: 'first_favorite' });
    if (favorites.length >= 5) unlocked.push({ achievement_type: 'devoted_fan' });
    return unlocked;
  }, [favorites.length]);
  const points = achievements.reduce((total, achievement) => total + Object.values(achievementDefinitions).find((definition) => definition.type === achievement.achievement_type)?.points! || total, 0);
  return { achievements, progress: { percentage: Math.round((achievements.length / Object.keys(achievementDefinitions).length) * 100), unlocked: achievements.length, total: Object.keys(achievementDefinitions).length, points } };
}
