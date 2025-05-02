/**
 * Утилита для сжатия изображений перед отправкой на сервер
 */

/**
 * Сжимает изображение с указанным качеством
 * @param file - Файл изображения
 * @param quality - Качество сжатия (0.0 - 1.0), по умолчанию 0.67 (33% сжатие)
 * @returns Promise с оптимизированным файлом
 */
export const compressImage = async (
  file: File,
  quality: number = 0.67
): Promise<File> => {
  // Проверка, что это изображение
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // Создаем объект Image и URL
  return new Promise((resolve, reject) => {
    try {
      // Создаем объект FileReader для чтения файла
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (!event.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }

        // Создаем изображение из загруженного файла
        const img = new Image();
        img.src = event.target.result as string;
        
        img.onload = () => {
          // Создаем Canvas для рисования изображения
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Получаем 2D контекст и рисуем изображение
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Рисуем изображение на canvas
          ctx.drawImage(img, 0, 0);
          
          // Конвертируем Canvas в Blob с указанным качеством
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }
              
              // Создаем новый File с тем же именем
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              
              resolve(compressedFile);
            },
            file.type,
            quality
          );
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // Читаем файл как Data URL
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Сжимает несколько изображений
 * @param files - Массив файлов изображений
 * @param quality - Качество сжатия (0.0 - 1.0), по умолчанию 0.67 (33% сжатие)
 * @returns Promise с массивом сжатых файлов
 */
export const compressMultipleImages = async (
  files: File[],
  quality: number = 0.67
): Promise<File[]> => {
  const compressionPromises = Array.from(files).map(file => 
    file.type.startsWith('image/') ? compressImage(file, quality) : file
  );
  
  return Promise.all(compressionPromises);
}; 