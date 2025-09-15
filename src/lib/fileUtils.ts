import { FileItem, FolderItem, FileSystemItem, SearchResult, FileFilter, SortBy, SortOrder } from '@/types';
import { FILE_TYPE_CATEGORIES } from './constants';

// File type detection
export function getFileTypeFromExtension(extension: string): string {
  const ext = extension.toLowerCase();
  
  for (const [category, extensions] of Object.entries(FILE_TYPE_CATEGORIES)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }
  
  return 'OTHER';
}

// MIME type detection
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    // Images
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'ico': 'image/x-icon',
    
    // Documents
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    'odt': 'application/vnd.oasis.opendocument.text',
    
    // Spreadsheets
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'csv': 'text/csv',
    'ods': 'application/vnd.oasis.opendocument.spreadsheet',
    
    // Presentations
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'odp': 'application/vnd.oasis.opendocument.presentation',
    
    // Archives
    'zip': 'application/zip',
    'rar': 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    'tar': 'application/x-tar',
    'gz': 'application/gzip',
    
    // Videos
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'aac': 'audio/aac',
    'flac': 'audio/flac',
    'ogg': 'audio/ogg',
    
    // Code
    'js': 'application/javascript',
    'ts': 'application/typescript',
    'jsx': 'text/jsx',
    'tsx': 'text/tsx',
    'html': 'text/html',
    'css': 'text/css',
    'scss': 'text/scss',
    'json': 'application/json',
    'xml': 'application/xml',
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Date formatting
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

// Search functionality
export function searchItems(items: FileSystemItem[], query: string): SearchResult[] {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  const results: SearchResult[] = [];
  
  function searchRecursive(items: FileSystemItem[], path: string = ''): void {
    items.forEach(item => {
      const itemPath = path ? `${path}/${item.name}` : item.name;
      const matchedFields: string[] = [];
      let score = 0;
      
      // Search in name
      if (item.name.toLowerCase().includes(searchTerm)) {
        matchedFields.push('name');
        score += item.name.toLowerCase().startsWith(searchTerm) ? 10 : 5;
      }
      
      // Search in tags (for files)
      if (item.type === 'file') {
        const file = item as FileItem;
        if (file.tags) {
          file.tags.forEach(tag => {
            if (tag.toLowerCase().includes(searchTerm)) {
              matchedFields.push('tags');
              score += 3;
            }
          });
        }
        
        // Search in description
        if (file.description?.toLowerCase().includes(searchTerm)) {
          matchedFields.push('description');
          score += 2;
        }
      }
      
      // Search in description (for folders)
      if (item.type === 'folder') {
        const folder = item as FolderItem;
        if (folder.description?.toLowerCase().includes(searchTerm)) {
          matchedFields.push('description');
          score += 2;
        }
      }
      
      if (matchedFields.length > 0) {
        results.push({
          item,
          score,
          matchedFields,
        });
      }
      
      // Search in children (for folders)
      if (item.type === 'folder') {
        searchRecursive((item as FolderItem).children, itemPath);
      }
    });
  }
  
  searchRecursive(items);
  
  // Sort by score (highest first)
  return results.sort((a, b) => b.score - a.score);
}

// Filter functionality
export function filterItems(items: FileSystemItem[], filter: FileFilter): FileSystemItem[] {
  let filtered = [...items];
  
  // Filter by search term
  if (filter.searchTerm) {
    const searchResults = searchItems(filtered, filter.searchTerm);
    filtered = searchResults.map(result => result.item);
  }
  
  // Filter by file types
  if (filter.fileTypes.length > 0) {
    filtered = filtered.filter(item => {
      if (item.type === 'folder') return true;
      const file = item as FileItem;
      return filter.fileTypes.includes(file.extension.toLowerCase());
    });
  }
  
  // Filter by client
  if (filter.clientId) {
    filtered = filtered.filter(item => item.clientId === filter.clientId);
  }
  
  // Filter by tags
  if (filter.tags && filter.tags.length > 0) {
    filtered = filtered.filter(item => {
      if (item.type === 'folder') return true;
      const file = item as FileItem;
      return file.tags?.some(tag => filter.tags!.includes(tag)) || false;
    });
  }
  
  // Filter by date range
  if (filter.dateRange.start || filter.dateRange.end) {
    filtered = filtered.filter(item => {
      const itemDate = item.modifiedAt;
      if (filter.dateRange.start && itemDate < filter.dateRange.start) return false;
      if (filter.dateRange.end && itemDate > filter.dateRange.end) return false;
      return true;
    });
  }
  
  return filtered;
}

// Sort functionality
export function sortItems(items: FileSystemItem[], sortBy: SortBy, sortOrder: SortOrder): FileSystemItem[] {
  const sorted = [...items].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = a.modifiedAt.getTime() - b.modifiedAt.getTime();
        break;
      case 'size':
        if (a.type === 'file' && b.type === 'file') {
          comparison = (a as FileItem).size - (b as FileItem).size;
        } else if (a.type === 'folder' && b.type === 'file') {
          comparison = -1; // Folders first
        } else if (a.type === 'file' && b.type === 'folder') {
          comparison = 1; // Folders first
        } else {
          comparison = 0;
        }
        break;
      case 'type':
        if (a.type === 'folder' && b.type === 'file') {
          comparison = -1; // Folders first
        } else if (a.type === 'file' && b.type === 'folder') {
          comparison = 1; // Folders first
        } else if (a.type === 'file' && b.type === 'file') {
          comparison = (a as FileItem).extension.localeCompare((b as FileItem).extension);
        } else {
          comparison = 0;
        }
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}

// File validation
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = Object.values(FILE_TYPE_CATEGORIES).flat();
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${formatFileSize(maxSize)}`,
    };
  }
  
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension && !allowedTypes.includes(extension)) {
    return {
      valid: false,
      error: `File type .${extension} is not supported`,
    };
  }
  
  return { valid: true };
}

// Generate file ID
export function generateFileId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Generate folder ID
export function generateFolderId(): string {
  return `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get file icon based on extension
export function getFileIcon(extension: string): string {
  const category = getFileTypeFromExtension(extension);
  
  const iconMap: Record<string, string> = {
    IMAGE: 'image',
    DOCUMENT: 'file-text',
    SPREADSHEET: 'table',
    PRESENTATION: 'presentation',
    ARCHIVE: 'archive',
    VIDEO: 'video',
    AUDIO: 'music',
    CODE: 'code',
    OTHER: 'file',
  };
  
  return iconMap[category] || 'file';
}
