export enum BadgeCategory {
  FISHING = 'fishing',
  FORUM = 'forum', 
  SOCIAL = 'social',
  EXPLORER = 'explorer',
  SPECIAL = 'special'
}

export enum BadgeRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon', 
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  points: number;
  requirements: BadgeRequirement[];
  color: string;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export interface BadgeRequirement {
  type: 'posts' | 'comments' | 'likes' | 'photos' | 'fishing_spots' | 'fish_caught' | 'days_active' | 'followers' | 'helped_users';
  value: number;
  operator: '>=' | '>' | '=' | '<' | '<=';
}

export interface UserStats {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalPhotos: number;
  fishingSpots: number;
  fishCaught: number;
  daysActive: number;
  followers: number;
  helpedUsers: number;
  level: number;
  totalPoints: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
}

export interface Achievement {
  id: string;
  userId: number;
  badgeId: string;
  unlockedAt: Date;
  notified: boolean;
}

export interface UserLevel {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  perks: string[];
} 