import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { validateFile, formatFileSize } from '@/lib/supabaseUpload';

/**
 * ImageUpload Component
 * A drag-and-drop image upload component with reordering support
 */

interface ImageUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
  className?: string;
  showMainBadge?: boolean;
}

export function ImageUpload({
  files,
  onChange,
  maxImages = 10,
  disabled = false,
  className,
  showMainBadge = true,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection from input
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    handleFiles(selectedFiles);
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  };

  // Handle files from drag-and-drop or file input
  const handleFiles = (newFiles: File[]) => {
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    // Validate each file
    newFiles.forEach((file) => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else if (validation.error) {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    });

    // Check max images limit
    const totalFiles = files.length + validFiles.length;
    if (totalFiles > maxImages) {
      validationErrors.push(
        `Maximum ${maxImages} images autorisées. ${totalFiles - maxImages} image(s) ignorée(s).`
      );
      const allowedCount = maxImages - files.length;
      onChange([...files, ...validFiles.slice(0, allowedCount)]);
    } else {
      onChange([...files, ...validFiles]);
    }

    setErrors(validationErrors);
    // Clear errors after 5 seconds
    if (validationErrors.length > 0) {
      setTimeout(() => setErrors([]), 5000);
    }
  };

  // Drag and drop handlers for file drop zone
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  // Remove a file from the list
  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  // Drag and drop handlers for reordering
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (disabled) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOverImage = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setDragOverIndex(index);
  };

  const handleDragLeaveImage = () => {
    setDragOverIndex(null);
  };

  const handleDropImage = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (isNaN(dragIndex) || dragIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    // Reorder files
    const newFiles = [...files];
    const [draggedFile] = newFiles.splice(dragIndex, 1);
    newFiles.splice(dropIndex, 0, draggedFile);
    onChange(newFiles);
    setDragOverIndex(null);
  };

  // Click to select files
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all cursor-pointer',
          'hover:border-primary hover:bg-accent/50',
          isDragging && 'border-primary bg-accent',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />

        <Upload className={cn('h-10 w-10 mb-4 text-muted-foreground', isDragging && 'text-primary')} />
        <p className="text-sm font-medium text-center mb-1">
          {isDragging ? 'Déposez les images ici' : 'Glissez-déposez des images ou cliquez pour sélectionner'}
        </p>
        <p className="text-xs text-muted-foreground text-center">
          PNG, JPG, WEBP, GIF (max {maxImages} images, 5MB chacune)
        </p>
      </div>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-md bg-destructive/10 p-3 space-y-1"
          >
            {errors.map((error, index) => (
              <p key={index} className="text-xs text-destructive">
                {error}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Grid */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Images sélectionnées ({files.length}/{maxImages})
            </p>
            {showMainBadge && files.length > 0 && (
              <p className="text-xs text-muted-foreground">
                La première image sera l'image principale
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  draggable={!disabled}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOverImage(e, index)}
                  onDragLeave={handleDragLeaveImage}
                  onDrop={(e) => handleDropImage(e, index)}
                  className={cn(
                    'relative aspect-square rounded-lg border-2 overflow-hidden group cursor-move',
                    'hover:border-primary transition-all',
                    dragOverIndex === index && 'border-primary scale-105',
                    disabled && 'cursor-not-allowed'
                  )}
                >
                  {/* Image Preview */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    onLoad={(e) => {
                      // Revoke object URL after image loads to free memory
                      const img = e.target as HTMLImageElement;
                      setTimeout(() => URL.revokeObjectURL(img.src), 100);
                    }}
                  />

                  {/* Order Badge */}
                  <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shadow-sm">
                    {index + 1}
                  </div>

                  {/* Main Image Badge */}
                  {showMainBadge && index === 0 && (
                    <div className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                      <Star className="h-3 w-3 fill-primary-foreground text-primary-foreground" />
                      <span className="text-xs font-medium text-primary-foreground">Principal</span>
                    </div>
                  )}

                  {/* File Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">{file.name}</p>
                    <p className="text-xs text-white/70">{formatFileSize(file.size)}</p>
                  </div>

                  {/* Delete Button */}
                  {!disabled && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Aucune image sélectionnée</p>
        </div>
      )}
    </div>
  );
}
