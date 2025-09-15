'use client';

import { useState, useEffect } from 'react';
import { Button } from './button';
import { LuFolderOpen, LuFile, LuChevronRight, LuChevronDown, LuX, LuRefreshCw, LuSearch, LuLayoutGrid, LuList, LuCalendar, LuHardDrive } from 'react-icons/lu';
import { formatFileSize } from '@/lib/fileUtils';

// Format date to match Windows Explorer format
const formatDate = (date: Date, includeTime: boolean = false): string => {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear().toString().substr(-2);
  
  if (includeTime) {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${day}-${month}-${year} ${displayHours}:${minutes} ${ampm}`;
  }
  
  return `${day}-${month}-${year}`;
};

// Get file icon based on extension
const getFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'js':
    case 'ts':
    case 'tsx':
    case 'jsx':
      return '📄';
    case 'html':
      return '📄';
    case 'css':
      return '📄';
    case 'json':
      return '📄';
    case 'md':
      return '📄';
    case 'txt':
      return '📄';
    case 'pdf':
      return '📄';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return '🖼️';
    case 'mp4':
    case 'mov':
    case 'avi':
      return '🎬';
    case 'mp3':
    case 'wav':
      return '🎵';
    case 'zip':
    case 'rar':
    case '7z':
      return '📦';
    case 'gitignore':
      return '📄';
    default:
      return '📄';
  }
};

// Get file type description based on extension
const getFileType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'js':
      return 'JavaScript File';
    case 'ts':
      return 'TypeScript File';
    case 'tsx':
      return 'TypeScript React File';
    case 'jsx':
      return 'JavaScript React File';
    case 'html':
      return 'HTML Document';
    case 'css':
      return 'CSS File';
    case 'json':
      return 'JSON Source File';
    case 'md':
      return 'Markdown Source File';
    case 'txt':
      return 'Text File';
    case 'pdf':
      return 'PDF Document';
    case 'jpg':
    case 'jpeg':
      return 'JPEG Image';
    case 'png':
      return 'PNG Image';
    case 'gif':
      return 'GIF Image';
    case 'svg':
      return 'SVG Image';
    case 'mp4':
      return 'MP4 Video';
    case 'mp3':
      return 'MP3 Audio';
    case 'mjs':
      return 'MJS File';
    case 'gitignore':
      return 'gitignore File';
    default:
      return extension ? `${extension.toUpperCase()} File` : 'File';
  }
};

interface FolderStructure {
  name: string;
  path: string;
  type: 'folder' | 'file';
  size?: number;
  modified?: Date;
  children?: FolderStructure[];
}

interface FolderViewerProps {
  folderStructure: FolderStructure[];
  folderName: string;
  onClose: () => void;
}

export function FolderViewer({ folderStructure, folderName, onClose }: FolderViewerProps) {
  // Auto-expand all folders to show complete structure
  const getAllFolderPaths = (items: FolderStructure[], paths: string[] = []): string[] => {
    items.forEach(item => {
      if (item.type === 'folder') {
        paths.push(item.path);
        if (item.children) {
          getAllFolderPaths(item.children, paths);
        }
      }
    });
    return paths;
  };

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Auto-expand all folders when folderStructure changes
  useEffect(() => {
    const allFolderPaths = getAllFolderPaths(folderStructure);
    setExpandedFolders(new Set(allFolderPaths));
  }, [folderStructure]);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const expandAllFolders = () => {
    const allFolderPaths = getAllFolderPaths(folderStructure);
    setExpandedFolders(new Set(allFolderPaths));
  };

  const collapseAllFolders = () => {
    setExpandedFolders(new Set());
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconClass = "h-5 w-5";
    
    switch (extension) {
      case 'pdf':
        return <LuFile className={`${iconClass} text-red-500`} />;
      case 'doc':
      case 'docx':
        return <LuFile className={`${iconClass} text-blue-500`} />;
      case 'xls':
      case 'xlsx':
        return <LuFile className={`${iconClass} text-green-500`} />;
      case 'ppt':
      case 'pptx':
        return <LuFile className={`${iconClass} text-orange-500`} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <LuFile className={`${iconClass} text-purple-500`} />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <LuFile className={`${iconClass} text-pink-500`} />;
      case 'mp3':
      case 'wav':
      case 'flac':
        return <LuFile className={`${iconClass} text-indigo-500`} />;
      case 'zip':
      case 'rar':
      case '7z':
        return <LuFile className={`${iconClass} text-yellow-500`} />;
      case 'txt':
      case 'md':
        return <LuFile className={`${iconClass} text-gray-500`} />;
      default:
        return <LuFile className={`${iconClass} text-muted-foreground`} />;
    }
  };

  const renderGridItem = (item: FolderStructure) => (
    <div
      key={item.path}
      className="group p-2 rounded border border-border/30 hover:border-primary/30 hover:bg-accent/30 transition-all duration-150 cursor-pointer"
    >
      <div className="flex items-center space-x-2">
        <div className="flex-shrink-0">
          {item.type === 'folder' ? (
            <LuFolderOpen className="h-4 w-4 text-blue-500" />
          ) : (
            getFileIcon(item.name)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium truncate" title={item.name}>
              {item.name}
            </span>
            {item.type === 'folder' && item.children && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {item.children.length}
              </span>
            )}
          </div>
          {item.type === 'file' && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {item.size && <span>{formatFileSize(item.size)}</span>}
              {item.modified && <span>• {formatDate(item.modified)}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Old Windows Explorer style (kept for compatibility)
  const renderListItem = (item: FolderStructure, depth: number = 0) => {
    const isExpanded = expandedFolders.has(item.path);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.path} className="select-none">
        <div
          className={`flex items-center py-0.5 hover:bg-zinc-800 cursor-pointer transition-colors group ${
            depth > 0 ? '' : ''
          } ${item.type === 'folder' ? 'font-medium' : ''}`}
          style={{ paddingLeft: `${depth * 20 + 4}px` }}
          onClick={() => item.type === 'folder' && toggleFolder(item.path)}
        >
          {/* Folder/File Icon with Expand/Collapse Control */}
          <div className="flex items-center space-x-1 w-6">
            {item.type === 'folder' && hasChildren ? (
              isExpanded ? (
                <span className="text-xs">▼</span>
              ) : (
                <span className="text-xs">▶</span>
              )
            ) : (
              <span className="w-3" />
            )}
            {item.type === 'folder' ? (
              <span className="text-yellow-500">📁</span>
            ) : (
              <span className="text-zinc-300">
                {getFileIcon(item.name)}
              </span>
            )}
          </div>
          
          {/* Name */}
          <div className="flex-1 text-xs min-w-[200px]">
            <span className={`${item.type === 'folder' ? 'font-medium' : ''} truncate max-w-[300px]`}>
              {item.name}
            </span>
          </div>
          
          {/* Date modified */}
          <div className="w-48 text-xs text-muted-foreground whitespace-nowrap">
            {item.modified ? formatDate(item.modified, true) : ''}
          </div>
          
          {/* Type */}
          <div className="w-48 text-xs text-muted-foreground whitespace-nowrap">
            {item.type === 'folder' ? 'File folder' : getFileType(item.name)}
          </div>
          
          {/* Size - Right aligned */}
          <div className="w-24 text-right text-xs text-muted-foreground font-mono whitespace-nowrap">
            {item.type === 'file' && item.size ? formatFileSize(item.size) : ''}
          </div>
        </div>
        
        {/* Nested Children */}
        {item.type === 'folder' && isExpanded && hasChildren && (
          <div>
            {item.children?.map(child => renderListItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Modern stylized list item renderer
  const renderModernListItem = (item: FolderStructure, depth: number = 0) => {
    const isExpanded = expandedFolders.has(item.path);
    const hasChildren = item.children && item.children.length > 0;
    
    // Get file extension for files
    const getFileExtension = (fileName: string) => {
      const parts = fileName.split('.');
      return parts.length > 1 ? parts.pop()?.toLowerCase() : '';
    };

    // Get modern file icon with colors
    const getModernFileIcon = (fileName: string) => {
      const extension = getFileExtension(fileName);
      
      switch (extension) {
        case 'js':
        case 'jsx':
          return <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">JS</div>;
        case 'ts':
        case 'tsx':
          return <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">TS</div>;
        case 'html':
          return <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">HTML</div>;
        case 'css':
          return <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">CSS</div>;
        case 'json':
          return <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">JSON</div>;
        case 'md':
          return <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">MD</div>;
        case 'txt':
          return <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">TXT</div>;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'svg':
          return <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">IMG</div>;
        case 'pdf':
          return <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">PDF</div>;
        case 'zip':
        case 'rar':
        case '7z':
          return <div className="w-8 h-8 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">ZIP</div>;
        default:
          return <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-700 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">FILE</div>;
      }
    };

    const getFolderIcon = () => {
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
          <LuFolderOpen className="w-4 h-4 text-white" />
        </div>
      );
    };

    return (
      <div key={item.path} className="select-none">
        <div
          className={`flex items-center p-2 rounded-lg transition-all duration-200 group cursor-pointer
            ${item.type === 'folder' 
              ? 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20' 
              : 'hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-800/30 dark:hover:to-slate-700/30'
            }
            border border-transparent hover:border-slate-200 dark:hover:border-slate-700
            hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50
          `}
          style={{ paddingLeft: `${depth * 16 + 4}px` }}
          onClick={() => item.type === 'folder' && toggleFolder(item.path)}
        >
          {/* Expand/Collapse Indicator */}
          <div className="flex items-center justify-center w-4 h-4 mr-2">
            {item.type === 'folder' && hasChildren && (
              <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                <LuChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              </div>
            )}
          </div>

          {/* File/Folder Icon - Smaller */}
          <div className="mr-3">
            {item.type === 'folder' ? (
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <LuFolderOpen className="w-3 h-3 text-white" />
              </div>
            ) : (
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-sm text-white text-xs font-bold ${
                getFileExtension(item.name) === 'js' || getFileExtension(item.name) === 'jsx' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                getFileExtension(item.name) === 'ts' || getFileExtension(item.name) === 'tsx' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                getFileExtension(item.name) === 'html' ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                getFileExtension(item.name) === 'css' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                getFileExtension(item.name) === 'json' ? 'bg-gradient-to-br from-green-500 to-green-700' :
                getFileExtension(item.name) === 'md' ? 'bg-gradient-to-br from-gray-600 to-gray-800' :
                getFileExtension(item.name) === 'txt' ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                getFileExtension(item.name) === 'ico' ? 'bg-gradient-to-br from-slate-500 to-slate-700' :
                ['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(getFileExtension(item.name) || '') ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                'bg-gradient-to-br from-slate-500 to-slate-700'
              }`}>
                {getFileExtension(item.name) === 'js' || getFileExtension(item.name) === 'jsx' ? 'JS' :
                 getFileExtension(item.name) === 'ts' || getFileExtension(item.name) === 'tsx' ? 'TS' :
                 getFileExtension(item.name) === 'html' ? 'H' :
                 getFileExtension(item.name) === 'css' ? 'C' :
                 getFileExtension(item.name) === 'json' ? 'J' :
                 getFileExtension(item.name) === 'md' ? 'M' :
                 getFileExtension(item.name) === 'txt' ? 'T' :
                 getFileExtension(item.name) === 'ico' ? 'I' :
                 ['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(getFileExtension(item.name) || '') ? 'IMG' :
                 'F'}
              </div>
            )}
          </div>
          
          {/* Name with Extension - Smaller Font */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-medium truncate ${
                item.type === 'folder' 
                  ? 'text-slate-700 dark:text-slate-200' 
                  : 'text-slate-600 dark:text-slate-300'
              }`}>
                {item.type === 'file' ? item.name.split('.').slice(0, -1).join('.') || item.name : item.name}
              </span>
              {item.type === 'file' && getFileExtension(item.name) && (
                <span className="px-1.5 py-0.5 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                  .{getFileExtension(item.name)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Nested Children */}
        {item.type === 'folder' && isExpanded && hasChildren && (
          <div className="ml-1">
            {item.children?.map(child => renderModernListItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const getTotalStats = () => {
    let totalFiles = 0;
    let totalFolders = 0;
    let totalSize = 0;

    const countItems = (items: FolderStructure[]) => {
      items.forEach(item => {
        if (item.type === 'file') {
          totalFiles++;
          totalSize += item.size || 0;
        } else {
          totalFolders++;
          if (item.children) {
            countItems(item.children);
          }
        }
      });
    };

    countItems(folderStructure);
    return { totalFiles, totalFolders, totalSize };
  };

  const stats = getTotalStats();

  const filteredAndSortedItems = () => {
    let items = [...folderStructure];
    
    // Filter by search query
    if (searchQuery) {
      const filterItems = (items: FolderStructure[]): FolderStructure[] => {
        return items.filter(item => {
          const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
          if (item.type === 'folder' && item.children) {
            const filteredChildren = filterItems(item.children);
            return matchesSearch || filteredChildren.length > 0;
          }
          return matchesSearch;
        }).map(item => ({
          ...item,
          children: item.type === 'folder' && item.children ? filterItems(item.children) : item.children
        }));
      };
      items = filterItems(items);
    }
    
    // Sort items
    const sortItems = (items: FolderStructure[]): FolderStructure[] => {
      return items.sort((a, b) => {
        let comparison = 0;
        
        if (sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortBy === 'size') {
          const aSize = a.type === 'file' ? (a.size || 0) : 0;
          const bSize = b.type === 'file' ? (b.size || 0) : 0;
          comparison = aSize - bSize;
        } else if (sortBy === 'date') {
          const aDate = a.type === 'file' ? (a.modified?.getTime() || 0) : 0;
          const bDate = b.type === 'file' ? (b.modified?.getTime() || 0) : 0;
          comparison = aDate - bDate;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      }).map(item => ({
        ...item,
        children: item.type === 'folder' && item.children ? sortItems(item.children) : item.children
      }));
    };
    
    return sortItems(items);
  };

  return (
    <div className="space-y-6">
      {/* Modern Header - Compact */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <LuFolderOpen className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-xs font-bold">{stats.totalFiles}</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                {folderName}
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-xs font-medium">{stats.totalFiles} files</span>
                </div>
                <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-400">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                  <span className="text-xs font-medium">{stats.totalFolders} folders</span>
                </div>
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex items-center gap-2 px-4 py-2 rounded-xl border-slate-300 dark:border-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-600 dark:hover:text-red-400 transition-all duration-200 shadow-md"
          >
            <LuX className="h-3 w-3" />
            <span className="text-xs font-medium">Close</span>
          </Button>
        </div>
      </div>

      {/* Modern Search and Controls - Compact */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Modern Search - Compact */}
          <div className="relative flex-1 max-w-sm">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <LuSearch className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-xs text-slate-700 dark:text-slate-300 placeholder-slate-400"
            />
          </div>

          {/* Modern Controls - Compact */}
          <div className="flex items-center gap-2">
            {/* Expand/Collapse All */}
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={expandAllFolders}
                className="px-3 py-1.5 rounded-lg border-slate-300 dark:border-slate-600 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-900/20 text-xs font-medium"
                title="Expand All Folders"
              >
                Expand All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={collapseAllFolders}
                className="px-3 py-1.5 rounded-lg border-slate-300 dark:border-slate-600 hover:bg-slate-50 hover:border-slate-400 dark:hover:bg-slate-800 text-xs font-medium"
                title="Collapse All Folders"
              >
                Collapse All
              </Button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'size' | 'date')}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
              <option value="date">Sort by Date</option>
            </select>

            {/* Sort Order */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-8 h-8 rounded-lg border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Modern File Explorer */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-0">
          {filteredAndSortedItems().length > 0 ? (
            <div className="max-h-[500px] overflow-y-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              {/* Modern File List - Compact */}
              <div className="p-3 space-y-0.5">
                {filteredAndSortedItems().map(item => renderModernListItem(item))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                <LuFolderOpen className="h-10 w-10 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-700 dark:text-slate-300">
                {searchQuery ? 'No matching items found' : 'No files or folders found'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {searchQuery ? 'Try adjusting your search terms' : 'This folder appears to be empty'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modern Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700/30 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalFiles}</p>
              <p className="text-sm font-medium text-blue-600/70 dark:text-blue-400/70 mt-1">Total Files</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <LuFile className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-700/30 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.totalFolders}</p>
              <p className="text-sm font-medium text-indigo-600/70 dark:text-indigo-400/70 mt-1">Total Folders</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <LuFolderOpen className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700/30 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{formatFileSize(stats.totalSize)}</p>
              <p className="text-sm font-medium text-purple-600/70 dark:text-purple-400/70 mt-1">Total Size</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <LuHardDrive className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
