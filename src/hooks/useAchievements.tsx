import { useState, useEffect, useCallback } from 'react';
import { Badge, UserStats, UserLevel } from '../shared/types/achievements.types';
import { achievementsApi, USER_LEVELS } from '../services/achievementsApi';
import { userStore } from '../shared/store/userStore';

interface AchievementsHookReturn {
  // Данные
  allBadges: Badge[];
  userBadges: Badge[];
  userStats: UserStats | null;
  userLevel: UserLevel | null;
  nextLevel: UserLevel | null;
  
  // Состояние загрузки
  loading: boolean;
  error: string | null;
  
  // Новые достижения
  newAchievement: Badge | null;
  hasNewAchievement: boolean;
  
  // Методы
  checkAchievements: () => Promise<void>;
  dismissNewAchievement: () => void;
  updateUserStats: (updates: Partial<UserStats>) => Promise<void>;
  triggerAchievementCheck: (activity: string, value?: number) => Promise<void>;
}

export const useAchievements = (): AchievementsHookReturn => {
  // Состояние данных
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [nextLevel, setNextLevel] = useState<UserLevel | null>(null);
  
  // Состояние загрузки
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Новые достижения
  const [newAchievement, setNewAchievement] = useState<Badge | null>(null);
  const [hasNewAchievement, setHasNewAchievement] = useState(false);

  // Загрузка начальных данных
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      const userId = userStore.user?.id || 1;
      
      // Загружаем все данные параллельно
      const [badges, userBadgesData, statsData] = await Promise.all([
        achievementsApi.getBadges(),
        achievementsApi.getUserBadges(userId),
        achievementsApi.getUserStats(userId)
      ]);
      
      setAllBadges(badges);
      setUserBadges(userBadgesData);
      setUserStats(statsData);
      
      // Определяем уровни
      const currentLevel = achievementsApi.getUserLevel(statsData.totalPoints);
      setUserLevel(currentLevel);
      
      const nextLvl = currentLevel && currentLevel.level < USER_LEVELS.length 
        ? USER_LEVELS[currentLevel.level] 
        : null;
      setNextLevel(nextLvl);
      
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке достижений:', err);
      setError('Не удалось загрузить данные достижений');
    } finally {
      setLoading(false);
    }
  }, []);

  // Проверка новых достижений
  const checkAchievements = useCallback(async () => {
    if (!userStats) return;
    
    try {
      const userId = userStore.user?.id || 1;
      const availableBadges = await achievementsApi.checkAchievements(userId, userStats);
      
      // Находим новые достижения (которых еще нет у пользователя)
      const newBadges = availableBadges.filter(badge => 
        !userBadges.some(userBadge => userBadge.id === badge.id)
      );
      
      if (newBadges.length > 0) {
        // Показываем первое новое достижение
        const firstNewBadge = newBadges[0];
        setNewAchievement(firstNewBadge);
        setHasNewAchievement(true);
        
        // Добавляем очки пользователю
        await achievementsApi.addUserPoints(
          userId, 
          firstNewBadge.points, 
          `Получение достижения: ${firstNewBadge.name}`
        );
        
        // Обновляем список пользовательских бейджей
        setUserBadges(prev => [...prev, ...newBadges]);
        
        // Обновляем статистику пользователя
        if (userStats) {
          const updatedStats = {
            ...userStats,
            totalPoints: userStats.totalPoints + firstNewBadge.points
          };
          setUserStats(updatedStats);
          
          // Проверяем изменение уровня
          const newLevel = achievementsApi.getUserLevel(updatedStats.totalPoints);
          if (newLevel.level > (userLevel?.level || 0)) {
            setUserLevel(newLevel);
            
            const nextLvl = newLevel.level < USER_LEVELS.length 
              ? USER_LEVELS[newLevel.level] 
              : null;
            setNextLevel(nextLvl);
          }
        }
      }
    } catch (err) {
      console.error('Ошибка при проверке достижений:', err);
    }
  }, [userStats, userBadges, userLevel]);

  // Отклонение уведомления о новом достижении
  const dismissNewAchievement = useCallback(() => {
    setNewAchievement(null);
    setHasNewAchievement(false);
  }, []);

  // Обновление статистики пользователя
  const updateUserStats = useCallback(async (updates: Partial<UserStats>) => {
    if (!userStats) return;
    
    const updatedStats = { ...userStats, ...updates };
    setUserStats(updatedStats);
    
    // Автоматически проверяем новые достижения после обновления статистики
    setTimeout(checkAchievements, 100);
  }, [userStats, checkAchievements]);

  // Триггер проверки достижений при определенной активности
  const triggerAchievementCheck = useCallback(async (activity: string, value: number = 1) => {
    if (!userStats) return;
    
    // Обновляем соответствующую статистику в зависимости от активности
    const updates: Partial<UserStats> = {};
    
    switch (activity) {
      case 'post_created':
        updates.totalPosts = userStats.totalPosts + value;
        break;
      case 'comment_created':
        updates.totalComments = userStats.totalComments + value;
        break;
      case 'like_received':
        updates.totalLikes = userStats.totalLikes + value;
        break;
      case 'photo_uploaded':
        updates.totalPhotos = userStats.totalPhotos + value;
        break;
      case 'fishing_spot_added':
        updates.fishingSpots = userStats.fishingSpots + value;
        break;
      case 'fish_caught':
        updates.fishCaught = userStats.fishCaught + value;
        break;
      case 'user_helped':
        updates.helpedUsers = userStats.helpedUsers + value;
        break;
      case 'follower_gained':
        updates.followers = userStats.followers + value;
        break;
      default:
        console.warn(`Неизвестный тип активности: ${activity}`);
        return;
    }
    
    await updateUserStats(updates);
  }, [userStats, updateUserStats]);

  // Загружаем данные при монтировании
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    // Данные
    allBadges,
    userBadges,
    userStats,
    userLevel,
    nextLevel,
    
    // Состояние загрузки
    loading,
    error,
    
    // Новые достижения
    newAchievement,
    hasNewAchievement,
    
    // Методы
    checkAchievements,
    dismissNewAchievement,
    updateUserStats,
    triggerAchievementCheck
  };
}; 