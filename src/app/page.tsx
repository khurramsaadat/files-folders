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
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl ${
            isDragOver
              ? 'border-red-600 bg-gradient-to-br from-rose-50 to-pink-50 dark:bg-gradient-to-br dark:from-red-900/20 dark:to-rose-900/20 shadow-xl scale-105'
              : 'border-rose-300 dark:border-rose-600 hover:border-red-600 hover:bg-gradient-to-br hover:from-rose-100 hover:to-orange-100 dark:hover:from-red-800/40 dark:hover:to-rose-700/40 shadow-lg hover:shadow-red-500/20'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleOpenFolder}
        >
          <div className="space-y-6 transition-all duration-300">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl hover:from-red-500 hover:to-red-700">
              <LuFolderOpen className="w-10 h-10 text-white transition-all duration-300 hover:scale-110" />
      </div>

            <div className="space-y-3 transition-all duration-300">
              <h3 className="text-2xl font-semibold bg-gradient-to-r from-red-700 to-red-900 dark:from-rose-200 dark:to-orange-200 bg-clip-text text-transparent transition-all duration-300 hover:from-red-600 hover:to-red-800">
                {isDragOver ? 'Drop your files here' : 'Drag & drop files or folders'}
              </h3>
              <p className="text-base text-red-600 dark:text-rose-400 transition-all duration-300 hover:text-red-700 dark:hover:text-rose-300">
                {isDragOver ? 'Release to upload' : 'or click anywhere to browse'}
              </p>
      </div>

            <div className="inline-flex items-center gap-3 bg-white/20 dark:bg-black/20 rounded-lg px-6 py-3 border border-white/30 dark:border-white/10 transition-all duration-300 hover:bg-white/40 dark:hover:bg-black/40 hover:border-red-400/50 hover:shadow-lg transform hover:scale-105">
              <LuFolderOpen className="h-5 w-5 text-red-700 dark:text-rose-300 transition-all duration-300 hover:text-red-600 dark:hover:text-rose-200 hover:scale-110" />
              <span className="text-sm font-medium text-red-700 dark:text-rose-300 transition-all duration-300 hover:text-red-600 dark:hover:text-rose-200">
                Browse Files / Folders
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo File Structure Preview */}
      <div className="max-w-4xl mx-auto mt-16">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-red-700 to-red-900 dark:from-rose-200 dark:to-orange-200 bg-clip-text text-transparent mb-3">
            See Your Files Organized
          </h3>
          <p className="text-base text-red-600 dark:text-rose-400 max-w-2xl mx-auto">
            Transform messy folder structures into beautiful, organized reports that you can easily share with clients and team members.
          </p>
        </div>

        {/* Demo File Structure */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <LuFolderOpen className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold">File Structure</h4>
            </div>
          </div>

          {/* File List */}
          <div className="p-6 space-y-2">
            {/* Root Folder */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-rose-50 to-pink-50 dark:from-red-900/20 dark:to-rose-900/20">
              <div className="w-6 h-6 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                <LuFolderOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-sm text-red-800 dark:text-rose-300">CREATIVE VIDEO PROJECT Q4 2025</span>
              <span className="ml-auto text-xs text-red-600 dark:text-rose-400">25 items</span>
            </div>

            {/* Nested Folders - First Level */}
            <div className="ml-8 space-y-2">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-red-900/10">
                <div className="w-5 h-5 bg-gradient-to-br from-red-600 to-red-800 rounded flex items-center justify-center">
                  <LuFolderOpen className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-medium text-red-700 dark:text-rose-400">CA</span>
                <span className="ml-auto text-xs text-red-500 dark:text-rose-500">12 items</span>
              </div>

              {/* Nested Folders - Second Level */}
              <div className="ml-8 space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-red-900/10">
                  <div className="w-5 h-5 bg-gradient-to-br from-red-600 to-red-800 rounded flex items-center justify-center">
                    <LuFolderOpen className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-red-700 dark:text-rose-400">AIRPODS</span>
                  <span className="ml-auto text-xs text-red-500 dark:text-rose-500">3 items</span>
                </div>

                {/* Sample Files - Third Level */}
                <div className="ml-8 space-y-1">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-red-800/10">
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-700 to-amber-900 rounded flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">MP4</span>
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">CA_DM801_PART_1_AIRPODS_PRO_3.mp4</span>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-red-800/10">
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-700 to-amber-900 rounded flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">MP4</span>
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">CA_DM801_PART_2_AIRPODS_PRO_3.mp4</span>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-red-800/10">
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-700 to-amber-900 rounded flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">MP4</span>
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">CA_DM801_PART_4_AIRPODS_PRO_3.mp4</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-red-900/10">
                  <div className="w-5 h-5 bg-gradient-to-br from-red-600 to-red-800 rounded flex items-center justify-center">
                    <LuFolderOpen className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-red-700 dark:text-rose-400">IPHONES</span>
                  <span className="ml-auto text-xs text-red-500 dark:text-rose-500">2 items</span>
                </div>

                {/* Sample Files for IPHONES - Third Level */}
                <div className="ml-8 space-y-1">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-red-800/10">
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-700 to-amber-900 rounded flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">MP4</span>
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">CA_DM801_PART_1_IPHONE_17_AIR.mp4</span>
                  </div>

                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-red-800/10">
                    <div className="w-5 h-5 bg-gradient-to-br from-amber-700 to-amber-900 rounded flex items-center justify-center">
                      <span className="text-white text-[8px] font-bold">MP4</span>
                    </div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">CA_DM801_PART_1_IPHONE_17_PRO_MAX.mp4</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-6 p-4 bg-gradient-to-r from-rose-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-xl border border-rose-200 dark:border-rose-700">
              <div className="text-center">
                <p className="text-sm font-medium text-red-700 dark:text-rose-300 mb-3">
                  🎯 This is what your messy folders will look like - organized, clean, and professional!
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-red-600 dark:text-rose-400">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Auto-organized structure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Beautiful file icons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>Professional PDF reports</span>
                  </div>
                </div>
              </div>
            </div>
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
