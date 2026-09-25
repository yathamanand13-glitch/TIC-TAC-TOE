export type UploadState = 'idle' | 'preparing' | 'uploading' | 'complete' | 'failed';

export interface UploadProgress {
  taskId: string;
  loadedBytes: number;
  totalBytes: number;
  percentage: number;
  state: UploadState;
  error?: string;
}

export interface UploadTask {
  id: string;
  file?: File;
  blob?: Blob;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  mediaType: 'image' | 'video' | 'file' | 'audio';
  progress: number; // 0 - 100
  state: UploadState;
  error?: string;
  localPreviewUrl: string;
  uploadedUrl?: string;
  createdAt: number;
}

export interface IStorageService {
  createUploadTask(
    fileOrBlob: File | Blob,
    mediaType: 'image' | 'video' | 'file' | 'audio',
    customFileName?: string
  ): Promise<UploadTask>;
  startUpload(
    taskId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; url: string; error?: string }>;
  retryUpload(
    taskId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; url: string; error?: string }>;
  cancelUpload(taskId: string): void;
  getTask(taskId: string): UploadTask | undefined;
}
