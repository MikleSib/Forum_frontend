/**
 * Сервис для кеширования изображений
 */

// Кеш хранит ссылки на изображения с соответствующими URL
interface CacheEntry {
  url: string;
  timestamp: number;
  loaded: boolean;
  error: boolean;
}

// Максимальное время кеширования изображения в миллисекундах (24 часа)
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000;

// Размер кеша (максимальное количество кешированных изображений)
const MAX_CACHE_SIZE = 200;

class ImageCacheService {
  private cache: Map<string, CacheEntry>;
  private preloadedImages: Map<string, HTMLImageElement>;

  constructor() {
    this.cache = new Map();
    this.preloadedImages = new Map();
    
    // Очистка кеша при выходе с сайта
    window.addEventListener('beforeunload', () => {
      this.clearCache();
    });
  }

  /**
   * Получает URL изображения из кеша или загружает его
   * @param imageUrl URL изображения для загрузки
   * @param baseUrl Базовый URL (опционально)
   * @returns URL изображения
   */
  public async getImage(imageUrl: string, baseUrl: string = ''): Promise<string> {
    const fullUrl = `${baseUrl}${imageUrl}`;
    const cacheKey = this.getCacheKey(fullUrl);
    
    // Проверяем, есть ли изображение в кеше
    const cachedEntry = this.cache.get(cacheKey);
    
    if (cachedEntry) {
      // Проверяем срок годности кеша
      if (Date.now() - cachedEntry.timestamp < MAX_CACHE_AGE) {
        if (cachedEntry.loaded && !cachedEntry.error) {
          // Если изображение уже загружено и нет ошибок, возвращаем сразу
          return fullUrl;
        }
      } else {
        // Если кеш устарел, удаляем запись
        this.cache.delete(cacheKey);
      }
    }
    
    // Предварительно загружаем изображение
    await this.preloadImage(fullUrl);
    
    return fullUrl;
  }

  /**
   * Предварительно загружает изображение
   * @param url URL изображения
   * @returns Promise, который разрешается, когда изображение загружено
   */
  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve) => {
      const cacheKey = this.getCacheKey(url);
      
      // Проверяем, загружено ли уже изображение
      if (this.preloadedImages.has(cacheKey)) {
        resolve();
        return;
      }
      
      // Создаем запись в кеше
      this.cache.set(cacheKey, {
        url,
        timestamp: Date.now(),
        loaded: false,
        error: false
      });
      
      // Загружаем изображение
      const img = new Image();
      
      img.onload = () => {
        // Обновляем запись в кеше
        this.cache.set(cacheKey, {
          url,
          timestamp: Date.now(),
          loaded: true,
          error: false
        });
        
        // Сохраняем предзагруженное изображение
        this.preloadedImages.set(cacheKey, img);
        
        // Чистим кеш, если он слишком большой
        this.cleanCacheIfNeeded();
        
        resolve();
      };
      
      img.onerror = () => {
        // Обновляем запись в кеше с ошибкой
        this.cache.set(cacheKey, {
          url,
          timestamp: Date.now(),
          loaded: false,
          error: true
        });
        
        resolve();
      };
      
      img.src = url;
    });
  }

  /**
   * Предварительно загружает массив изображений
   * @param urls Массив URL изображений
   * @param baseUrl Базовый URL (опционально)
   */
  public preloadImages(urls: string[], baseUrl: string = ''): void {
    urls.forEach(url => {
      const fullUrl = `${baseUrl}${url}`;
      this.preloadImage(fullUrl);
    });
  }

  /**
   * Очищает весь кеш изображений
   */
  public clearCache(): void {
    this.cache.clear();
    this.preloadedImages.clear();
  }

  /**
   * Проверяет и очищает кеш, если он превышает максимальный размер
   */
  private cleanCacheIfNeeded(): void {
    if (this.cache.size > MAX_CACHE_SIZE) {
      // Сортируем записи по времени и удаляем самые старые
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Удаляем 20% самых старых записей
      const entriesToRemove = Math.floor(MAX_CACHE_SIZE * 0.2);
      
      for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
        const [key] = entries[i];
        this.cache.delete(key);
        this.preloadedImages.delete(key);
      }
    }
  }

  /**
   * Генерирует ключ для кеша на основе URL
   * @param url URL изображения
   * @returns Ключ для кеша
   */
  private getCacheKey(url: string): string {
    return url;
  }
}

// Создаем синглтон для использования во всем приложении
const imageCache = new ImageCacheService();

export default imageCache; 