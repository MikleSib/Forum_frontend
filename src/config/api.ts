export const API_URL = process.env.NODE_ENV === 'development' 
  ? 'https://рыболовный-форум.рф/api'
  : 'https://рыболовный-форум.рф/api';

// Настройки кеширования изображений
export const IMAGE_CACHE_OPTIONS = {
  // Включить принудительное кеширование изображений
  FORCE_CACHE: true,
  
  // Использовать IndexedDB для долгосрочного хранения на диске (приоритет 1)
  USE_INDEXED_DB: true,
  
  // Размер кеша в IndexedDB (количество элементов)
  INDEXED_DB_CACHE_SIZE: 1000,
  
  // Использовать кеширование в памяти (приоритет 2)
  USE_MEMORY_CACHE: true,
  
  // Размер кеша в памяти (количество элементов)
  MEMORY_CACHE_SIZE: 200,
  
  // Использовать Cache API для резервного кеширования (приоритет 3)
  USE_CACHE_API: true,
  
  // Максимальное время кеширования в миллисекундах (30 дней)
  MAX_CACHE_AGE: 30 * 24 * 60 * 60 * 1000,
  
  // Включить отладочные логи
  ENABLE_DEBUG_LOGS: true,
  
  // Версия кеша (увеличивайте при изменении формата кеширования)
  CACHE_VERSION: 3,
  
  // Имя кеша в Cache Storage
  CACHE_NAME: 'image-cache-v3',
  
  // Включить кеширование между сессиями
  PERSISTENT_CACHE: true,
  
  // Предзагружать изображения из постов автоматически
  PRELOAD_IMAGES: true,
  
  // Приоритет загрузки (1 - IndexedDB, 2 - Memory, 3 - Cache API, 4 - Server)
  LOAD_PRIORITY: ['IndexedDB', 'Memory', 'CacheAPI', 'Server']
};

// Базовый URL для изображений
export const IMAGE_BASE_URL = 'https://рыболовный-форум.рф';

export default API_URL;