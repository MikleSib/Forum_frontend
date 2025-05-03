/**
 * Сервис для кеширования изображений
 */
import { IMAGE_CACHE_OPTIONS } from '../config/api';

// Кеш хранит ссылки на изображения с соответствующими URL
interface CacheEntry {
  url: string;
  timestamp: number;
  loaded: boolean;
  error: boolean;
  data?: Blob; // Добавляем данные изображения для принудительного кеширования
}

// Максимальное время кеширования
const MAX_CACHE_AGE = IMAGE_CACHE_OPTIONS.MAX_CACHE_AGE;

// Размер кеша в памяти
const MEMORY_CACHE_SIZE = IMAGE_CACHE_OPTIONS.MEMORY_CACHE_SIZE || 200;

// Размер кеша в IndexedDB
const INDEXED_DB_CACHE_SIZE = IMAGE_CACHE_OPTIONS.INDEXED_DB_CACHE_SIZE || 1000;

// Включить отладочные логи
const ENABLE_DEBUG_LOGS = IMAGE_CACHE_OPTIONS.ENABLE_DEBUG_LOGS;

// Проверка поддержки IndexedDB
const isIndexedDBSupported = 'indexedDB' in window && IMAGE_CACHE_OPTIONS.USE_INDEXED_DB;

// Проверка поддержки Cache API
const isCacheAPISupported = 'caches' in window && IMAGE_CACHE_OPTIONS.USE_CACHE_API;

// Имя кеша для Cache Storage API
const CACHE_NAME = IMAGE_CACHE_OPTIONS.CACHE_NAME;

// Приоритеты загрузки
const LOAD_PRIORITY = IMAGE_CACHE_OPTIONS.LOAD_PRIORITY || ['IndexedDB', 'Memory', 'CacheAPI', 'Server'];

class ImageCacheService {
  private cache: Map<string, CacheEntry>;
  private preloadedImages: Map<string, HTMLImageElement>;
  private dbName = 'ImageCacheDB';
  private storeName = 'imageCache';
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.cache = new Map();
    this.preloadedImages = new Map();
    
    // Инициализируем IndexedDB
    if (isIndexedDBSupported && IMAGE_CACHE_OPTIONS.FORCE_CACHE) {
      this.initPromise = this.initIndexedDB();
    }
    
    // Инициализируем Cache Storage
    if ('caches' in window) {
      caches.open(CACHE_NAME).then(cache => {
        if (ENABLE_DEBUG_LOGS) {
          console.log(`%c[ImageCache] Cache Storage открыт: ${CACHE_NAME}`, 'background: #004D40; color: white; padding: 2px 5px; border-radius: 2px;');
        }
      });
    }
    
