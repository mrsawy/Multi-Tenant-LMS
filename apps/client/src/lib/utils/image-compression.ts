
import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    quality?: number;
}

/**
 * Compress image on client side before uploading
 */
export async function compressImage(
    file: File,
    options?: CompressionOptions
): Promise<File> {
    const defaultOptions = {
        maxSizeMB: 0.2, // Maximum file size in MB
        // maxSizeKb:"d",
        maxWidthOrHeight: 1920, // Maximum width or height
        useWebWorker: true, // Use web worker for better performance
        quality: 0.85, // Quality between 0 and 1
        ...options
    };

    try {
        console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

        // imageCompression takes a File or Blob
        const compressedFile = await imageCompression(file, defaultOptions);

        console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
        console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1), '%');

        return compressedFile;
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
}

/**
 * Resize image to specific dimensions
 */
export async function resizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = height * (maxWidth / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = width * (maxHeight / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to resize image'));
                        }
                    },
                    file.type,
                    0.85
                );
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}
