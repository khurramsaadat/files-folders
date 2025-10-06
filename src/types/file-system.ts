// File System Access API types
export interface FileSystemHandle {
  name: string;
  kind: 'file' | 'directory';
}

export interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: 'directory';
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
  resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
  isSameEntry(other: FileSystemHandle): Promise<boolean>;
}

export interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file';
  createWritable(): Promise<FileSystemWritableFileStream>;
  getFile(): Promise<File>;
  isSameEntry(other: FileSystemHandle): Promise<boolean>;
}

export interface FileSystemWritableFileStream {
  write(data: File | Blob): Promise<void>;
  close(): Promise<void>;
}
