'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LuFolderOpen, LuRefreshCw, LuFolderCheck, LuPlay } from 'react-icons/lu';
import { useState } from 'react';

interface FileItem {
  file: File;
  originalName: string;
  nameWithoutExt: string;
  extension: string;
  newName: string;
}

// File System Access API types
interface FileSystemDirectoryHandle {
  name: string;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
}

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
  write(data: File): Promise<void>;
  close(): Promise<void>;
}

export default function BatchRenamePage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [pattern, setPattern] = useState('$N_#');
  const [targetDirectory, setTargetDirectory] = useState<string>('');
  const [isApplying, setIsApplying] = useState(false);
  const [applyStatus, setApplyStatus] = useState<string>('');

  const processFiles = (fileList: FileList) => {
    const processedFiles: FileItem[] = [];
    
    // Don't automatically set target directory - user must select it
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const lastDotIndex = file.name.lastIndexOf('.');
      const nameWithoutExt = lastDotIndex > 0 ? file.name.substring(0, lastDotIndex) : file.name;
      const extension = lastDotIndex > 0 ? file.name.substring(lastDotIndex) : '';
      
      processedFiles.push({
        file,
        originalName: file.name,
        nameWithoutExt,
        extension,
        newName: applyPattern(pattern, nameWithoutExt, i + 1, extension)
      });
    }
    
    setFiles(processedFiles);
  };

  const applyPattern = (pattern: string, nameWithoutExt: string, number: number, extension: string): string => {
    let result = pattern;
    result = result.replace(/\$N/g, nameWithoutExt);
    result = result.replace(/#/g, number.toString());
    return result + extension;
  };

  const updateFileNames = (newPattern: string) => {
    setPattern(newPattern);
    const updatedFiles = files.map((fileItem, index) => ({
      ...fileItem,
      newName: applyPattern(newPattern, fileItem.nameWithoutExt, index + 1, fileItem.extension)
    }));
    setFiles(updatedFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const handleOpenFolder = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.webkitdirectory = false; // Allow individual file selection
    input.style.display = 'none';
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const selectedFiles = target.files;
      
      if (selectedFiles && selectedFiles.length > 0) {
        processFiles(selectedFiles);
      }
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };


  const selectTargetDirectory = async () => {
    try {
      // Use the File System Access API to select a directory
      if ('showDirectoryPicker' in window) {
        setApplyStatus('Opening directory picker...');
        const directoryHandle = await (window as unknown as { showDirectoryPicker: (options: { mode: string }) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker({
          mode: 'readwrite'
        });
        
        // For File System Access API, we can only get the directory name for security reasons
        // But we can show a more meaningful representation
        const directoryName = directoryHandle.name;
        
        // Create a more descriptive path representation
        // Note: Browser security prevents us from getting the full system path
        const displayPath = `📁 ${directoryName} (Selected Directory)`;
        
        // Set the selected directory with descriptive path
        console.log('Directory selected:', directoryName);
        setTargetDirectory(displayPath);
        setApplyStatus('');
        
        // Store the directory handle for later use
        (window as unknown as { selectedDirectoryHandle: FileSystemDirectoryHandle }).selectedDirectoryHandle = directoryHandle;
        
        return directoryHandle;
      } else {
        // Fallback: Create a hidden file input for directory selection
        const input = document.createElement('input');
        input.type = 'file';
        input.webkitdirectory = true;
        input.style.display = 'none';
        
        return new Promise((resolve) => {
          input.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            const files = target.files;
            
            if (files && files.length > 0) {
              // Get the directory path from the first file
              const firstFile = files[0];
              const fullRelativePath = firstFile.webkitRelativePath;
              const pathParts = fullRelativePath.split('/');
              const directoryName = pathParts[0]; // First part is the directory name
              
              // Try to get more meaningful path information
              const displayPath = `📁 ${directoryName} (Selected Directory)`;
              
              console.log('Directory selected (fallback):', directoryName);
              setTargetDirectory(displayPath);
              setApplyStatus(`Target directory selected: ${directoryName}`);
              
              // Store reference to the selected directory
              (window as unknown as { selectedDirectoryPath: string }).selectedDirectoryPath = directoryName;
              
              document.body.removeChild(input);
              resolve(directoryName);
            } else {
              document.body.removeChild(input);
              resolve(null);
            }
          };
          
          input.oncancel = () => {
            document.body.removeChild(input);
            resolve(null);
          };
          
          document.body.appendChild(input);
          input.click();
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Directory selection failed:', error);
        setApplyStatus('Directory selection failed. You can manually enter a directory name.');
        
        // Fallback: Allow user to type custom directory name
        const customName = prompt('Enter target directory name:', 'Rename');
        if (customName) {
          setTargetDirectory(customName);
          setApplyStatus(`Custom directory name set: ${customName}`);
        }
      } else {
        setApplyStatus('Directory selection cancelled.');
      }
      return null;
    }
  };

  const applyRenames = async () => {
    if (files.length === 0) return;
    
    setIsApplying(true);
    setApplyStatus('Starting rename process...');
    
    try {
      // Check if we have a directory handle from the File System Access API
      const directoryHandle = (window as unknown as { selectedDirectoryHandle?: FileSystemDirectoryHandle }).selectedDirectoryHandle;
      
      if (directoryHandle && 'showDirectoryPicker' in window) {
        // Use File System Access API to write files directly to selected directory
        setApplyStatus('Writing files to selected directory...');
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < files.length; i++) {
          const fileItem = files[i];
          setApplyStatus(`Writing ${fileItem.newName} to ${targetDirectory} (${i + 1}/${files.length})`);
          
          try {
            // Create the renamed file in the selected directory
            const fileHandle = await directoryHandle.getFileHandle(fileItem.newName, { 
              create: true 
            });
            const writable = await fileHandle.createWritable();
            await writable.write(fileItem.file);
            await writable.close();
            successCount++;
            
            // Small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`Failed to write ${fileItem.originalName}:`, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            setApplyStatus(`Error writing ${fileItem.originalName}: ${errorMessage}`);
            errorCount++;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        if (successCount === files.length) {
          setApplyStatus(`✅ Successfully created ${successCount} renamed files in "${targetDirectory}"!`);
        } else {
          setApplyStatus(`⚠️ Created ${successCount} files, ${errorCount} failed. Check "${targetDirectory}" directory.`);
        }
        
      } else {
        // If no directory is selected, inform user they need to select one
        if (!targetDirectory) {
          setApplyStatus('❌ Please select a target directory first using the Browse button.');
          setIsApplying(false);
          return;
        }
        
        // Fallback: Inform user about File System Access API requirement
        setApplyStatus('❌ Your browser does not support direct file writing. Please use Chrome or Edge for full functionality.');
        
        // Optional: Still provide download as last resort
        const shouldDownload = confirm(`Your browser cannot write files directly to "${targetDirectory}". Would you like to download the renamed files instead?`);
        
        if (shouldDownload) {
          setApplyStatus('Downloading renamed files...');
          
          for (let i = 0; i < files.length; i++) {
            const fileItem = files[i];
            setApplyStatus(`Downloading ${fileItem.newName} (${i + 1}/${files.length})`);
            
            // Create download link for each renamed file
            const url = URL.createObjectURL(fileItem.file);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileItem.newName;
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          setApplyStatus(`✅ Downloaded ${files.length} renamed files. Manually move them to "${targetDirectory}".`);
        }
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setApplyStatus(`❌ Error during rename process: ${errorMessage}`);
      console.error('Rename process failed:', error);
    } finally {
      setIsApplying(false);
      // Clear status after 12 seconds for success messages
      setTimeout(() => {
        if (applyStatus.includes('✅') || applyStatus.includes('⚠️')) {
          setApplyStatus('');
        }
      }, 12000);
    }
  };

  const resetFiles = () => {
    setFiles([]);
    setPattern('$N_#');
    setTargetDirectory('');
    setApplyStatus('');
    // Clear the stored directory handle
    const windowWithHandle = window as unknown as { selectedDirectoryHandle?: FileSystemDirectoryHandle };
    if (windowWithHandle.selectedDirectoryHandle) {
      delete windowWithHandle.selectedDirectoryHandle;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/80 to-orange-50/80 dark:from-red-900/10 dark:to-orange-900/10">
      <div className="w-full mx-auto px-3 sm:px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-red-700 to-red-900 dark:from-rose-200 dark:to-orange-200 bg-clip-text text-transparent">
            Batch Rename Files
          </h1>
          <p className="text-lg md:text-xl text-red-600 dark:text-rose-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Rename multiple files at once with simple pattern matching
          </p>

          {/* Drag and Drop Area */}
          {files.length === 0 && (
            <div className="w-full max-w-5xl mx-auto mb-12">
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 sm:p-12 text-center transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-2xl ${
                  isDragOver
                    ? 'border-red-600 bg-gradient-to-br from-rose-50 to-pink-50 dark:bg-gradient-to-br dark:from-red-900/20 dark:to-rose-900/20 shadow-xl scale-105'
                    : 'border-rose-300 dark:border-rose-600 hover:border-red-600 hover:bg-gradient-to-br hover:from-rose-100 hover:to-orange-100 dark:hover:from-red-800/40 dark:hover:to-rose-700/40 shadow-lg hover:shadow-red-500/20'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleOpenFolder}
              >
                <div className="flex flex-col items-center space-y-6">
                  <div className="p-6 rounded-full bg-gradient-to-br from-red-600 to-red-800 shadow-xl">
                    <LuFolderOpen className="w-16 h-16 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-red-800 dark:text-rose-200">
                      Select Files to Rename
                    </h3>
                    <p className="text-red-600 dark:text-rose-400 text-lg">
                      Drag & drop files here or click anywhere to browse
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4 text-sm text-red-500 dark:text-rose-500">
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-red-800/30">
                      📄 Multiple files
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-red-800/30">
                      ⚡ Pattern-based
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-red-800/30">
                      🔄 Client-side only
                    </span>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-600/5 to-rose-600/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Settings Panel and File List */}
          {files.length > 0 && (
            <div className="w-full mx-auto space-y-8 px-2 sm:px-4">
              {/* Settings Panel */}
              <Card className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border-rose-200 dark:border-rose-800">
                <CardHeader>
                  <CardTitle className="text-red-800 dark:text-rose-200 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">⚙</span>
                    </div>
                    Batch Rename Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left Column - Rename Pattern */}
                    <div>
                      <label className="block text-sm font-medium text-red-700 dark:text-rose-300 mb-2">
                        Rename Pattern
                      </label>
                      <Input
                        value={pattern}
                        onChange={(e) => updateFileNames(e.target.value)}
                        placeholder="e.g., $N_# or Photo_#_$N"
                        className="border-rose-300 dark:border-rose-600 focus:border-red-500 focus:ring-red-500"
                      />
                      <div className="mt-2 text-xs text-red-600 dark:text-rose-400 space-y-1">
                        <div><span className="font-mono bg-rose-100 dark:bg-red-800/30 px-1 rounded">$N</span> = original filename (without extension)</div>
                        <div><span className="font-mono bg-rose-100 dark:bg-red-800/30 px-1 rounded">#</span> = sequential number (1, 2, 3...)</div>
                      </div>
                    </div>

                    {/* Right Column - Target Directory */}
                    <div>
                      <label className="block text-sm font-medium text-red-700 dark:text-rose-300 mb-2">
                        Target Directory
                      </label>
                      
                      {/* Row 1: Browse Button */}
                      <div className="mb-3">
                        <Button 
                          onClick={selectTargetDirectory}
                          variant="outline"
                          className="w-full border-rose-300 dark:border-rose-600 text-red-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-red-800/30"
                        >
                          <LuFolderCheck className="w-4 h-4 mr-2" />
                          Browse
                        </Button>
                      </div>
                      
                      {/* Row 2: Directory Status */}
                      <div className="px-1">
                        <div className="text-xs text-red-700 dark:text-rose-300 bg-rose-50 dark:bg-red-800/20 rounded-lg px-2 py-2 border border-rose-200 dark:border-rose-600">
                          {targetDirectory || 'No directory selected'}
                        </div>
                        <div className="mt-1 text-xs text-red-600 dark:text-rose-400">
                          Select where renamed files will be created. Original files remain unchanged.
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Display */}
                  {applyStatus && (
                    <div className="p-3 rounded-lg bg-rose-100 dark:bg-red-800/30 border border-rose-200 dark:border-rose-700">
                      <div className="text-sm text-red-700 dark:text-rose-300">
                        {applyStatus}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      onClick={applyRenames}
                      disabled={isApplying || files.length === 0 || !targetDirectory}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LuPlay className="w-4 h-4 mr-2" />
                      {isApplying ? 'Processing...' : 'Batch Rename'}
                    </Button>
                    <Button 
                      onClick={resetFiles}
                      variant="outline"
                      className="border-rose-300 dark:border-rose-600 text-red-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-red-800/30"
                    >
                      <LuRefreshCw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* File List */}
              <Card className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border-rose-200 dark:border-rose-800">
                <CardHeader>
                  <CardTitle className="text-red-800 dark:text-rose-200 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-red-700 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{files.length}</span>
                    </div>
                    Rename Summary ({files.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="border border-rose-300 dark:border-rose-600 bg-white dark:bg-gray-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                      {files.map((fileItem, index) => (
                        <div 
                          key={index} 
                          className="px-3 py-2 text-xs font-medium text-red-800 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-red-900/10 transition-colors border-r border-b border-rose-200 dark:border-rose-700 last:border-r-0"
                        >
                          <div className="whitespace-nowrap overflow-hidden text-ellipsis text-left" title={fileItem.newName}>
                            {fileItem.newName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
