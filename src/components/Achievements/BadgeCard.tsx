import React from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Badge, BadgeRarity } from '../../shared/types/achievements.types';

interface BadgeCardProps {
  badge: Badge;
  isUnlocked?: boolean;
  showProgress?: boolean;
}

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'rarity' && prop !== 'unlocked',
})<{ rarity: BadgeRarity; unlocked: boolean }>(({ theme, rarity, unlocked }) => {
  const rarityColors = {
    common: '#9E9E9E',
    uncommon: '#4CAF50',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800'
  };

  const accentColor = rarityColors[rarity];
  
  return {
    height: 200,
    width: '100%',
    background: '#ffffff',
    border: `2px solid ${unlocked ? accentColor : '#e0e0e0'}`,
    borderRadius: '16px',
    opacity: unlocked ? 1 : 0.8,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: unlocked 
      ? `0 4px 20px ${accentColor}20, 0 2px 8px rgba(0,0,0,0.1)`
      : '0 2px 8px rgba(0,0,0,0.08)',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: unlocked 
        ? `0 8px 30px ${accentColor}30, 0 4px 12px rgba(0,0,0,0.15)`
        : '0 6px 20px rgba(0,0,0,0.12)',
      borderColor: accentColor,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: unlocked 
        ? `linear-gradient(90deg, ${accentColor}, ${accentColor}80, ${accentColor})`
        : 'linear-gradient(90deg, #e0e0e0, #f0f0f0, #e0e0e0)',
      zIndex: 1,
    },
    '&::after': unlocked ? {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: `linear-gradient(90deg, transparent, ${accentColor}10, transparent)`,
      animation: 'cardShine 3s infinite',
      zIndex: 0,
    } : {},
    '@keyframes cardShine': {
      '0%': { left: '-100%' },
      '100%': { left: '100%' }
    }
  };
});

const BadgeIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'unlocked',
})<{ unlocked: boolean }>(({ unlocked }) => ({
  fontSize: '3rem',
  textAlign: 'center',
  marginBottom: '12px',
  marginTop: '8px',
  filter: unlocked ? 'none' : 'grayscale(80%) brightness(0.7)',
  transition: 'all 0.3s ease',
  position: 'relative',
  zIndex: 2,
  '&:hover': {
    transform: unlocked ? 'scale(1.1) rotate(5deg)' : 'scale(1.05)',
    filter: unlocked ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'grayscale(60%) brightness(0.8)',
  }
}));

const RarityChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'rarity',
})<{ rarity: BadgeRarity }>(({ rarity }) => {
  const rarityColors = {
    common: '#9E9E9E',
    uncommon: '#4CAF50',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800'
  };

  return {
    backgroundColor: rarityColors[rarity],
    color: 'white',
    fontSize: '0.7rem',
    height: '24px',
    fontWeight: 'bold',
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 3,
    boxShadow: `0 2px 8px ${rarityColors[rarity]}40`,
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: `0 4px 12px ${rarityColors[rarity]}60`,
    }
  };
});



const ProgressWrapper = styled(Box)({
  marginTop: '8px'
});

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, isUnlocked = false, showProgress = false }) => {
  const getRarityLabel = (rarity: BadgeRarity): string => {
    const labels = {
      common: 'Обычный',
      uncommon: 'Необычный',
      rare: 'Редкий',
      epic: 'Эпический',
      legendary: 'Легендарный'
    };
    return labels[rarity];
  };

  const progressValue = badge.progress && badge.maxProgress 
    ? (badge.progress / badge.maxProgress) * 100 
    : 0;

  return (
    <Tooltip 
      title={
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {badge.name}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {badge.description}
          </Typography>
          {badge.requirements.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              Требования: {badge.requirements.map(req => 
                `${req.type.replace('_', ' ')} ${req.operator} ${req.value}`
              ).join(', ')}
            </Typography>
          )}
          {isUnlocked && badge.unlockedAt && (
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              Получено: {badge.unlockedAt.toLocaleDateString()}
            </Typography>
          )}
        </Box>
      }
      arrow
      placement="top"
    >
      <StyledCard rarity={badge.rarity} unlocked={isUnlocked}>
        <CardContent sx={{ 
          position: 'relative', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          padding: '20px 16px 20px',
          justifyContent: 'space-between',
          '&:last-child': { paddingBottom: '20px' }
        }}>
          <RarityChip 
            label={getRarityLabel(badge.rarity)} 
            rarity={badge.rarity}
            size="small"
          />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            <BadgeIcon unlocked={isUnlocked}>
              {badge.icon}
            </BadgeIcon>
            
            <Typography 
              variant="h6" 
              component="h3" 
              sx={{ 
                textAlign: 'center', 
                fontWeight: 'bold',
                fontSize: '1.1rem',
                lineHeight: 1.3,
                mb: 1.5,
                color: isUnlocked ? '#1a1a1a' : '#666666',
                position: 'relative',
                zIndex: 2,
                textShadow: isUnlocked ? 'none' : '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {badge.name}
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ 
                textAlign: 'center',
                fontSize: '0.85rem',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                color: isUnlocked ? '#444444' : '#888888',
                fontWeight: 500,
                position: 'relative',
                zIndex: 2,
                px: 1,
                minHeight: '2.4em',
              }}
            >
              {badge.description}
            </Typography>
          </Box>

          {showProgress && !isUnlocked && badge.progress !== undefined && badge.maxProgress && (
            <ProgressWrapper>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#666666',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  display: 'block',
                  textAlign: 'center',
                  mb: 1,
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                Прогресс: {badge.progress}/{badge.maxProgress}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={progressValue} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: 'rgba(0,0,0,0.08)',
                  position: 'relative',
                  zIndex: 2,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: badge.color,
                    borderRadius: 3,
                    boxShadow: `0 1px 3px ${badge.color}40`,
                  }
                }}
              />
            </ProgressWrapper>
          )}

        </CardContent>
      </StyledCard>
    </Tooltip>
  );
};

export default BadgeCard; 