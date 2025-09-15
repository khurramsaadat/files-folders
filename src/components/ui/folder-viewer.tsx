'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { LuFolderOpen, LuFile, LuChevronRight, LuChevronDown, LuX, LuRefreshCw } from 'react-icons/lu';
import { formatFileSize, formatDate } from '@/lib/fileUtils';

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
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

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

  const renderFolderItem = (item: FolderStructure, depth: number = 0) => {
    const isExpanded = expandedFolders.has(item.path);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.path} className="select-none">
        <div
          className={`flex items-center space-x-2 py-2 px-3 rounded hover:bg-muted cursor-pointer transition-colors ${
            depth > 0 ? `ml-${depth * 4}` : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => item.type === 'folder' && toggleFolder(item.path)}
        >
          {item.type === 'folder' ? (
            <>
              {hasChildren ? (
                isExpanded ? (
                  <LuChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <LuChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )
              ) : (
                <div className="w-4 h-4 flex-shrink-0" />
              )}
              <LuFolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
            </>
          ) : (
            <>
              <div className="w-4 h-4 flex-shrink-0" />
              <LuFile className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </>
          )}
          
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium truncate">{item.name}</span>
            {item.type === 'file' && item.modified && (
              <p className="text-xs text-muted-foreground">
                Modified: {formatDate(item.modified)}
              </p>
            )}
          </div>
          
          {item.type === 'file' && item.size && (
            <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
              {formatFileSize(item.size)}
            </span>
          )}
        </div>
        
        {item.type === 'folder' && isExpanded && hasChildren && (
          <div>
            {item.children?.map(child => renderFolderItem(child, depth + 1))}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <LuFolderOpen className="h-6 w-6 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">{folderName}</h2>
            <p className="text-sm text-muted-foreground">
              {stats.totalFiles} files, {stats.totalFolders} folders • {formatFileSize(stats.totalSize)} total size
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
          <LuX className="h-4 w-4" />
          Close
        </Button>
      </div>

      {/* Folder Contents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LuFolderOpen className="h-5 w-5" />
            Folder Contents
          </CardTitle>
          <CardDescription>
            Click on folders to expand and view their contents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {folderStructure.length > 0 ? (
              folderStructure.map(item => renderFolderItem(item))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <LuFolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No files or folders found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <LuFile className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalFiles}</p>
                <p className="text-xs text-muted-foreground">Total Files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <LuFolderOpen className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalFolders}</p>
                <p className="text-xs text-muted-foreground">Total Folders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <LuFile className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
                <p className="text-xs text-muted-foreground">Total Size</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
