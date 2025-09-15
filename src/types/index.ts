// File and Folder Types
export interface FileItem {
  id: string;
  name: string;
  type: 'file';
  size: number;
  extension: string;
  mimeType: string;
  createdAt: Date;
  modifiedAt: Date;
  path: string;
  clientId?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface FolderItem {
  id: string;
  name: string;
  type: 'folder';
  path: string;
  createdAt: Date;
  modifiedAt: Date;
  clientId?: string;
  children: (FileItem | FolderItem)[];
  isExpanded?: boolean;
}

export type FileSystemItem = FileItem | FolderItem;

// Client Types
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  createdAt: Date;
  lastAccessed?: Date;
  color?: string;
}

// View Types
export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'date' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';

// Filter Types
export interface FileFilter {
  searchTerm: string;
  fileTypes: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  clientId?: string;
  tags?: string[];
}

// UI State Types
export interface UIState {
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  selectedItems: string[];
  currentPath: string;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// File Upload Types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}
