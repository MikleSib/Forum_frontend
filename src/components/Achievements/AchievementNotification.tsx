import React, { useState, useEffect } from 'react';
import { 
  Snackbar, 
  Alert, 
  Box, 
  Typography, 
  Chip, 
  Button,
  Slide,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { Badge } from '../../shared/types/achievements.types';

interface AchievementNotificationProps {
  badge: Badge | null;
  onClose: () => void;
  autoHideDuration?: number;
}

const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
  '& .MuiSnackbarContent-root': {
    minWidth: 350,
    maxWidth: 450,
  }
}));

const AchievementAlert = styled(Alert)<{ badgecolor: string }>(({ theme, badgecolor }) => ({
  background: `linear-gradient(135deg, ${badgecolor}15 0%, ${badgecolor}05 100%)`,
  border: `2px solid ${badgecolor}40`,
  borderRadius: 16,
  padding: theme.spacing(2),
  '& .MuiAlert-icon': {
    display: 'none'
  },
  '& .MuiAlert-message': {
    width: '100%',
    padding: 0
  }
}));

const BadgeIcon = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  textAlign: 'center',
  marginBottom: theme.spacing(1),
  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
  animation: 'bounce 0.6s ease-in-out',
  '@keyframes bounce': {
    '0%, 20%, 50%, 80%, 100%': {
      transform: 'translateY(0)'
    },
    '40%': {
      transform: 'translateY(-10px)'
    },
    '60%': {
      transform: 'translateY(-5px)'
    }
  }
}));

const PointsChip = styled(Chip)<{ badgecolor: string }>(({ badgecolor }) => ({
  backgroundColor: badgecolor,
  color: 'white',
  fontWeight: 'bold',
  animation: 'pulse 1s ease-in-out infinite',
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)'
    },
    '50%': {
      transform: 'scale(1.05)'
    },
    '100%': {
      transform: 'scale(1)'
    }
  }
}));

function SlideTransition(props: any) {
  return <Slide {...props} direction="down" />;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  badge,
  onClose,
  autoHideDuration = 5000
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (badge) {
      setOpen(true);
      
      // Проигрываем звук уведомления (если доступен)
      try {
        const audio = new Audio('/sounds/achievement.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Игнорируем ошибки воспроизведения
        });
      } catch (error) {
        // Игнорируем ошибки
      }
    }
  }, [badge]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    setTimeout(onClose, 300); // Задержка для анимации закрытия
  };

  const handleViewAchievements = () => {
    window.location.href = '/achievements';
    handleClose();
  };

  if (!badge) {
    return null;
  }

  const getRarityLabel = (rarity: string): string => {
    const labels = {
      common: 'Обычное',
      uncommon: 'Необычное',
      rare: 'Редкое',
      epic: 'Эпическое',
      legendary: 'Легендарное'
    };
    return labels[rarity as keyof typeof labels] || 'Неизвестное';
  };

  return (
    <StyledSnackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      TransitionComponent={SlideTransition}
    >
      <AchievementAlert 
        severity="success" 
        badgecolor={badge.color}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Box sx={{ textAlign: 'center' }}>
          {/* Заголовок */}
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            mb: 1,
            background: `linear-gradient(45deg, ${badge.color}, ${badge.color}80)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🎉 Новое достижение!
          </Typography>

          {/* Иконка бейджа */}
          <BadgeIcon>
            {badge.icon}
          </BadgeIcon>

          {/* Название бейджа */}
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            mb: 1,
            lineHeight: 1.2
          }}>
            {badge.name}
          </Typography>

          {/* Описание */}
          <Typography variant="body2" color="text.secondary" sx={{ 
            mb: 2,
            lineHeight: 1.4
          }}>
            {badge.description}
          </Typography>

          {/* Чипы с информацией */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 1, 
            mb: 2,
            flexWrap: 'wrap'
          }}>
            <PointsChip 
              label={`+${badge.points} очков`}
              size="small"
              badgecolor={badge.color}
            />
            <Chip 
              label={getRarityLabel(badge.rarity)}
              size="small"
              variant="outlined"
              sx={{ 
                borderColor: badge.color,
                color: badge.color,
                fontWeight: 'medium'
              }}
            />
          </Box>

          {/* Кнопка действия */}
          <Button
            variant="outlined"
            size="small"
            onClick={handleViewAchievements}
            sx={{
              borderColor: badge.color,
              color: badge.color,
              '&:hover': {
                backgroundColor: `${badge.color}10`,
                borderColor: badge.color
              }
            }}
          >
            Посмотреть все достижения
          </Button>
        </Box>
      </AchievementAlert>
    </StyledSnackbar>
  );
};

export default AchievementNotification; 