'use client';

import { Button } from '@/components/ui/button';
import { LuFolderOpen } from 'react-icons/lu';
import { useEffect, useState } from 'react';
import { FolderViewer } from '@/components/ui/folder-viewer';

interface FolderStructure {
  name: string;
  path: string;
  type: 'folder' | 'file';
  size?: number;
  modified?: Date;
  children?: FolderStructure[];
}

// File System Access API types
interface FileSystemEntry {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath: string;
  file?: (callback: (file: File) => void) => void;
  createReader?: () => FileSystemDirectoryReader;
}

interface FileSystemDirectoryReader {
  readEntries: (callback: (entries: FileSystemEntry[]) => void) => void;
}

function DashboardContent() {
  const [selectedFolderStructure, setSelectedFolderStructure] = useState<FolderStructure[] | null>(null);
  const [selectedFolderName, setSelectedFolderName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Initialize with mock data
  useEffect(() => {
    // This would normally be done in the context provider
    // For now, we'll use the mock data directly
    
    // Demo data removed - using real folder selection instead
  }, []);


  const buildFolderStructure = (files: File[]): FolderStructure[] => {
    const fileMap = new Map<string, FolderStructure>();
    
    // First pass: create all files and folders
    files.forEach(file => {
      const pathParts = file.webkitRelativePath.split('/');
      
      // Create all parent folders
      for (let i = 1; i <= pathParts.length - 1; i++) {
        const folderPath = pathParts.slice(0, i).join('/');
        const folderName = pathParts[i - 1];
        
        if (!fileMap.has(folderPath)) {
          fileMap.set(folderPath, {
            name: folderName,
            path: folderPath,
            type: 'folder',
            children: []
          });
        }
      }
      
      // Add the file
      const filePath = file.webkitRelativePath;
      const fileName = pathParts[pathParts.length - 1];
      
      fileMap.set(filePath, {
        name: fileName,
        path: filePath,
        type: 'file',
        size: file.size,
        modified: new Date(file.lastModified)
      });
    });
    
    // Second pass: build the hierarchy
    const allItems = Array.from(fileMap.values());
    
    allItems.forEach(item => {
      if (item.type === 'folder') {
        const children = allItems.filter(child => {
          const childParentPath = child.path.substring(0, child.path.lastIndexOf('/'));
          return childParentPath === item.path;
        });
        item.children = children;
      }
    });
    
    // Return root level items
    return allItems.filter(item => !item.path.includes('/') || item.path.split('/').length === 1);
  };


  const handleOpenFolder = () => {
    // Create a new input element each time to avoid upload dialogs
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    input.style.display = 'none';
    
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) return;

      // Get the folder name from the first file
      const firstFile = files[0];
      const folderName = firstFile.webkitRelativePath.split('/')[0];
      
      // Build folder structure from files - NO UPLOAD, just display
      const structure = buildFolderStructure(files);
      setSelectedFolderStructure(structure);
      setSelectedFolderName(folderName);
      
      // Clean up
      document.body.removeChild(input);
    };
    
    input.oncancel = () => {
      // Clean up if user cancels
      document.body.removeChild(input);
    };
    
    // Add to DOM and trigger
    document.body.appendChild(input);
    input.click();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const items = Array.from(e.dataTransfer.items);
    const files: File[] = [];

    // Process dropped items
    const processItems = async () => {
      for (const item of items) {
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            await processEntry(entry, files);
          }
        }
      }

      if (files.length === 0) return;

      // Get the folder name from the first file or use a default
      let folderName = 'Dropped Files';
      if (files[0].webkitRelativePath) {
        folderName = files[0].webkitRelativePath.split('/')[0];
      } else if (files.length === 1) {
        folderName = files[0].name.split('.')[0];
      }

      // Build folder structure from files
      const structure = buildFolderStructure(files);
      setSelectedFolderStructure(structure);
      setSelectedFolderName(folderName);
    };

    processItems();
  };

  // Helper function to recursively process directory entries
  const processEntry = async (entry: FileSystemEntry, files: File[]): Promise<void> => {
    if (entry.isFile && entry.file) {
      const file = await new Promise<File>((resolve) => {
        entry.file!((file: File) => {
          // Create a new File object with the full path
          const newFile = new File([file], file.name, {
            type: file.type,
            lastModified: file.lastModified,
          });
          // Add webkitRelativePath property
          Object.defineProperty(newFile, 'webkitRelativePath', {
            value: entry.fullPath.substring(1), // Remove leading slash
            writable: false
          });
          resolve(newFile);
        });
      });
      files.push(file);
    } else if (entry.isDirectory && entry.createReader) {
      const reader = entry.createReader();
      const entries = await new Promise<FileSystemEntry[]>((resolve) => {
        reader.readEntries((entries: FileSystemEntry[]) => resolve(entries));
      });
      
      for (const childEntry of entries) {
        await processEntry(childEntry, files);
      }
    }
  };

  const handleCloseFolder = () => {
    setSelectedFolderStructure(null);
    setSelectedFolderName('');
  };

  // If a folder is selected, show the folder viewer
  if (selectedFolderStructure) {
  return (
      <div className="space-y-6">
        <FolderViewer 
          folderStructure={selectedFolderStructure}
          folderName={selectedFolderName}
          onClose={handleCloseFolder}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-red-900 dark:from-rose-200 dark:to-orange-200 bg-clip-text text-transparent">
          Welcome to Files & Folders
        </h1>
        <p className="text-lg text-red-600 dark:text-rose-400 max-w-2xl mx-auto">
          Organize, explore, and share your project files with beautiful visual reports
        </p>
      </div>


      {/* Drag and Drop Area - Wider with Warm Theme */}
      <div className="max-w-4xl mx-auto">
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
            isDragOver
              ? 'border-red-600 bg-gradient-to-br from-rose-50 to-pink-50 dark:bg-gradient-to-br dark:from-red-900/20 dark:to-rose-900/20'
              : 'border-rose-300 dark:border-rose-600 hover:border-red-500 hover:bg-gradient-to-br hover:from-rose-50 hover:to-orange-50 dark:hover:from-red-800/30 dark:hover:to-rose-700/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg">
              <LuFolderOpen className="w-10 h-10 text-white" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold bg-gradient-to-r from-red-700 to-red-900 dark:from-rose-200 dark:to-orange-200 bg-clip-text text-transparent">
                {isDragOver ? 'Drop your files here' : 'Drag & drop files or folders'}
              </h3>
              <p className="text-base text-red-600 dark:text-rose-400">
                {isDragOver ? 'Release to upload' : 'or click the button below to browse'}
              </p>
            </div>

            <Button 
              size="lg"
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200" 
              onClick={handleOpenFolder}
            >
              <LuFolderOpen className="mr-3 h-6 w-6" />
              Browse Files / Folders
            </Button>
          </div>
        </div>
      </div>

      {/* Supported File Types */}
      <div className="max-w-4xl mx-auto mt-12">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-red-700 to-red-900 dark:from-rose-200 dark:to-orange-200 bg-clip-text text-transparent mb-2">
            Supported File Types
          </h3>
          <p className="text-sm text-red-600 dark:text-rose-400">
            Organize and manage all your project files with beautiful icons
          </p>
        </div>
        
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4 p-6 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 rounded-xl border border-rose-200 dark:border-rose-800">
          {/* PNG */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-[8px] font-bold">PNG</span>
            </div>
            <span className="text-xs text-orange-700 dark:text-orange-400 font-medium">PNG</span>
          </div>

          {/* JPG */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-[8px] font-bold">JPG</span>
            </div>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">JPG</span>
          </div>

          {/* SVG */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-pink-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-[8px] font-bold">SVG</span>
            </div>
            <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">SVG</span>
          </div>

          {/* GIF */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-[8px] font-bold">GIF</span>
            </div>
            <span className="text-xs text-pink-700 dark:text-pink-400 font-medium">GIF</span>
          </div>

          {/* MP4 */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-[8px] font-bold">MP4</span>
            </div>
            <span className="text-xs text-amber-800 dark:text-amber-400 font-medium">MP4</span>
          </div>

          {/* MOV */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-[8px] font-bold">MOV</span>
            </div>
            <span className="text-xs text-orange-700 dark:text-orange-400 font-medium">MOV</span>
          </div>

          {/* AVI */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-[8px] font-bold">AVI</span>
            </div>
            <span className="text-xs text-red-700 dark:text-red-400 font-medium">AVI</span>
          </div>

          {/* MKV */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-pink-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-[8px] font-bold">MKV</span>
            </div>
            <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">MKV</span>
          </div>

          {/* JavaScript */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">JS</span>
            </div>
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">JavaScript</span>
          </div>

          {/* TypeScript */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">TS</span>
            </div>
            <span className="text-xs text-red-700 dark:text-red-400 font-medium">TypeScript</span>
          </div>

          {/* HTML */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">H</span>
            </div>
            <span className="text-xs text-orange-700 dark:text-orange-400 font-medium">HTML</span>
          </div>

          {/* CSS */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="text-xs text-pink-700 dark:text-pink-400 font-medium">CSS</span>
          </div>

          {/* JSON */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-orange-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">J</span>
            </div>
            <span className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">JSON</span>
          </div>

          {/* Markdown */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="text-xs text-red-700 dark:text-red-400 font-medium">Markdown</span>
          </div>

          {/* Text */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">Text</span>
          </div>

          {/* Icons */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">I</span>
            </div>
            <span className="text-xs text-orange-700 dark:text-orange-400 font-medium">Icons</span>
          </div>

          {/* Folders */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-md">
              <LuFolderOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-red-700 dark:text-red-400 font-medium">Folders</span>
          </div>

          {/* More Files */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-xs font-bold">+</span>
            </div>
            <span className="text-xs text-red-700 dark:text-red-400 font-medium">More</span>
          </div>
        </div>
      </div>
      
      {/* Dynamic folder input created on demand - no upload dialogs */}
    </div>
  );
}

export default function Home() {
  return <DashboardContent />;
}
