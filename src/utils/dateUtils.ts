import { format, formatRelative, formatDistance } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Форматирует дату с учетом локального часового пояса клиента
 * @param dateString - строка даты с сервера
 * @param formatOptions - опции форматирования
 * @returns отформатированная дата в локальном часовом поясе
 */
export const formatLocalDate = (
  dateString: string, 
  formatOptions?: Intl.DateTimeFormatOptions
): string => {
  if (!dateString) return '—';
  
  const date = new Date(dateString);
  
  // Проверяем корректность даты
  if (isNaN(date.getTime())) return '—';
  
  // Если опции не указаны, используем стандартные
  const options = formatOptions || {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleString('ru-RU', options);
};

/**
 * Форматирует относительную дату (например, "2 дня назад")
 * @param dateString - строка даты с сервера
 * @returns отформатированная относительная дата
 */
export const formatRelativeDate = (dateString: string): string => {
  if (!dateString) return '—';
  
  const now = new Date();
  const date = new Date(dateString);
  
  // Проверяем корректность даты
  if (isNaN(date.getTime())) return '—';
  
  // Рассчитываем разницу во времени
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) {
    return 'только что';
  } else if (diffMins < 60) {
    return `${diffMins} ${getMinutesWord(diffMins)} назад`;
  } else if (diffHours < 24) {
    return `${diffHours} ${getHoursWord(diffHours)} назад`;
  } else if (diffDays < 7) {
    return `${diffDays} ${getDaysWord(diffDays)} назад`;
  } else {
    return formatLocalDate(dateString, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
};

/**
 * Возвращает правильное склонение слова "минута"
 */
const getMinutesWord = (num: number): string => {
  if (num % 10 === 1 && num % 100 !== 11) return 'минуту';
  if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) return 'минуты';
  return 'минут';
};

/**
 * Возвращает правильное склонение слова "час"
 */
const getHoursWord = (num: number): string => {
  if (num % 10 === 1 && num % 100 !== 11) return 'час';
  if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) return 'часа';
  return 'часов';
};

/**
 * Возвращает правильное склонение слова "день"
 */
const getDaysWord = (num: number): string => {
  if (num % 10 === 1 && num % 100 !== 11) return 'день';
  if ([2, 3, 4].includes(num % 10) && ![12, 13, 14].includes(num % 100)) return 'дня';
  return 'дней';
}; 