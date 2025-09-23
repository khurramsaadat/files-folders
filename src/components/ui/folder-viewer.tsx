'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from './button';
import { LuFolderOpen, LuFile, LuChevronRight, LuArrowLeft, LuSearch, LuHardDrive, LuFileText } from 'react-icons/lu';
import { formatFileSize } from '@/lib/fileUtils';
import { PDFExportDialog } from './pdf-export-dialog';




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
  const getAllFolderPaths = useCallback((items: FolderStructure[], paths: string[] = []): string[] => {
    items.forEach(item => {
      if (item.type === 'folder') {
        paths.push(item.path);
        if (item.children) {
          getAllFolderPaths(item.children, paths);
        }
      }
    });
    return paths;
  }, []);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showPDFDialog, setShowPDFDialog] = useState(false);

  // Auto-expand all folders when folderStructure changes
  useEffect(() => {
    const allFolderPaths = getAllFolderPaths(folderStructure);
    setExpandedFolders(new Set(allFolderPaths));
  }, [folderStructure, getAllFolderPaths]);

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

  const handleSharePDF = () => {
    setShowPDFDialog(true);
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


    return (
      <div key={item.path} className="select-none">
        <div
          className={`flex items-center p-2 rounded-lg transition-all duration-200 group cursor-pointer
            ${item.type === 'folder' 
              ? 'hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20' 
              : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-rose-50 dark:hover:from-red-800/30 dark:hover:to-orange-800/30'
            }
            border border-transparent hover:border-rose-200 dark:hover:border-rose-700
            hover:shadow-md hover:shadow-rose-200/50 dark:hover:shadow-red-900/50
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
              <div className="w-6 h-6 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-sm">
                <LuFolderOpen className="w-3 h-3 text-white" />
              </div>
            ) : (
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shadow-sm text-white font-bold ${
                ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm', 'm4v'].includes(getFileExtension(item.name) || '') ? 'text-[8px]' : 'text-xs'
              } ${
                getFileExtension(item.name) === 'js' || getFileExtension(item.name) === 'jsx' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                getFileExtension(item.name) === 'ts' || getFileExtension(item.name) === 'tsx' ? 'bg-gradient-to-br from-red-500 to-red-700' :
                getFileExtension(item.name) === 'html' ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                getFileExtension(item.name) === 'css' ? 'bg-gradient-to-br from-pink-500 to-rose-600' :
                getFileExtension(item.name) === 'json' ? 'bg-gradient-to-br from-yellow-600 to-orange-700' :
                getFileExtension(item.name) === 'md' ? 'bg-gradient-to-br from-red-600 to-red-800' :
                getFileExtension(item.name) === 'txt' ? 'bg-gradient-to-br from-rose-500 to-pink-600' :
                getFileExtension(item.name) === 'ico' ? 'bg-gradient-to-br from-orange-600 to-red-700' :
                ['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(getFileExtension(item.name) || '') ? 'bg-gradient-to-br from-pink-500 to-rose-600' :
                ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm', 'm4v'].includes(getFileExtension(item.name) || '') ? 'bg-gradient-to-br from-amber-700 to-amber-900' :
                'bg-gradient-to-br from-red-500 to-red-700'
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
                 ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm', 'm4v'].includes(getFileExtension(item.name) || '') ? 'MP4' :
                 'F'}
              </div>
            )}
          </div>
          
          {/* Name with Extension - Smaller Font */}
          <div className="flex-1 min-w-0">
            <span className={`text-xs font-normal truncate ${
              item.type === 'folder' 
                ? 'text-slate-700 dark:text-slate-200' 
                : 'text-slate-600 dark:text-slate-300'
            }`}>
              {item.name}
            </span>
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

  const filteredAndSortedItems = useMemo(() => {
    let items = [...folderStructure];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const filterItems = (items: FolderStructure[]): FolderStructure[] => {
        return items.reduce((filtered: FolderStructure[], item) => {
          const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
          
          if (item.type === 'folder' && item.children) {
            const filteredChildren = filterItems(item.children);
            if (matchesSearch || filteredChildren.length > 0) {
              filtered.push({
                ...item,
                children: filteredChildren
              });
            }
          } else if (matchesSearch) {
            filtered.push(item);
          }
          
          return filtered;
        }, []);
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
  }, [folderStructure, searchQuery, sortBy, sortOrder]);

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <div className="flex justify-start">
        <Button 
          variant="outline" 
          onClick={onClose} 
          className="flex items-center gap-2 px-4 py-2 rounded-xl border-slate-300 dark:border-slate-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-600 dark:hover:text-red-400 transition-all duration-200 shadow-md"
        >
          <LuArrowLeft className="h-3 w-3" />
          <span className="text-xs font-medium">Back</span>
        </Button>
      </div>

      {/* Modern Header - Extra Compact */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-orange-50 dark:from-red-800/20 dark:via-rose-800/20 dark:to-orange-800/20 rounded-xl p-4 border border-rose-200 dark:border-rose-700 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg">
                <LuFolderOpen className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-xs font-bold">{stats.totalFiles}</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-red-900 dark:from-rose-200 dark:to-orange-200 bg-clip-text text-transparent">
                {folderName}
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1 text-red-600 dark:text-rose-400">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span className="text-xs font-medium">{stats.totalFiles} files</span>
                </div>
                <div className="flex items-center space-x-1 text-red-600 dark:text-rose-400">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className="text-xs font-medium">{stats.totalFolders} folders</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSharePDF}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold shadow-xl hover:shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300 border-0"
            >
              <LuFileText className="h-5 w-5" />
              <span className="text-base font-bold">Share PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Search and Controls - Extra Compact */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
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
      <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-0">
          {filteredAndSortedItems.length > 0 ? (
            <div className="max-h-[70vh] overflow-y-auto bg-white/80 dark:bg-red-900/80 backdrop-blur-sm">
              {/* Modern File List - Compact */}
              <div className="p-3 space-y-0.5">
                {filteredAndSortedItems.map(item => renderModernListItem(item))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-red-600 dark:text-rose-400">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-rose-100 to-pink-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-2xl flex items-center justify-center">
                <LuFolderOpen className="h-10 w-10 text-red-500 dark:text-rose-400" />
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

      {/* Modern Stats - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-rose-50 to-pink-100 dark:from-red-900/20 dark:to-rose-800/20 rounded-xl p-4 border border-rose-200 dark:border-rose-700/30 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-red-600 dark:text-rose-400">{stats.totalFiles}</p>
              <p className="text-sm font-medium text-red-600/70 dark:text-rose-400/70 mt-1">Total Files</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
              <LuFile className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-800/20 rounded-xl p-4 border border-orange-200 dark:border-red-700/30 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.totalFolders}</p>
              <p className="text-sm font-medium text-orange-600/70 dark:text-orange-400/70 mt-1">Total Folders</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
              <LuFolderOpen className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-800/20 rounded-xl p-4 border border-pink-200 dark:border-rose-700/30 shadow-lg hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">{formatFileSize(stats.totalSize)}</p>
              <p className="text-sm font-medium text-pink-600/70 dark:text-pink-400/70 mt-1">Total Size</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md">
              <LuHardDrive className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* PDF Export Dialog */}
      <PDFExportDialog
        isOpen={showPDFDialog}
        onClose={() => setShowPDFDialog(false)}
        folderStructure={folderStructure}
        defaultProjectName={folderName}
      />
    </div>
  );
}
