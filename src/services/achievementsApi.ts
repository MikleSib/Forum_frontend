import { Badge, BadgeCategory, BadgeRarity, UserStats, Achievement, UserLevel } from '../shared/types/achievements.types';

// Предопределенные бейджи
export const BADGES: Badge[] = [
  // Рыболовные достижения
  {
    id: 'first_catch',
    name: 'Первый улов',
    description: 'Поймайте свою первую рыбу и поделитесь фото',
    icon: '🎣',
    category: BadgeCategory.FISHING,
    rarity: BadgeRarity.COMMON,
    points: 50,
    color: '#4CAF50',
    requirements: [{ type: 'fish_caught', value: 1, operator: '>=' }]
  },
  {
    id: 'trophy_fish',
    name: 'Трофейный экземпляр',
    description: 'Поймайте рыбу весом более 5 кг',
    icon: '🏆',
    category: BadgeCategory.FISHING,
    rarity: BadgeRarity.RARE,
    points: 200,
    color: '#FF9800',
    requirements: [{ type: 'fish_caught', value: 1, operator: '>=' }] // В реальности здесь будет проверка веса
  },
  {
    id: 'variety_hunter',
    name: 'Охотник за разнообразием',
    description: 'Поймайте 10 разных видов рыб',
    icon: '🐟',
    category: BadgeCategory.FISHING,
    rarity: BadgeRarity.UNCOMMON,
    points: 150,
    color: '#2196F3',
    requirements: [{ type: 'fish_caught', value: 10, operator: '>=' }]
  },
  {
    id: 'night_fisher',
    name: 'Ночной охотник',
    description: 'Активная рыбалка в ночное время',
    icon: '🌙',
    category: BadgeCategory.FISHING,
    rarity: BadgeRarity.UNCOMMON,
    points: 100,
    color: '#673AB7',
    requirements: [{ type: 'fish_caught', value: 5, operator: '>=' }]
  },

  // Форумные достижения
  {
    id: 'newcomer',
    name: 'Новичок',
    description: 'Добро пожаловать на форум!',
    icon: '👋',
    category: BadgeCategory.FORUM,
    rarity: BadgeRarity.COMMON,
    points: 10,
    color: '#607D8B',
    requirements: [{ type: 'posts', value: 1, operator: '>=' }]
  },
  {
    id: 'chatterbox',
    name: 'Болтун',
    description: 'Оставьте 100 комментариев',
    icon: '💬',
    category: BadgeCategory.FORUM,
    rarity: BadgeRarity.UNCOMMON,
    points: 100,
    color: '#03A9F4',
    requirements: [{ type: 'comments', value: 100, operator: '>=' }]
  },
  {
    id: 'author',
    name: 'Автор',
    description: 'Создайте 50 постов',
    icon: '✍️',
    category: BadgeCategory.FORUM,
    rarity: BadgeRarity.UNCOMMON,
    points: 200,
    color: '#FF5722',
    requirements: [{ type: 'posts', value: 50, operator: '>=' }]
  },
  {
    id: 'expert',
    name: 'Эксперт',
    description: 'Получите 1000 лайков',
    icon: '⭐',
    category: BadgeCategory.FORUM,
    rarity: BadgeRarity.RARE,
    points: 500,
    color: '#FFC107',
    requirements: [{ type: 'likes', value: 1000, operator: '>=' }]
  },
  {
    id: 'forum_guru',
    name: 'Гуру форума',
    description: 'Наберите 10000 очков активности',
    icon: '🧙‍♂️',
    category: BadgeCategory.FORUM,
    rarity: BadgeRarity.LEGENDARY,
    points: 1000,
    color: '#9C27B0',
    requirements: [{ type: 'posts', value: 100, operator: '>=' }, { type: 'comments', value: 500, operator: '>=' }]
  },

  // Социальные достижения
  {
    id: 'mentor',
    name: 'Наставник',
    description: 'Помогите 10 новичкам',
    icon: '🎓',
    category: BadgeCategory.SOCIAL,
    rarity: BadgeRarity.RARE,
    points: 300,
    color: '#4CAF50',
    requirements: [{ type: 'helped_users', value: 10, operator: '>=' }]
  },
  {
    id: 'popular',
    name: 'Популярный',
    description: 'Получите 100 подписчиков',
    icon: '👥',
    category: BadgeCategory.SOCIAL,
    rarity: BadgeRarity.RARE,
    points: 400,
    color: '#E91E63',
    requirements: [{ type: 'followers', value: 100, operator: '>=' }]
  },
  {
    id: 'photographer',
    name: 'Фотограф',
    description: 'Загрузите 50 фотографий',
    icon: '📸',
    category: BadgeCategory.SOCIAL,
    rarity: BadgeRarity.UNCOMMON,
    points: 150,
    color: '#795548',
    requirements: [{ type: 'photos', value: 50, operator: '>=' }]
  },

  // Исследователь
  {
    id: 'cartographer',
    name: 'Картограф',
    description: 'Добавьте 10 рыбных мест на карту',
    icon: '🗺️',
    category: BadgeCategory.EXPLORER,
    rarity: BadgeRarity.UNCOMMON,
    points: 200,
    color: '#009688',
    requirements: [{ type: 'fishing_spots', value: 10, operator: '>=' }]
  },
  {
    id: 'traveler',
    name: 'Путешественник',
    description: 'Посетите 20 разных водоемов',
    icon: '🧭',
    category: BadgeCategory.EXPLORER,
    rarity: BadgeRarity.RARE,
    points: 350,
    color: '#8BC34A',
    requirements: [{ type: 'fishing_spots', value: 20, operator: '>=' }]
  },
  {
    id: 'pioneer',
    name: 'Первооткрыватель',
    description: 'Первым добавьте новое рыбное место',
    icon: '🔍',
    category: BadgeCategory.EXPLORER,
    rarity: BadgeRarity.EPIC,
    points: 500,
    color: '#FF6F00',
    requirements: [{ type: 'fishing_spots', value: 1, operator: '>=' }]
  }
];

