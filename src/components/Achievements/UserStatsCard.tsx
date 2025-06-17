import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  LinearProgress, 
  Grid, 
  Chip,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { UserStats, UserLevel } from '../../shared/types/achievements.types';

interface UserStatsCardProps {
  stats: UserStats;
  userLevel: UserLevel;
  nextLevel?: UserLevel;
}

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #6c7fd8 0%, #8691d4 50%, #a1a8db 100%)',
  color: 'white',
  marginBottom: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 30px 60px rgba(102, 126, 234, 0.4)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  },
  '&:hover::after': {
    opacity: 1,
  }
}));

const LevelAvatar = styled(Avatar, {
  shouldForwardProp: (prop) => prop !== 'levelColor',
})<{ levelColor: string }>(({ levelColor }) => ({
  width: 100,
  height: 100,
  backgroundColor: levelColor,
  fontSize: '2.5rem',
  fontWeight: 'bold',
  border: '4px solid rgba(255,255,255,0.4)',
  marginBottom: '16px',
  position: 'relative',
  zIndex: 2,
  transition: 'all 0.3s ease',
  boxShadow: `0 8px 24px ${levelColor}30`,
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 12px 32px ${levelColor}40`,
  }
}));

const StatBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(1.5),
  backgroundColor: 'rgba(255,255,255,0.15)',
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.2)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: 'rgba(255,255,255,0.25)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
  }
}));

const ProgressWrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(3),
  backgroundColor: 'rgba(255,255,255,0.15)',
  borderRadius: theme.spacing(2),
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.2)',
}));

const LevelChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'levelColor',
})<{ levelColor: string }>(({ levelColor }) => ({
  backgroundColor: levelColor,
  color: 'white',
  fontWeight: 'bold',
  position: 'relative',
  zIndex: 2,
  boxShadow: `0 4px 12px ${levelColor}40`,
  transition: 'all 0.3s ease',
  '& .MuiChip-icon': {
    color: 'white'
  },
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 6px 18px ${levelColor}50`,
  }
}));

const UserStatsCard: React.FC<UserStatsCardProps> = ({ stats, userLevel, nextLevel }) => {
  // Отладочная информация
  console.log('Debug UserStatsCard:', {
    'stats.currentLevelPoints': stats.currentLevelPoints,
    'stats.nextLevelPoints': stats.nextLevelPoints,
    'stats.totalPoints': stats.totalPoints,
    'userLevel': userLevel,
    'nextLevel': nextLevel
  });
  
  const levelProgress = nextLevel 
    ? Math.max(0, Math.min(100, (stats.currentLevelPoints / stats.nextLevelPoints) * 100))
    : 100;
    
  console.log('Calculated levelProgress:', levelProgress);

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const statsData = [
    { label: 'Посты', value: stats.totalPosts, icon: '📝' },
    { label: 'Комментарии', value: stats.totalComments, icon: '💬' },
    { label: 'Лайки', value: stats.totalLikes, icon: '👍' },
    { label: 'Фото', value: stats.totalPhotos, icon: '📸' },
    { label: 'Рыбных мест', value: stats.fishingSpots, icon: '🗺️' },
    { label: 'Рыб поймано', value: stats.fishCaught, icon: '🎣' },
    { label: 'Дней активности', value: stats.daysActive, icon: '📅' },
    { label: 'Подписчики', value: stats.followers, icon: '👥' }
  ];

  return (
    <StyledCard>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <LevelAvatar levelColor={userLevel.color}>
            {stats.level}
          </LevelAvatar>
          
          <LevelChip 
            icon={<StarIcon />}
            label={userLevel.title}
            levelColor={userLevel.color}
          />
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mt: 2, 
            gap: 1,
            transition: 'all 0.3s ease',
          }}>
            <TrendingUpIcon sx={{ 
              fontSize: '1.4rem', 
              color: 'white',
            }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold', 
              color: 'white',
              fontSize: '1.3rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}>
              {formatNumber(stats.totalPoints)} очков
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          {statsData.map((stat, index) => (
            <StatBox key={index}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontSize: '1.8rem',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}
              >
                {stat.icon}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold', 
                  fontSize: '1.4rem', 
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  transition: 'all 0.3s ease',
                }}
              >
                {formatNumber(stat.value)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem', color: 'white', fontWeight: 500 }}>
                {stat.label}
              </Typography>
            </StatBox>
          ))}
        </Box>

        {nextLevel && (
          <ProgressWrapper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
                Прогресс до следующего уровня
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                {stats.currentLevelPoints}/{stats.nextLevelPoints}
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={levelProgress} 
              sx={{ 
                height: 20,
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.2)',
                position: 'relative',
                overflow: 'hidden',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: userLevel.color,
                  borderRadius: 10,
                  transition: 'all 0.3s ease',
                }
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.9, color: 'white', fontWeight: 500 }}>
                {userLevel.title}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, color: 'white', fontWeight: 500 }}>
                {nextLevel.title}
              </Typography>
            </Box>
          </ProgressWrapper>
        )}

        {userLevel.perks.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, opacity: 0.9 }}>
              Привилегии уровня:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {userLevel.perks.map((perk, index) => (
                <Chip
                  key={index}
                  label={perk}
                  size="small"
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    fontSize: '0.7rem'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default UserStatsCard; 