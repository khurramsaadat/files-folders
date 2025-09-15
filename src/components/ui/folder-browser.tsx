'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { LuFolderOpen, LuFile, LuChevronRight, LuChevronDown, LuRefreshCw, LuX } from 'react-icons/lu';
import { formatFileSize, formatDate } from '@/lib/fileUtils';

interface FolderBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onFolderSelected: (folderStructure: FolderStructure[]) => void;
}

interface FolderStructure {
  name: string;
  path: string;
  type: 'folder' | 'file';
  size?: number;
  modified?: Date;
  children?: FolderStructure[];
}

export function FolderBrowser({ isOpen, onClose, onFolderSelected }: FolderBrowserProps) {
  const [selectedFolder, setSelectedFolder] = useState<FolderStructure | null>(null);
  const [folderStructure, setFolderStructure] = useState<FolderStructure[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Get the folder path from the first file
    const firstFile = files[0];
    const folderPath = firstFile.webkitRelativePath.split('/')[0];
    
    // Build folder structure from files
    const structure = buildFolderStructure(files, folderPath);
    setFolderStructure(structure);
    setSelectedFolder({ name: folderPath, path: folderPath, type: 'folder', children: structure });
  };

  const buildFolderStructure = (files: File[], rootPath: string): FolderStructure[] => {
    const structure: { [key: string]: FolderStructure } = {};

    files.forEach(file => {
      const pathParts = file.webkitRelativePath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const folderPath = pathParts.slice(0, -1).join('/');
      
      // Create folder structure
      let currentPath = '';
      let currentStructure = structure;
      
      pathParts.slice(0, -1).forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!currentStructure[part]) {
          currentStructure[part] = {
            name: part,
            path: currentPath,
            type: 'folder',
            children: []
          };
        }
        
        if (!currentStructure[part].children) {
          currentStructure[part].children = [];
        }
        
        currentStructure = currentStructure[part].children as any;
      });
      
      // Add file
      const fileStructure: FolderStructure = {
        name: fileName,
        path: file.webkitRelativePath,
        type: 'file',
        size: file.size,
        modified: new Date(file.lastModified)
      };
      
      if (folderPath === '') {
        // File is in root
        structure[fileName] = fileStructure;
      } else {
        // File is in a subfolder
        let currentPath = '';
        let currentStructure = structure;
        
        pathParts.slice(0, -1).forEach((part, index) => {
          currentPath = currentPath ? `${currentPath}/${part}` : part;
          
          if (!currentStructure[part]) {
            currentStructure[part] = {
              name: part,
              path: currentPath,
              type: 'folder',
              children: []
            };
          }
          
          if (!currentStructure[part].children) {
            currentStructure[part].children = [];
          }
          
          currentStructure = currentStructure[part].children as any;
        });
        
        currentStructure[fileName] = fileStructure;
      }
    });

    return Object.values(structure);
  };

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
          className={`flex items-center space-x-2 py-1 px-2 rounded hover:bg-muted cursor-pointer ${
            depth > 0 ? `ml-${depth * 4}` : ''
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => item.type === 'folder' && toggleFolder(item.path)}
        >
          {item.type === 'folder' ? (
            <>
              {hasChildren ? (
                isExpanded ? (
                  <LuChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <LuChevronRight className="h-4 w-4 text-muted-foreground" />
                )
              ) : (
                <div className="w-4 h-4" />
              )}
              <LuFolderOpen className="h-4 w-4 text-blue-500" />
            </>
          ) : (
            <>
              <div className="w-4 h-4" />
              <LuFile className="h-4 w-4 text-muted-foreground" />
            </>
          )}
          
          <span className="text-sm font-medium">{item.name}</span>
          
          {item.type === 'file' && item.size && (
            <span className="text-xs text-muted-foreground ml-auto">
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

  const openFolderInDashboard = () => {
    if (folderStructure.length > 0) {
      onFolderSelected(folderStructure);
      onClose();
    }
  };

  const resetSelection = () => {
    setSelectedFolder(null);
    setFolderStructure([]);
    setExpandedFolders(new Set());
    if (folderInputRef.current) {
      folderInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LuFolderOpen className="h-5 w-5" />
            Open Folder
          </CardTitle>
          <CardDescription>
            Select a folder from your computer to view its contents in the dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Folder Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => folderInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <LuFolderOpen className="h-4 w-4" />
                Select Folder
              </Button>
              
              {selectedFolder && (
                <Button
                  variant="outline"
                  onClick={resetSelection}
                  className="flex items-center gap-2"
                >
                  <LuRefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
            
            <input
              ref={folderInputRef}
              type="file"
              {...({ webkitdirectory: "" } as any)}
              {...({ directory: "" } as any)}
              multiple
              onChange={handleFolderSelect}
              className="hidden"
            />
            
            {selectedFolder && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Selected Folder: {selectedFolder.name}</p>
                <p className="text-xs text-muted-foreground">
                  {folderStructure.length} items found
                </p>
              </div>
            )}
          </div>

          {/* Folder Structure */}
          {folderStructure.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Folder Contents</h4>
              <div className="border border-border rounded-lg p-4 max-h-96 overflow-y-auto">
                {folderStructure.map(item => renderFolderItem(item))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={openFolderInDashboard} 
              disabled={!selectedFolder}
              className="min-w-[120px]"
            >
              <div className="flex items-center gap-2">
                <LuFolderOpen className="h-4 w-4" />
                Open in Dashboard
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