// Уровни пользователей
export const USER_LEVELS: UserLevel[] = [
  { level: 1, title: 'Новичок', minPoints: 0, maxPoints: 99, color: '#9E9E9E', perks: ['Базовые функции форума'] },
  { level: 2, title: 'Рыбак', minPoints: 100, maxPoints: 299, color: '#4CAF50', perks: ['Создание постов', 'Комментарии'] },
  { level: 3, title: 'Опытный рыбак', minPoints: 300, maxPoints: 699, color: '#2196F3', perks: ['Добавление фото', 'Карта мест'] },
  { level: 4, title: 'Мастер', minPoints: 700, maxPoints: 1499, color: '#FF9800', perks: ['Создание категорий', 'Модерация'] },
  { level: 5, title: 'Эксперт', minPoints: 1500, maxPoints: 2999, color: '#9C27B0', perks: ['Наставничество', 'Организация встреч'] },
  { level: 6, title: 'Гуру рыбалки', minPoints: 3000, maxPoints: 9999, color: '#F44336', perks: ['VIP статус', 'Эксклюзивные функции'] },
  { level: 7, title: 'Легенда', minPoints: 10000, maxPoints: Infinity, color: '#FFD700', perks: ['Все привилегии', 'Золотой бейдж'] }
];

class AchievementsService {
  // Получить все доступные бейджи
  getBadges(): Badge[] {
    return BADGES;
  }

  // Получить бейджи пользователя
  getUserBadges(userId: number): Promise<Badge[]> {
    // В реальном приложении здесь будет API запрос
    const userBadges = this.getMockUserBadges(userId);
    return Promise.resolve(userBadges);
  }

  // Получить статистику пользователя
  getUserStats(userId: number): Promise<UserStats> {
    // В реальном приложении здесь будет API запрос
    const stats = this.getMockUserStats(userId);
    return Promise.resolve(stats);
  }

  // Проверить доступные достижения
  checkAchievements(userId: number, userStats: UserStats): Promise<Badge[]> {
    const availableBadges = BADGES.filter(badge => {
      return badge.requirements.every(req => {
        const userValue = userStats[req.type as keyof UserStats] as number;
        switch (req.operator) {
          case '>=': return userValue >= req.value;
          case '>': return userValue > req.value;
          case '=': return userValue === req.value;
          case '<': return userValue < req.value;
          case '<=': return userValue <= req.value;
          default: return false;
        }
      });
    });

    return Promise.resolve(availableBadges);
  }

  // Получить уровень пользователя
  getUserLevel(points: number): UserLevel {
    return USER_LEVELS.find(level => 
      points >= level.minPoints && points <= level.maxPoints
    ) || USER_LEVELS[0];
  }

  // Добавить очки пользователю
  addUserPoints(userId: number, points: number, reason: string): Promise<void> {
    console.log(`User ${userId} получил ${points} очков за: ${reason}`);
    return Promise.resolve();
  }

  // Моковые данные для разработки
  private getMockUserBadges(userId: number): Badge[] {
    const userBadges = BADGES.slice(0, 3).map(badge => ({
      ...badge,
      unlockedAt: new Date(),
      progress: badge.requirements[0]?.value || 0,
      maxProgress: badge.requirements[0]?.value || 0
    }));
    return userBadges;
  }

  private getMockUserStats(userId: number): UserStats {
    const totalPoints = 450;
    const level = this.getUserLevel(totalPoints);
    const nextLevel = USER_LEVELS.find(l => l.level === level.level + 1);
    
    return {
      totalPosts: 25,
      totalComments: 150,
      totalLikes: 320,
      totalPhotos: 15,
      fishingSpots: 5,
      fishCaught: 12,
      daysActive: 45,
      followers: 23,
      helpedUsers: 3,
      level: level.level,
      totalPoints,
      currentLevelPoints: totalPoints - level.minPoints, // 450 - 300 = 150
      nextLevelPoints: nextLevel ? nextLevel.minPoints - level.minPoints : level.maxPoints - level.minPoints // 700 - 300 = 400
    };
  }
}

export const achievementsApi = new AchievementsService(); 