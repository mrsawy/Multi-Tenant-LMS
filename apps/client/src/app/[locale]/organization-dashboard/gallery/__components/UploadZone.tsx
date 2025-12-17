'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { IconCloudUpload } from '@tabler/icons-react';

interface UploadZoneProps {
  onDrop: (files: File[]) => void;
  uploading: boolean;
  progress: number;
}

export function UploadZone({ onDrop, uploading, progress }: UploadZoneProps) {
  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onDrop(acceptedFiles);
      }
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': [],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    multiple: false,
    disabled: uploading,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((rejection) => {
        rejection.errors.forEach((error) => {
          if (error.code === 'file-too-large') {
            toast.error('File is too large. Max size is 5MB.');
          } else if (error.code === 'file-invalid-type') {
            toast.error('Invalid file type. Only images are allowed.');
          } else {
            toast.error(error.message);
          }
        });
      });
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative overflow-hidden rounded-xl border-2 border-dashed
        transition-all duration-200 ease-in-out
        p-12 flex flex-col items-center justify-center text-center
        ${
          uploading
            ? 'opacity-50 cursor-not-allowed border-muted'
            : 'cursor-pointer'
        }
        ${
          isDragActive && !uploading
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border bg-card/50 hover:border-primary/50 hover:bg-accent/50'
        }
      `}
    >
      <input {...getInputProps()} />
      <div className="rounded-full bg-primary/10 p-4 mb-4">
        <IconCloudUpload className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">
        {isDragActive ? 'Drop image here' : 'Click or drag image to upload'}
      </h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        Support for Images only. Max file size 5MB.
      </p>
      {uploading && (
        <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center backdrop-blur-sm p-8">
          <div className="w-full max-w-md space-y-4">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