    // В отличие от предыдущей версии, НЕ очищаем кеш при выходе с сайта
    // Это позволит кешу сохраняться между перезагрузками страницы
    // Но добавляем очистку только если отключено PERSISTENT_CACHE
    if (!IMAGE_CACHE_OPTIONS.PERSISTENT_CACHE) {
      window.addEventListener('beforeunload', () => {
        this.clearCache();
      });
    }
  }

  /**
   * Инициализация IndexedDB
   */
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = (event) => {
        if (ENABLE_DEBUG_LOGS) {
          console.error('Ошибка при открытии IndexedDB:', event);
        }
        reject(new Error('Ошибка при открытии IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        if (ENABLE_DEBUG_LOGS) {
          console.log(`%c[ImageCache] IndexedDB успешно инициализирована: ${this.dbName}`, 'background: #004D40; color: white; padding: 2px 5px; border-radius: 2px;');
        }
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Создаем хранилище объектов, если его нет
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'url' });
          
          // Создаем индекс по времени для быстрого доступа
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          
          if (ENABLE_DEBUG_LOGS) {
            console.log(`%c[ImageCache] Создано хранилище в IndexedDB: ${this.storeName}`, 'background: #004D40; color: white; padding: 2px 5px; border-radius: 2px;');
          }
        }
      };
    });
  }

  /**
   * Сначала пробуем получить изображение из Cache Storage API
   */
  private async getFromCacheStorage(url: string): Promise<Response | null> {
    if (!('caches' in window)) return null;
    
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(url);
      
      if (cachedResponse) {
        if (ENABLE_DEBUG_LOGS) {
          console.log(`%c[ImageCache] ПОЛУЧЕНО ИЗ CACHE STORAGE: ${url}`, 'background: #E91E63; color: white; padding: 2px 5px; border-radius: 2px;');
        }
        return cachedResponse;
      }
    } catch (error) {
      console.error('Ошибка при попытке получить изображение из Cache Storage:', error);
    }
    
    return null;
  }

  /**
   * Кеширование изображения в Cache Storage API
   */
  private async cacheInCacheStorage(url: string, response: Response): Promise<void> {
    if (!('caches' in window)) return;
    
    try {
      const cache = await caches.open(CACHE_NAME);
      const clonedResponse = response.clone();
      await cache.put(url, clonedResponse);
      
      if (ENABLE_DEBUG_LOGS) {
        console.log(`%c[ImageCache] СОХРАНЕНО В CACHE STORAGE: ${url}`, 'background: #E91E63; color: white; padding: 2px 5px; border-radius: 2px;');
      }
    } catch (error) {
      console.error('Ошибка при попытке сохранить изображение в Cache Storage:', error);
    }
  }

  /**
   * Получает URL изображения из кеша или загружает его
   * @param imageUrl URL изображения для загрузки
   * @param baseUrl Базовый URL (опционально)
   * @returns URL изображения или Data URL (если используется принудительное кеширование)
   */
  public async getImage(imageUrl: string, baseUrl: string = ''): Promise<string> {
    // Ждем инициализации IndexedDB, если процесс запущен
    if (this.initPromise) {
      await this.initPromise;
    }
    
    const fullUrl = `${baseUrl}${imageUrl}`;
    const cacheKey = this.getCacheKey(fullUrl);
    
    if (ENABLE_DEBUG_LOGS) {
      console.log(`%c[ImageCache] Запрос изображения: ${fullUrl}`, 'background: #0D47A1; color: white; padding: 2px 5px; border-radius: 2px;');
    }
    
    // 1. Сначала проверяем IndexedDB (постоянное хранилище на диске)
    if (isIndexedDBSupported && IMAGE_CACHE_OPTIONS.FORCE_CACHE) {
      const imageFromDB = await this.getImageFromIndexedDB(cacheKey);
      if (imageFromDB) {
        // Кешируем в памяти для последующих запросов
        this.cache.set(cacheKey, {
          url: fullUrl,
          timestamp: Date.now(),
          loaded: true,
          error: false,
          data: imageFromDB
        });
        
        const dataUrl = URL.createObjectURL(imageFromDB);
        
        if (ENABLE_DEBUG_LOGS) {
          console.log(`%c[ImageCache] ИСПОЛЬЗОВАНИЕ ИЗ INDEXEDDB (ДИСК): ${cacheKey}`, 'background: #00BCD4; color: white; padding: 2px 5px; border-radius: 2px;');
        }
        
        return dataUrl;
      }
    }
    
    // 2. Затем проверяем кеш в памяти (работает быстрее всего, но только в рамках текущей сессии)
    const cachedEntry = this.cache.get(cacheKey);
    if (cachedEntry) {
      // Проверяем срок годности кеша
      if (Date.now() - cachedEntry.timestamp < MAX_CACHE_AGE) {
        if (cachedEntry.loaded && !cachedEntry.error) {
          if (ENABLE_DEBUG_LOGS) {
            console.log(`%c[ImageCache] ИСПОЛЬЗОВАНИЕ ИЗ ПАМЯТИ: ${cacheKey}`, 'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 2px;');
          }
          
          // Если есть данные изображения
          if (cachedEntry.data) {
            const dataUrl = URL.createObjectURL(cachedEntry.data);
            return dataUrl;
          }
          
          return fullUrl;
        }
      } else {
        // Если кеш устарел, удаляем запись
        this.cache.delete(cacheKey);
      }
    }
    
    // 3. Проверяем Cache Storage API
    const cachedResponse = await this.getFromCacheStorage(fullUrl);
    if (cachedResponse) {
      try {
        const blob = await cachedResponse.blob();
        
        // Сохраняем в память и IndexedDB для ускорения будущего доступа
        this.cache.set(cacheKey, {
          url: fullUrl,
          timestamp: Date.now(),
          loaded: true,
          error: false,
          data: blob
        });
        
        // Также сохраним в IndexedDB для постоянного хранения
        if (isIndexedDBSupported && IMAGE_CACHE_OPTIONS.FORCE_CACHE) {
          this.saveImageToIndexedDB(cacheKey, blob.slice(), fullUrl);
        }
        
        const dataUrl = URL.createObjectURL(blob);
        
        if (ENABLE_DEBUG_LOGS) {
          console.log(`%c[ImageCache] ПОЛУЧЕНО ИЗ CACHE STORAGE И ПЕРЕМЕЩЕНО В БОЛЕЕ БЫСТРЫЙ КЕШ: ${cacheKey}`, 'background: #E91E63; color: white; padding: 2px 5px; border-radius: 2px;');
        }
        
        return dataUrl;
      } catch (error) {
        console.error(`Ошибка при обработке изображения из Cache Storage: ${error}`);
      }
    }
    
    // 4. Если ничего не найдено, загружаем изображение
    try {
      if (ENABLE_DEBUG_LOGS) {
        console.log(`%c[ImageCache] КЕШ ОТСУТСТВУЕТ, ЗАГРУЗКА С СЕРВЕРА: ${fullUrl}`, 'background: #FF5722; color: white; padding: 2px 5px; border-radius: 2px;');
      }
      
      // Загружаем изображение с сервера с флагом no-cache
      const noCacheUrl = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}_nocache=${Date.now()}`;
      
      const response = await fetch(noCacheUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
      }
      
      // Получаем данные изображения
      const blob = await response.blob();
      
      // Кешируем в памяти
      this.cache.set(cacheKey, {
        url: fullUrl,
        timestamp: Date.now(),
        loaded: true,
        error: false,
        data: blob
      });
      
      // Сохраняем в IndexedDB (приоритетное хранилище)
      if (isIndexedDBSupported && IMAGE_CACHE_OPTIONS.FORCE_CACHE) {
        this.saveImageToIndexedDB(cacheKey, blob.slice(), fullUrl);
      }
      
      // Сохраняем в Cache Storage как резервный вариант
      await this.cacheInCacheStorage(fullUrl, response.clone());
      
      // Создаем URL для изображения
      const dataUrl = URL.createObjectURL(blob);
      
      if (ENABLE_DEBUG_LOGS) {
        console.log(`%c[ImageCache] ЗАГРУЖЕНО И КЕШИРОВАНО: ${cacheKey}`, 'background: #2196F3; color: white; padding: 2px 5px; border-radius: 2px;');
      }
      
      // Предзагружаем изображение для корректного отображения
      const img = new Image();
      img.src = dataUrl;
      this.preloadedImages.set(cacheKey, img);
      
      return dataUrl;
    } catch (error) {
      console.error(`[ImageCache] Ошибка при загрузке изображения: ${fullUrl}`, error);
      return fullUrl;
    }
  }

  /**
   * Получает изображение из IndexedDB
   * @param key Ключ изображения
   * @returns Promise с Blob данными изображения или null
   */
  private getImageFromIndexedDB(key: string): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve(null);
        return;
      }
      
      try {
        const transaction = this.db.transaction([this.storeName], 'readonly');
        const objectStore = transaction.objectStore(this.storeName);
        const request = objectStore.get(key);
        
        request.onsuccess = () => {
          const result = request.result;
          if (result && result.data) {
            resolve(result.data);
          } else {
            resolve(null);
          }
        };
        
        request.onerror = () => {
          console.error(`[ImageCache] Ошибка при получении изображения из IndexedDB: ${key}`);
          resolve(null);
        };
      } catch (error) {
        console.error(`[ImageCache] Ошибка при доступе к IndexedDB: ${key}`, error);
        resolve(null);
      }
    });
  }

  /**
   * Сохраняет изображение в IndexedDB
   * @param key Ключ изображения
   * @param data Данные изображения (Blob)
   */
  private saveImageToIndexedDB(key: string, data: Blob, url: string): void {
    if (!this.db) return;
    
    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      
      const imageData = {
        url: key,
        timestamp: Date.now(),
        data: data
      };
      
      const request = objectStore.put(imageData);
      
      request.onsuccess = () => {
        if (ENABLE_DEBUG_LOGS) {
          console.log(`%c[ImageCache] Сохранено в IndexedDB: ${key}`, 'background: #00BCD4; color: white; padding: 2px 5px; border-radius: 2px;');
        }
      };
      
      request.onerror = () => {
        console.error(`[ImageCache] Ошибка при сохранении в IndexedDB: ${key}`);
      };
    } catch (error) {
      console.error(`[ImageCache] Ошибка при доступе к IndexedDB для сохранения: ${key}`, error);
    }
  }

  /**
   * Предварительно загружает изображения из постов
   * @param posts Массив постов
   * @param baseUrl Базовый URL (опционально)
   */
  public preloadPostImages(posts: any[], baseUrl: string = ''): void {
    if (!Array.isArray(posts) || !IMAGE_CACHE_OPTIONS.PRELOAD_IMAGES) return;
    
    // Собираем все URL изображений из постов
    const imageUrls: string[] = [];
    
    posts.forEach(post => {
      if (post.images && Array.isArray(post.images)) {
        post.images.forEach((image: any) => {
          if (image && image.image_url) {
            imageUrls.push(image.image_url);
          }
        });
      }
    });
    
    if (ENABLE_DEBUG_LOGS) {
      console.log(`%c[ImageCache] Предзагрузка ${imageUrls.length} изображений из постов`, 'background: #673AB7; color: white; padding: 2px 5px; border-radius: 2px;');
    }
    
    // Предзагружаем изображения
    this.preloadImages(imageUrls, baseUrl);
  }

  /**
   * Приоритезирует кеширование изображений для Dashboard
   * Эта функция проверяет наличие изображений в кеше и загружает только отсутствующие
   * @param imageUrls Массив URL изображений
   * @param baseUrl Базовый URL (опционально)
   * @returns Promise с массивом успешно кешированных изображений
   */
  public async prioritizeDashboardImages(imageUrls: string[], baseUrl: string = ''): Promise<string[]> {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return [];
    }
    
    // Проверяем, какие изображения уже есть в кеше, а какие нужно загрузить
    const urlsToLoad: string[] = [];
    const cachedUrls: string[] = [];
    
    for (const url of imageUrls) {
      const fullUrl = `${baseUrl}${url}`;
      const cacheKey = this.getCacheKey(fullUrl);
      
      // Проверяем наличие в индексированной БД (приоритет 1)
      if (isIndexedDBSupported) {
        const imageFromDB = await this.getImageFromIndexedDB(cacheKey);
        if (imageFromDB) {
          cachedUrls.push(url);
          continue;
        }
      }
      
      // Проверяем наличие в кеше памяти (приоритет 2)
      const cachedEntry = this.cache.get(cacheKey);
      if (cachedEntry && Date.now() - cachedEntry.timestamp < MAX_CACHE_AGE && 
          cachedEntry.loaded && !cachedEntry.error) {
        cachedUrls.push(url);
        continue;
      }
      
      // Если не нашли в приоритетном кеше, добавляем для загрузки
      urlsToLoad.push(url);
    }
    
    if (ENABLE_DEBUG_LOGS) {
      console.log(`%c[ImageCache] Dashboard: ${cachedUrls.length} изображений в кеше, ${urlsToLoad.length} для загрузки`, 
        'background: #3F51B5; color: white; padding: 2px 5px; border-radius: 2px;');
    }
    
    // Запускаем загрузку отсутствующих изображений
    // Загружаем параллельно, но не более 4 изображений одновременно
    const batchSize = 4;
    for (let i = 0; i < urlsToLoad.length; i += batchSize) {
      const batch = urlsToLoad.slice(i, i + batchSize);
      await Promise.all(batch.map(url => this.getImage(`${baseUrl}${url}`).catch(() => null)));
    }
    
    return [...cachedUrls, ...urlsToLoad];
  }

  /**
   * Предварительно загружает массив изображений
   * @param urls Массив URL изображений
   * @param baseUrl Базовый URL (опционально)
   */
  public preloadImages(urls: string[], baseUrl: string = ''): void {
    urls.forEach(url => {
      const fullUrl = `${baseUrl}${url}`;
      this.getImage(fullUrl); // Используем getImage вместо preloadImage
    });
  }

  /**
   * Очищает весь кеш изображений
   */
  public clearCache(): void {
    this.cache.clear();
    this.preloadedImages.clear();
    
    // Очищаем IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const objectStore = transaction.objectStore(this.storeName);
        objectStore.clear();
      } catch (error) {
        console.error('[ImageCache] Ошибка при очистке IndexedDB:', error);
      }
    }
    
    // Очищаем Cache Storage
    if ('caches' in window) {
      caches.delete(CACHE_NAME).then(success => {
        if (ENABLE_DEBUG_LOGS && success) {
          console.log(`%c[ImageCache] Cache Storage очищен: ${CACHE_NAME}`, 'background: #004D40; color: white; padding: 2px 5px; border-radius: 2px;');
        }
      });
    }
  }

  /**
   * Проверяет и очищает кеш, если он превышает максимальный размер
   */
  private cleanCacheIfNeeded(): void {
    if (this.cache.size > MEMORY_CACHE_SIZE) {
      // Сортируем записи по времени и удаляем самые старые
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Удаляем 20% самых старых записей
      const entriesToRemove = Math.floor(MEMORY_CACHE_SIZE * 0.2);
      
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
    // Проверка правильного формата URL
    try {
      // Извлекаем только путь изображения, игнорируя параметры запроса и хеш-фрагменты
      const urlObj = new URL(url, window.location.origin);
      const pathname = urlObj.pathname;
      
      if (ENABLE_DEBUG_LOGS) {
        console.log(`[ImageCache] Генерация ключа кеша: ${url} -> ${pathname}`);
      }
      
      // Используем только путь к файлу в качестве ключа кеша
      return pathname;
    } catch (error) {
      console.error(`[ImageCache] Ошибка формирования ключа для URL: ${url}`, error);
      // Если URL невалидный, возвращаем оригинальный URL
      return url;
    }
  }
}

// Создаем синглтон для использования во всем приложении
const imageCache = new ImageCacheService();

export default imageCache; 