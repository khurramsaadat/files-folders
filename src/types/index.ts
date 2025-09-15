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
  thumbnail?: string;
  description?: string;
  version?: number;
  checksum?: string;
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
  description?: string;
  color?: string;
  icon?: string;
}

export type FileSystemItem = FileItem | FolderItem;

// File System Root
export interface FileSystemRoot {
  id: string;
  name: string;
  type: 'root';
  children: (FileItem | FolderItem)[];
  createdAt: Date;
  modifiedAt: Date;
}

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
  avatar?: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  totalFiles: number;
  totalSize: number;
  lastActivity?: Date;
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
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  clientId?: string;
  folderId?: string;
  uploadedAt?: Date;
}

// Search and Filter Types
export interface SearchResult {
  item: FileSystemItem;
  score: number;
  matchedFields: string[];
}

export interface FileSystemStats {
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  fileTypes: Record<string, number>;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'upload' | 'create' | 'delete' | 'rename' | 'move' | 'favorite';
  item: FileSystemItem;
  timestamp: Date;
  user?: string;
  description: string;
}

// Context Types
export interface FileSystemContextType {
  // State
  fileSystem: FileSystemRoot;
  clients: Client[];
  currentPath: string;
  selectedItems: string[];
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchQuery: string;
  filter: FileFilter;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentPath: (path: string) => void;
  setSelectedItems: (items: string[]) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortBy) => void;
  setSortOrder: (order: SortOrder) => void;
  setSearchQuery: (query: string) => void;
  setFilter: (filter: FileFilter) => void;
  
  // File Operations
  addFile: (file: FileItem) => void;
  addFolder: (folder: FolderItem) => void;
  updateFile: (id: string, updates: Partial<FileItem>) => void;
  updateFolder: (id: string, updates: Partial<FolderItem>) => void;
  deleteItem: (id: string) => void;
  moveItem: (id: string, newPath: string) => void;
  renameItem: (id: string, newName: string) => void;
  
  // Client Operations
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Search and Filter
  search: (query: string) => SearchResult[];
  filterItems: (filter: FileFilter) => FileSystemItem[];
  getStats: () => FileSystemStats;
}
