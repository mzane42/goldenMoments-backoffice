import { supabase } from './supabase';

/**
 * Supabase Storage Upload Utilities
 * Handles image uploads, deletions, and validations for the 'hotels' bucket
 */

// Constants
export const BUCKET_NAME = 'hotels';
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

// Types
export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

/**
 * Validate a file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non autorisé. Formats acceptés: ${ALLOWED_FILE_TYPES.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Fichier trop volumineux. Taille maximale: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Generate a unique filename to avoid collisions
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(`.${extension}`, '').replace(/[^a-zA-Z0-9]/g, '-');
  return `${nameWithoutExt}-${timestamp}-${randomStr}.${extension}`;
}

/**
 * Generate bucket path for organizing files
 * Format: {experienceTitle}-{experienceId}/[subfolder/]
 */
export function generateBucketPath(
  experienceTitle: string,
  experienceId?: string,
  subfolder?: string
): string {
  const sanitizedTitle = experienceTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  const id = experienceId || `temp-${Date.now()}`;
  const basePath = `${sanitizedTitle}-${id}`;

  if (subfolder) {
    return `${basePath}/${subfolder}`;
  }

  return basePath;
}

/**
 * Upload a single image to Supabase storage
 */
export async function uploadImage(
  file: File,
  bucketPath: string
): Promise<UploadResult> {
  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    return {
      url: '',
      path: '',
      error: validation.error,
    };
  }

  try {
    // Generate unique filename
    const filename = generateUniqueFilename(file.name);
    const fullPath = `${bucketPath}/${filename}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('Upload error:', error);
      return {
        url: '',
        path: '',
        error: error.message || 'Erreur lors du téléchargement',
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (err) {
    console.error('Upload exception:', err);
    return {
      url: '',
      path: '',
      error: err instanceof Error ? err.message : 'Erreur inconnue',
    };
  }
}

/**
 * Upload multiple images with progress tracking
 */
export async function uploadImages(
  files: File[],
  bucketPath: string,
  onProgress?: (progress: UploadProgress[]) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  const progressMap = new Map<string, UploadProgress>();

  // Initialize progress tracking
  files.forEach((file) => {
    progressMap.set(file.name, {
      fileName: file.name,
      progress: 0,
      status: 'pending',
    });
  });

  // Notify initial progress
  if (onProgress) {
    onProgress(Array.from(progressMap.values()));
  }

  // Upload files sequentially to avoid overwhelming the server
  for (const file of files) {
    // Update status to uploading
    progressMap.set(file.name, {
      fileName: file.name,
      progress: 50,
      status: 'uploading',
    });
    if (onProgress) {
      onProgress(Array.from(progressMap.values()));
    }

    // Upload the file
    const result = await uploadImage(file, bucketPath);
    results.push(result);

    // Update progress
    if (result.error) {
      progressMap.set(file.name, {
        fileName: file.name,
        progress: 100,
        status: 'error',
        error: result.error,
      });
    } else {
      progressMap.set(file.name, {
        fileName: file.name,
        progress: 100,
        status: 'success',
      });
    }

    if (onProgress) {
      onProgress(Array.from(progressMap.values()));
    }
  }

  return results;
}

/**
 * Delete an image from Supabase storage
 */
export async function deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract path from URL
    // URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const urlParts = imageUrl.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) {
      return { success: false, error: 'URL invalide' };
    }

    const [bucket, ...pathParts] = urlParts[1].split('/');
    const path = pathParts.join('/');

    if (bucket !== BUCKET_NAME) {
      return { success: false, error: 'Bucket invalide' };
    }

    // Delete from storage
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Delete exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur inconnue',
    };
  }
}

/**
 * Delete multiple images
 */
export async function deleteImages(imageUrls: string[]): Promise<{
  success: boolean;
  errors: { url: string; error: string }[];
}> {
  const errors: { url: string; error: string }[] = [];

  for (const url of imageUrls) {
    const result = await deleteImage(url);
    if (!result.success && result.error) {
      errors.push({ url, error: result.error });
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if a file is an image based on extension
 */
export function isImageFile(filename: string): boolean {
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  const ext = getFileExtension(filename);
  return validExtensions.includes(ext);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
