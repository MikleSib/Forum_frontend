import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Badge, BadgeCategory, BadgeRarity, UserStats, UserLevel } from '../../shared/types/achievements.types';
import { achievementsApi, USER_LEVELS } from '../../services/achievementsApi';
import BadgeCard from './BadgeCard';
import UserStatsCard from './UserStatsCard';
import { userStore } from '../../shared/store/userStore';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`achievements-tabpanel-${index}`}
      aria-labelledby={`achievements-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    minHeight: 48,
    '&.Mui-selected': {
      color: theme.palette.primary.main,
    },
  },
}));

const AchievementNotification = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    textAlign: 'center',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    maxWidth: 400,
  },
}));

const AchievementsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // Состояние данных
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Уведомления о новых достижениях
  const [newAchievement, setNewAchievement] = useState<Badge | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Загрузка данных
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Получаем ID пользователя (в реальном приложении из контекста авторизации)
        const userId = userStore.user?.id || 1;
        
        // Загружаем все бейджи, пользовательские бейджи и статистику
        const [badges, userBadgesData, statsData] = await Promise.all([
          achievementsApi.getBadges(),
          achievementsApi.getUserBadges(userId),
          achievementsApi.getUserStats(userId)
        ]);
        
        setAllBadges(badges);
        setUserBadges(userBadgesData);
        setUserStats(statsData);
        
        // Определяем уровень пользователя и следующий уровень
        const currentLevel = achievementsApi.getUserLevel(statsData.totalPoints);
        setUserLevel(currentLevel);
        
        setError(null);
      } catch (err) {
        console.error('Ошибка при загрузке достижений:', err);
        setError('Не удалось загрузить данные достижений');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Обработчики событий
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const closeNotification = () => {
    setShowNotification(false);
    setNewAchievement(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Загрузка достижений...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const nextLevel = userLevel && userLevel.level < USER_LEVELS.length 
    ? USER_LEVELS[userLevel.level] 
    : undefined;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h1" component="h1" sx={{ 
        fontWeight: 700, 
        mb: 1, 
        fontSize: { xs: '1.75rem', md: '2.125rem' },
        textAlign: 'center'
      }}>
        🏆 Достижения и бейджи
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ 
        textAlign: 'center', 
        mb: 4,
        maxWidth: '600px',
        mx: 'auto'
      }}>
        Участвуйте в жизни сообщества, делитесь опытом и получайте уникальные достижения!
      </Typography>

      {userStats && userLevel && (
        <UserStatsCard 
          stats={userStats} 
          userLevel={userLevel} 
          nextLevel={nextLevel}
        />
      )}

      <StyledTabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
        <Tab label="Все достижения" />
        <Tab label="Мои достижения" />
        <Tab label="Прогресс" />
      </StyledTabs>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {allBadges.map(badge => {
            const isUnlocked = userBadges.some(ub => ub.id === badge.id);
            const userBadge = userBadges.find(ub => ub.id === badge.id);
            
            return (
              <Grid key={badge.id} size={{xs: 12, sm: 6, md: 4, lg: 3}}>
                <BadgeCard 
                  badge={userBadge || badge} 
                  isUnlocked={isUnlocked}
                  showProgress={!isUnlocked}
                />
              </Grid>
            );
          })}
        </Grid>

        {allBadges.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Бейджи не найдены
            </Typography>
          </Paper>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          {userBadges.map(badge => (
            <Grid key={badge.id} size={{xs: 12, sm: 6, md: 4, lg: 3}}>
              <BadgeCard badge={badge} isUnlocked={true} />
            </Grid>
          ))}
        </Grid>

        {userBadges.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              У вас пока нет достижений
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Участвуйте в жизни форума, чтобы получить свои первые бейджи!
            </Typography>
          </Paper>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Прогресс к новым достижениям
        </Typography>
        
        <Grid container spacing={3}>
          {allBadges
            .filter(badge => !userBadges.some(ub => ub.id === badge.id))
            .slice(0, 12) // Показываем только первые 12 для прогресса
            .map(badge => (
              <Grid key={badge.id} size={{xs: 12, sm: 6, md: 4, lg: 3}}>
                <BadgeCard 
                  badge={badge} 
                  isUnlocked={false}
                  showProgress={true}
                />
              </Grid>
            ))}
        </Grid>
      </TabPanel>

      {/* Уведомление о новом достижении */}
      <AchievementNotification 
        open={showNotification && !!newAchievement}
        onClose={closeNotification}
      >
        {newAchievement && (
          <>
            <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              🎉 Новое достижение!
            </DialogTitle>
            <DialogContent>
              <Box sx={{ fontSize: '4rem', mb: 2 }}>
                {newAchievement.icon}
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                {newAchievement.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                {newAchievement.description}
              </Typography>
              <Chip 
                label={`+${newAchievement.points} очков`}
                color="primary"
                sx={{ fontWeight: 'bold' }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={closeNotification} variant="contained">
                Отлично!
              </Button>
            </DialogActions>
          </>
        )}
      </AchievementNotification>
    </Container>
  );
};

export default AchievementsPage; 