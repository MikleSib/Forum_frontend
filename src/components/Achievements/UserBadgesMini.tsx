import React from 'react';
import { Box, Typography, Tooltip, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../shared/types/achievements.types';

interface UserBadgesMiniProps {
  badges: Badge[];
  totalPoints: number;
  userLevel: string;
  levelColor: string;
  maxDisplay?: number;
}

const AchievementCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

const BadgesContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  alignItems: 'center',
  marginTop: theme.spacing(2),
}));

const MiniBadge = styled(Box)<{ rarity: string }>(({ theme, rarity }) => {
  const rarityColors = {
    common: '#9E9E9E',
    uncommon: '#4CAF50',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800'
  };

  const color = rarityColors[rarity as keyof typeof rarityColors];

  return {
    width: 45,
    height: 45,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    border: `2px solid ${color}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: `0 2px 6px ${color}30`,
    '&:hover': {
      transform: 'scale(1.1)',
      boxShadow: `0 4px 12px ${color}50`,
    }
  };
});

const EmptyStateBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  color: '#666',
}));

const ViewAllButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  textTransform: 'none',
  fontSize: '0.85rem',
  color: '#1976d2',
}));

const UserBadgesMini: React.FC<UserBadgesMiniProps> = ({ 
  badges, 
  totalPoints, 
  userLevel, 
  levelColor,
  maxDisplay = 6 
}) => {
  const navigate = useNavigate();
  
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  const handleViewAll = () => {
    navigate('/achievements');
  };

  return (
    <AchievementCard elevation={0}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
        Достижения
      </Typography>

      {badges.length === 0 ? (
        <EmptyStateBox>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Пока нет достижений
          </Typography>
          <ViewAllButton 
            size="small" 
            onClick={handleViewAll}
          >
            Начать зарабатывать
          </ViewAllButton>
        </EmptyStateBox>
      ) : (
        <>
          <BadgesContainer>
            {displayBadges.map((badge) => (
              <Tooltip 
                key={badge.id}
                title={badge.name}
                arrow
                placement="top"
              >
                <MiniBadge rarity={badge.rarity}>
                  {badge.icon}
                </MiniBadge>
              </Tooltip>
            ))}
            
            {remainingCount > 0 && (
              <Tooltip title={`Еще ${remainingCount} достижений`} arrow>
                <MiniBadge rarity="common" onClick={handleViewAll}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#9E9E9E', fontSize: '0.7rem' }}>
                    +{remainingCount}
                  </Typography>
                </MiniBadge>
              </Tooltip>
            )}
          </BadgesContainer>

          <ViewAllButton 
            size="small" 
            onClick={handleViewAll}
          >
            Посмотреть все →
          </ViewAllButton>
        </>
      )}
    </AchievementCard>
  );
};

export default UserBadgesMini; 