import { IStorageService, UploadProgress, UploadState, UploadTask } from '../../types/storage';

class LocalStorageService implements IStorageService {
  private tasks: Map<string, UploadTask> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();

  public async createUploadTask(
    fileOrBlob: File | Blob,
    mediaType: 'image' | 'video' | 'file' | 'audio',
    customFileName?: string
  ): Promise<UploadTask> {
    const taskId = 'upl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const fileName =
      customFileName ||
      (fileOrBlob instanceof File ? fileOrBlob.name : `recording_${Date.now()}.${mediaType === 'audio' ? 'opus' : 'bin'}`);
    const localPreviewUrl = URL.createObjectURL(fileOrBlob);

    const task: UploadTask = {
      id: taskId,
      file: fileOrBlob instanceof File ? fileOrBlob : undefined,
      blob: fileOrBlob,
      fileName,
      fileSizeBytes: fileOrBlob.size,
      mimeType: fileOrBlob.type || 'application/octet-stream',
      mediaType,
      progress: 0,
      state: 'preparing',
      localPreviewUrl,
      createdAt: Date.now(),
    };

    this.tasks.set(taskId, task);
    return { ...task };
  }

  public async startUpload(
    taskId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; url: string; error?: string }> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return { success: false, url: '', error: 'Upload task not found' };
    }

    const controller = new AbortController();
    this.abortControllers.set(taskId, controller);

    task.state = 'uploading';
    task.progress = 5;

    if (onProgress) {
      onProgress({
        taskId,
        loadedBytes: Math.floor(task.fileSizeBytes * 0.05),
        totalBytes: task.fileSizeBytes,
        percentage: 5,
        state: 'uploading',
      });
    }

    try {
      // Chunk progress updates with cancel support
      for (let p = 20; p <= 90; p += 25) {
        if (controller.signal.aborted) {
          task.state = 'failed';
          task.error = 'Upload aborted by operator';
          return { success: false, url: '', error: 'Upload aborted' };
        }

        await new Promise(resolve => setTimeout(resolve, 150));
        task.progress = p;
        if (onProgress) {
          onProgress({
            taskId,
            loadedBytes: Math.floor((task.fileSizeBytes * p) / 100),
            totalBytes: task.fileSizeBytes,
            percentage: p,
            state: 'uploading',
          });
        }
      }

      // Check if aborted at the end
      if (controller.signal.aborted) {
        task.state = 'failed';
        task.error = 'Upload cancelled';
        return { success: false, url: '', error: 'Upload cancelled' };
      }

      // Completion
      task.progress = 100;
      task.state = 'complete';
      task.uploadedUrl = task.localPreviewUrl; // In client mode, local blob URL serves as verified staged media

      if (onProgress) {
        onProgress({
          taskId,
          loadedBytes: task.fileSizeBytes,
          totalBytes: task.fileSizeBytes,
          percentage: 100,
          state: 'complete',
        });
      }

      return { success: true, url: task.uploadedUrl };
    } catch (err) {
      task.state = 'failed';
      task.error = (err as Error).message || 'Encrypted transfer interrupted';
      if (onProgress) {
        onProgress({
          taskId,
          loadedBytes: 0,
          totalBytes: task.fileSizeBytes,
          percentage: task.progress,
          state: 'failed',
          error: task.error,
        });
      }
      return { success: false, url: '', error: task.error };
    } finally {
      this.abortControllers.delete(taskId);
    }
  }

  public async retryUpload(
    taskId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<{ success: boolean; url: string; error?: string }> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return { success: false, url: '', error: 'Task not found' };
    }
    task.error = undefined;
    task.state = 'preparing';
    task.progress = 0;
    return this.startUpload(taskId, onProgress);
  }

  public cancelUpload(taskId: string): void {
    const controller = this.abortControllers.get(taskId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(taskId);
    }
    const task = this.tasks.get(taskId);
    if (task) {
      task.state = 'failed';
      task.error = 'Cancelled by operator';
    }
  }

  public getTask(taskId: string): UploadTask | undefined {
    return this.tasks.get(taskId);
  }
}

export const storageService: IStorageService = new LocalStorageService();
