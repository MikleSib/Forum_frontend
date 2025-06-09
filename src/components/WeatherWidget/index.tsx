import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Divider, IconButton, Tooltip } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import GrainIcon from '@mui/icons-material/Grain';
import OpacityIcon from '@mui/icons-material/Opacity';
import AirIcon from '@mui/icons-material/Air';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SpeedIcon from '@mui/icons-material/Speed';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import MyLocationIcon from '@mui/icons-material/MyLocation';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: string;
  visibility: number;
  description: string;
  condition: string;
  city: string;
}

interface WeatherWidgetProps {
  userLocation?: { lat: number; lng: number } | null;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ userLocation }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Функция для получения иконки погоды
  const getWeatherIcon = (condition: string) => {
    const iconProps = { sx: { fontSize: 20, color: 'primary.main' } };
    
    switch (condition.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <WbSunnyIcon {...iconProps} />;
      case 'clouds':
      case 'cloudy':
      case 'overcast':
        return <CloudIcon {...iconProps} />;
      case 'rain':
      case 'drizzle':
        return <GrainIcon {...iconProps} />;
      case 'thunderstorm':
        return <ThunderstormIcon {...iconProps} />;
      case 'snow':
        return <AcUnitIcon {...iconProps} />;
      default:
        return <CloudIcon {...iconProps} />;
    }
  };

  // Функция для генерации динамического заголовка
  const getDynamicTitle = (weather: WeatherData): string => {
    const temp = weather.temperature;
    const condition = weather.condition.toLowerCase();
    const windSpeed = weather.windSpeed;
    const pressure = weather.pressure;
    const hour = new Date().getHours();
    
    // Определяем время суток
    const isNight = hour >= 22 || hour <= 5;
    const isMorning = hour >= 6 && hour <= 11;
    const isEvening = hour >= 18 && hour <= 21;
    const isDawn = hour >= 5 && hour <= 7;
    
    // Особые условия для рыбалки
    const isGoodFishingPressure = pressure >= 750 && pressure <= 770;
    const isLowWind = windSpeed <= 5;
    const isGoodFishingTemp = temp >= 10 && temp <= 25;
    
    // Специальные заголовки для отличных условий рыбалки
    if (isGoodFishingTemp && isLowWind && isGoodFishingPressure && condition.includes('clear')) {
      if (isDawn) return "Идеальное утро для рыбалки";
      if (isEvening) return "Отличный вечер для рыбалки";
      return "Идеально для рыбалки";
    }

    // Грозы и штормы
    if (condition.includes('thunderstorm') || condition.includes('storm')) {
      return isNight ? "Ночная гроза" : "Гроза";
    }

    // Заголовки на основе температуры и условий
    if (temp <= -15) {
      return isNight ? "Лютый мороз" : "Экстремальный холод";
    } else if (temp <= -5) {
      if (condition.includes('snow')) return "Метель";
      return isNight ? "Морозная ночь" : "Сильный мороз";
    } else if (temp <= 0) {
      if (condition.includes('snow')) return "Снегопад";
      return isNight ? "Холодная ночь" : "Морозная погода";
    } else if (temp <= 5) {
      if (condition.includes('rain')) return "Холодный дождь";
      if (condition.includes('snow')) return "Мокрый снег";
      return isNight ? "Прохладная ночь" : "Прохладно";
    } else if (temp <= 15) {
      if (condition.includes('rain')) return "Дождливо и прохладно";
      if (condition.includes('snow')) return "Снег и прохлада";
      if (windSpeed > 10) return "Ветрено и свежо";
      return isMorning ? "Свежее утро" : "Комфортная погода";
    } else if (temp <= 25) {
      if (condition.includes('rain')) return "Теплый дождь";
      if (condition.includes('clear') || condition.includes('sunny')) {
        if (isDawn) return "Рассвет";
        if (isMorning) return "Солнечное утро";
        if (isEvening) return "Теплый вечер";
        return "Хорошая погода";
      }
      if (windSpeed > 8) return "Ветрено и тепло";
      return "Приятная погода";
    } else if (temp <= 35) {
      if (condition.includes('rain')) return "Жаркий ливень";
      if (windSpeed > 10) return "Жарко и ветрено";
      return isNight ? "Теплая ночь" : "Жаркая погода";
    } else {
      return isNight ? "Душная ночь" : "Экстремальная жара";
    }
  };

  // Функция для оценки условий рыбалки
  const getFishingConditions = (weather: WeatherData) => {
    let score = 5; // Базовая оценка
    let tips: string[] = [];

    // Температура
    if (weather.temperature < 0 || weather.temperature > 30) {
      score -= 1;
      tips.push(weather.temperature < 0 ? "Холодно для рыбалки" : "Слишком жарко");
    } else if (weather.temperature >= 10 && weather.temperature <= 25) {
      score += 1;
      tips.push("Хорошая температура");
    }

    // Ветер
    if (weather.windSpeed > 10) {
      score -= 2;
      tips.push("Сильный ветер затруднит рыбалку");
    } else if (weather.windSpeed <= 5) {
      score += 1;
      tips.push("Тихая погода - хорошо для рыбалки");
    }

    // Давление
    if (weather.pressure < 740 || weather.pressure > 770) {
      score -= 1;
      if (weather.pressure < 740) {
        tips.push("Низкое давление - рыба менее активна");
      } else {
        tips.push("Высокое давление");
      }
    } else {
      score += 1;
      tips.push("Стабильное давление");
    }

    // Условия погоды
    if (weather.condition.includes('rain') || weather.condition.includes('storm')) {
      score -= 2;
      tips.push("Дождь/гроза - неподходящие условия");
    }

    const rating = Math.max(1, Math.min(5, score));
    const ratingText = rating >= 4 ? "Отличные условия" : 
                      rating >= 3 ? "Хорошие условия" : 
                      rating >= 2 ? "Удовлетворительные условия" : "Плохие условия";

    return { rating, ratingText, tips };
  };

  // Функция для получения названия города по координатам
  const getCityName = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=ru`
      );
      
      if (!response.ok) {
        throw new Error('Не удалось получить название города');
      }
      
      const data = await response.json();
      
      const city = data.address?.city || 
                   data.address?.town || 
                   data.address?.village || 
                   data.address?.hamlet || 
                   data.address?.suburb ||
                   data.display_name?.split(',')[0] ||
                   'Текущее местоположение';
      
      return city;
    } catch (error) {
      console.error('Ошибка геокодирования:', error);
      return 'Текущее местоположение';
    }
  };

  // Функция для получения направления ветра
  const getWindDirection = (degrees: number): string => {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // Функция для получения описания погоды на русском
  const getWeatherDescription = (weatherCode: number): { description: string; condition: string } => {
    // Коды погоды Open-Meteo
    const weatherDescriptions: { [key: number]: { description: string; condition: string } } = {
      0: { description: 'Ясно', condition: 'clear' },
      1: { description: 'Преимущественно ясно', condition: 'clear' },
      2: { description: 'Переменная облачность', condition: 'clouds' },
      3: { description: 'Пасмурно', condition: 'clouds' },
      45: { description: 'Туман', condition: 'clouds' },
      48: { description: 'Изморозь', condition: 'clouds' },
      51: { description: 'Лёгкая морось', condition: 'rain' },
      53: { description: 'Умеренная морось', condition: 'rain' },
      55: { description: 'Сильная морось', condition: 'rain' },
      61: { description: 'Лёгкий дождь', condition: 'rain' },
      63: { description: 'Умеренный дождь', condition: 'rain' },
      65: { description: 'Сильный дождь', condition: 'rain' },
      71: { description: 'Лёгкий снег', condition: 'snow' },
      73: { description: 'Умеренный снег', condition: 'snow' },
      75: { description: 'Сильный снег', condition: 'snow' },
      95: { description: 'Гроза', condition: 'thunderstorm' },
      96: { description: 'Гроза с градом', condition: 'thunderstorm' },
      99: { description: 'Сильная гроза с градом', condition: 'thunderstorm' }
    };

    return weatherDescriptions[weatherCode] || { description: 'Неизвестно', condition: 'clouds' };
  };

  // Функция для получения данных погоды через Open-Meteo API
  const fetchWeatherData = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);

    try {
      // Запрос к Open-Meteo API
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=auto&forecast_days=1`;
      
      const [weatherResponse, cityName] = await Promise.all([
        fetch(weatherUrl),
        getCityName(lat, lng)
      ]);

      if (!weatherResponse.ok) {
        throw new Error('Не удалось получить данные о погоде');
      }

      const weatherData = await weatherResponse.json();
      const current = weatherData.current;

      // Преобразование давления из гПа в мм рт. ст.
      const pressureHPa = current.surface_pressure;
      const pressureMmHg = Math.round(pressureHPa * 0.750062);

      // Получение описания погоды
      const weatherInfo = getWeatherDescription(current.weather_code);

      const weather: WeatherData = {
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: Math.round(current.relative_humidity_2m),
        pressure: pressureMmHg,
        windSpeed: Math.round(current.wind_speed_10m),
        windDirection: getWindDirection(current.wind_direction_10m),
        visibility: 10, // Open-Meteo не предоставляет видимость в базовом API
        description: weatherInfo.description,
        condition: weatherInfo.condition,
        city: cityName
      };

      setWeather(weather);
    } catch (err) {
      console.error('Ошибка получения данных о погоде:', err);
      setError('Не удалось получить данные о погоде');
    } finally {
      setLoading(false);
    }
  };

  // Функция для получения местоположения по IP
  const getLocationByIP = async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Используем бесплатный сервис ipapi.co
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        throw new Error('Не удалось получить местоположение по IP');
      }
      
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        return {
          lat: parseFloat(data.latitude),
          lng: parseFloat(data.longitude)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Ошибка определения местоположения по IP:', error);
      return null;
    }
  };

  // Функция для получения геолокации браузера
  const getBrowserGeolocation = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Ошибка геолокации браузера:', error);
          resolve(null);
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 минут
        }
      );
    });
  };

  // Основная функция определения местоположения
  const detectUserLocation = async (): Promise<{ lat: number; lng: number }> => {
    // Сначала пробуем определить по IP (быстро и без запроса разрешений)
    const ipLocation = await getLocationByIP();
    if (ipLocation) {
      return ipLocation;
    }

    // Если IP не сработал, пробуем геолокацию браузера
    const browserLocation = await getBrowserGeolocation();
    if (browserLocation) {
      return browserLocation;
    }

    // Если ничего не сработало, возвращаем Москву по умолчанию
    return { lat: 55.7558, lng: 37.6173 };
  };

  useEffect(() => {
    const loadWeatherData = async () => {
      let location: { lat: number; lng: number };

      if (userLocation) {
        // Если есть местоположение пользователя из карты, используем его
        location = userLocation;
      } else {
        // Иначе определяем автоматически
        location = await detectUserLocation();
      }

      fetchWeatherData(location.lat, location.lng);
    };

    loadWeatherData();
  }, [userLocation]);

  // Функция для ручного запроса точной геолокации
  const handleLocationRequest = async () => {
    setIsGettingLocation(true);
    
    try {
      const browserLocation = await getBrowserGeolocation();
      if (browserLocation) {
        await fetchWeatherData(browserLocation.lat, browserLocation.lng);
      } else {
        setError('Не удалось получить геолокацию. Проверьте разрешения браузера.');
      }
    } catch (err) {
      setError('Ошибка при получении геолокации');
    } finally {
      setIsGettingLocation(false);
    }
  };

  if (loading || isGettingLocation) {
    return (
      <Paper sx={{ 
        p: 2, 
        mb: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Погода для рыбалки</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          <CircularProgress size={30} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            {isGettingLocation ? 'Определяем местоположение...' : 'Загружаем данные...'}
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ 
        p: 2, 
        mb: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Погода для рыбалки</Typography>
        <Alert severity="error">
          {error}
        </Alert>
      </Paper>
    );
  }

  if (!weather) return null;

  const fishingConditions = getFishingConditions(weather);

  return (
    <Paper sx={{ 
      p: 2, 
      mb: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getWeatherIcon(weather.condition)}
          {getDynamicTitle(weather)}
        </Typography>
        <Tooltip title="Определить точное местоположение">
          <IconButton 
            size="small" 
            onClick={handleLocationRequest}
            disabled={isGettingLocation || loading}
            sx={{ color: 'primary.main' }}
          >
            <MyLocationIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {weather.city}
      </Typography>

      {/* Основная температура */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h4" component="span" sx={{ fontWeight: 'bold' }}>
          {weather.temperature > 0 ? '+' : ''}{weather.temperature}°
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {weather.description}
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Ощущается как {weather.feelsLike > 0 ? '+' : ''}{weather.feelsLike}°
      </Typography>

      <Divider sx={{ my: 1 }} />

      {/* Подробные данные */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <OpacityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">Влажность</Typography>
          </Box>
          <Typography variant="body2">{weather.humidity}%</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SpeedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">Давление</Typography>
          </Box>
          <Typography variant="body2">{weather.pressure} мм рт.ст.</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AirIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">Ветер</Typography>
          </Box>
          <Typography variant="body2">{weather.windSpeed} м/с {weather.windDirection}</Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">Видимость</Typography>
          </Box>
          <Typography variant="body2">{weather.visibility} км</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Оценка условий для рыбалки */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          Условия для рыбалки: {fishingConditions.ratingText}
        </Typography>
        <Box sx={{ display: 'flex', mb: 1 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Typography 
              key={star}
              variant="body1" 
              sx={{ 
                color: star <= fishingConditions.rating ? 'primary.main' : 'grey.300',
                fontSize: '16px'
              }}
            >
              ★
            </Typography>
          ))}
        </Box>
        {fishingConditions.tips.length > 0 && (
          <Box>
            {fishingConditions.tips.slice(0, 2).map((tip, index) => (
              <Typography key={index} variant="caption" display="block" color="text.secondary">
                • {tip}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default WeatherWidget; 