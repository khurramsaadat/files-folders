'use client';

import { useState, useCallback, useRef } from 'react';
import { LuUpload, LuPlay, LuDownload, LuSettings, LuTrash2, LuX, LuVideo } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import TargetDirectory from '@/components/ui/target-directory';
import type { FileSystemDirectoryHandle, FileSystemFileHandle } from '@/types/file-system';

interface VideoFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'waiting' | 'converting' | 'completed' | 'error';
  progress: number;
  settings: ConversionSettings;
  thumbnail?: string;
  downloadUrl?: string;
  sourceResolution?: { width: number; height: number };
  sourceFrameRate?: number;
}

interface ConversionSettings {
  resolution: { width: number; height: number };
  frameRate: number;
  bitrateType: 'CBR' | 'VBR';
  maxBitrate: number;
  fieldOrder: 'Progressive' | 'Interlaced';
  aspectRatio: number;
}

const getDefaultSettings = (sourceResolution?: { width: number; height: number }, sourceFrameRate?: number): ConversionSettings => ({
  resolution: sourceResolution || { width: 800, height: 600 },
  frameRate: sourceFrameRate || 30,
  bitrateType: 'CBR',
  maxBitrate: 2000,
  fieldOrder: 'Progressive',
  aspectRatio: 1.0,
});

const defaultSettings: ConversionSettings = getDefaultSettings();

export default function Mp4ToWmvPage() {
  const [files, setFiles] = useState<VideoFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [currentSettings, setCurrentSettings] = useState<ConversionSettings>(defaultSettings);
  const [targetDirectory, setTargetDirectory] = useState<FileSystemDirectoryHandle | null>(null);
  const [targetDirectoryPath, setTargetDirectoryPath] = useState<string>('');
  const [useFallbackMode, setUseFallbackMode] = useState(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const extractVideoMetadata = useCallback((file: File): Promise<{ resolution?: { width: number; height: number }; frameRate?: number }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        const resolution = {
          width: video.videoWidth,
          height: video.videoHeight
        };
        
        // Note: Getting exact frame rate from video element is limited
        // In a real implementation, you'd use a library like ffprobe.js or similar
        const frameRate = 30; // Default fallback, could be enhanced with proper detection
        
        URL.revokeObjectURL(url);
        resolve({ resolution, frameRate });
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({}); // Return empty object on error, will use defaults
      };
      
      video.src = url;
    });
  }, []);

  const handleFiles = useCallback(async (selectedFiles: File[]) => {
    const videoFiles = selectedFiles.filter(file => 
      file.type.includes('video/') && 
      (file.name.endsWith('.mp4') || file.name.endsWith('.mov') || file.name.endsWith('.avi'))
    );

    const newFiles: VideoFile[] = [];
    
    for (const file of videoFiles) {
      const metadata = await extractVideoMetadata(file);
      const fileSettings = getDefaultSettings(metadata.resolution, metadata.frameRate);
      
      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        size: file.size,
        status: 'waiting',
        progress: 0,
        settings: fileSettings,
        sourceResolution: metadata.resolution,
        sourceFrameRate: metadata.frameRate,
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, [extractVideoMetadata]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
  }, [handleFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  }, []);

  const openSettings = useCallback((fileId: string | null) => {
    setSelectedFileId(fileId);
    if (fileId) {
      const file = files.find(f => f.id === fileId);
      if (file) {
        setCurrentSettings(file.settings);
      }
    } else {
      setCurrentSettings(defaultSettings);
    }
    setShowSettings(true);
  }, [files]);

  const applySettings = useCallback(() => {
    if (selectedFileId) {
      // Apply to single file
      setFiles(prev => prev.map(file => 
        file.id === selectedFileId 
          ? { ...file, settings: { ...currentSettings } }
          : file
      ));
    } else {
      // Apply to all files
      setFiles(prev => prev.map(file => ({ 
        ...file, 
        settings: { ...currentSettings } 
      })));
    }
    setShowSettings(false);
  }, [selectedFileId, currentSettings]);

  const handleDirectorySelected = useCallback((directoryHandle: FileSystemDirectoryHandle | null, displayPath: string) => {
    setTargetDirectory(directoryHandle);
    setTargetDirectoryPath(displayPath);
    
    // Reset fallback mode when a directory is selected
    if (directoryHandle) {
      setUseFallbackMode(false);
    }
  }, []);

  // Initialize FFmpeg
  const initFFmpeg = useCallback(async () => {
    if (ffmpegRef.current || ffmpegLoaded) return;
    
    try {
      console.log('Starting FFmpeg initialization...');
      const ffmpeg = new FFmpeg();
      
      // Add progress logging
      ffmpeg.on('log', ({ message }) => {
        console.log('FFmpeg log:', message);
      });
      
      ffmpeg.on('progress', ({ progress, time }) => {
        console.log('FFmpeg progress:', { progress, time });
      });
      
      // Load FFmpeg with CDN URLs
      console.log('Loading FFmpeg core files...');
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
      
      console.log('Core URLs prepared, loading FFmpeg...');
      await ffmpeg.load({
        coreURL,
        wasmURL,
      });
      
      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
      console.log('FFmpeg loaded successfully');
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      setFfmpegLoaded(false);
      
      // Update files to show error
      setFiles(prev => prev.map(f => 
        f.status === 'converting' ? { ...f, status: 'error' as const } : f
      ));
      
      alert(`Failed to load video conversion engine: ${error instanceof Error ? error.message : 'Unknown error'}. Please refresh the page and try again.`);
    }
  }, [ffmpegLoaded]);

  // Convert single file to WMV
  const convertFileToWMV = useCallback(async (file: VideoFile): Promise<Blob | null> => {
    if (!ffmpegRef.current) {
      console.log('FFmpeg not loaded, initializing...');
      await initFFmpeg();
      if (!ffmpegRef.current) {
        console.error('FFmpeg initialization failed');
        return null;
      }
    }

    try {
      const ffmpeg = ffmpegRef.current;
      const inputName = `input_${file.id}.${file.file.name.split('.').pop()}`;
      const outputName = `output_${file.id}.wmv`;
      
      console.log(`Starting conversion for ${file.file.name}`);
      console.log('Input file:', inputName, 'Output file:', outputName);

      // Write input file to FFmpeg filesystem
      console.log('Writing input file to FFmpeg filesystem...');
      const inputData = await fetchFile(file.file);
      await ffmpeg.writeFile(inputName, inputData);
      console.log('Input file written successfully, size:', inputData.length);

      // Build FFmpeg command based on settings
      const args = [
        '-i', inputName,
        '-c:v', 'wmv2', // WMV codec
        '-s', `${file.settings.resolution.width}x${file.settings.resolution.height}`,
        '-r', file.settings.frameRate.toString(),
        '-b:v', `${file.settings.maxBitrate}k`,
        '-c:a', 'wmav2', // WMA audio codec
        '-y', // Overwrite output file
        outputName
      ];

      console.log('Executing FFmpeg command:', args.join(' '));

      // Execute conversion
      await ffmpeg.exec(args);
      console.log('FFmpeg conversion completed');

      // Read converted file
      console.log('Reading output file...');
      const data = await ffmpeg.readFile(outputName);
      console.log('Output file read successfully, size:', data.length);
      
      // Clean up temporary files
      try {
        await ffmpeg.deleteFile(inputName);
        await ffmpeg.deleteFile(outputName);
        console.log('Temporary files cleaned up');
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary files:', cleanupError);
      }

      // Return as blob
      const blob = new Blob([data as BlobPart], { type: 'video/x-ms-wmv' });
      console.log('Conversion blob created, size:', blob.size);
      return blob;
    } catch (error) {
      console.error('Conversion failed for', file.file.name, ':', error);
      return null;
    }
  }, [initFFmpeg]);

  // Pre-create file handles with user activation
  const prepareFileHandles = useCallback(async (fileNames: string[]) => {
    if (!targetDirectory || useFallbackMode) return {};
    
    const handles: Record<string, FileSystemFileHandle> = {};
    
    try {
      for (const fileName of fileNames) {
        const fileHandle = await targetDirectory.getFileHandle(fileName, { create: true });
        handles[fileName] = fileHandle;
      }
      return handles;
    } catch (error) {
      console.error('Failed to prepare file handles:', error);
      return {};
    }
  }, [targetDirectory, useFallbackMode]);

  // Open target directory in file explorer
  const openTargetDirectory = useCallback(async () => {
    if (targetDirectory && !useFallbackMode) {
      // For File System Access API, we can't directly open the directory
      // But we can show a helpful notification with the directory name
      const directoryName = targetDirectory.name;
      
      // Create a temporary notification element
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <span>Files saved in "${directoryName}" directory. Check your file explorer!</span>
      `;
      
      document.body.appendChild(notification);
      
      // Remove notification after 4 seconds
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 4000);
      
    } else if (useFallbackMode) {
      // For fallback mode, show Downloads folder guidance
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
        <span>Files downloaded to your Downloads folder. Press Ctrl+J to open Downloads!</span>
      `;
      
      document.body.appendChild(notification);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 5000);
      
    } else {
      // No directory selected
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-amber-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';
      notification.innerHTML = `
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        <span>Please select a target directory first to save your converted files.</span>
      `;
      
      document.body.appendChild(notification);
      
      // Remove notification after 4 seconds
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 4000);
    }
  }, [targetDirectory, useFallbackMode]);

  // Save file using pre-created handle or download
  const saveConvertedFile = useCallback(async (blob: Blob, fileName: string, fileHandle?: FileSystemFileHandle) => {
    if (fileHandle && !useFallbackMode) {
      try {
        // Save to pre-created file handle
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } catch (error) {
        console.error('Failed to save to directory:', error);
        // Fall back to download
      }
    }
    
    // Fallback: Download file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }, [useFallbackMode]);

  const enableFallbackMode = useCallback(() => {
    setUseFallbackMode(true);
    setTargetDirectoryPath('Downloads (Individual files)');
  }, []);

  const startConversion = useCallback(async () => {
    if (!targetDirectory && !useFallbackMode) {
      alert('Please select a target directory first, or use fallback mode.');
      return;
    }

    console.log('Starting conversion process...');

    // Pre-create file handles while we have user activation
    const waitingFiles = files.filter(f => f.status === 'waiting');
    const fileNames = waitingFiles.map(f => `${f.name.replace(/\.[^/.]+$/, '')}.wmv`);
    
    console.log('Preparing file handles for:', fileNames);
    const fileHandles = await prepareFileHandles(fileNames);

    // Initialize FFmpeg if not already loaded
    if (!ffmpegLoaded) {
      console.log('FFmpeg not loaded, initializing...');
      setFiles(prev => prev.map(f => 
        f.status === 'waiting' ? { ...f, status: 'converting' as const, progress: 5 } : f
      ));
      
      try {
        // Add timeout for FFmpeg initialization
        const initPromise = initFFmpeg();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('FFmpeg initialization timeout')), 30000)
        );
        
        await Promise.race([initPromise, timeoutPromise]);
        console.log('FFmpeg initialization completed');
        
        // Wait a bit for state to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!ffmpegRef.current) {
          throw new Error('FFmpeg failed to load properly');
        }
      } catch (error) {
        console.error('FFmpeg initialization failed:', error);
        setFiles(prev => prev.map(f => 
          f.status === 'converting' ? { ...f, status: 'error' as const } : f
        ));
        setIsConverting(false);
        alert(`Failed to initialize video conversion engine: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    }

    setIsConverting(true);
    
    // Real conversion process
    for (const file of files) {
      if (file.status === 'waiting' || (file.status === 'converting' && file.progress < 10)) {
        try {
          console.log(`Processing file: ${file.name}`);
          
          // Update status to converting
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'converting' as const, progress: 10 } : f
          ));

          // Convert file using FFmpeg with timeout
          const conversionPromise = convertFileToWMV(file);
          const timeoutPromise = new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Conversion timeout')), 120000) // 2 minutes
          );
          
          const convertedBlob = await Promise.race([conversionPromise, timeoutPromise]);
          
          if (convertedBlob) {
            console.log(`Conversion successful for ${file.name}`);
            
            // Update progress to 90%
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, progress: 90 } : f
            ));

            // Save converted file using pre-created handle
            const fileName = `${file.name.replace(/\.[^/.]+$/, '')}.wmv`;
            const fileHandle = fileHandles[fileName];
            const saved = await saveConvertedFile(convertedBlob, fileName, fileHandle);

            if (saved) {
              console.log(`File saved successfully: ${fileName}`);
              // Mark as completed
              setFiles(prev => prev.map(f => 
                f.id === file.id 
                  ? { 
                      ...f, 
                      status: 'completed' as const, 
                      progress: 100,
                      downloadUrl: fileName
                    } 
                  : f
              ));
            } else {
              console.error(`Failed to save file: ${fileName}`);
              // Mark as error
              setFiles(prev => prev.map(f => 
                f.id === file.id ? { ...f, status: 'error' as const } : f
              ));
            }
          } else {
            console.error(`Conversion failed for ${file.name}`);
            // Conversion failed
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, status: 'error' as const } : f
            ));
          }
        } catch (error) {
          console.error('Conversion error for', file.name, ':', error);
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, status: 'error' as const } : f
          ));
        }
      }
    }
    
    console.log('Conversion process completed');
    setIsConverting(false);
  }, [files, targetDirectory, useFallbackMode, ffmpegLoaded, initFFmpeg, convertFileToWMV, saveConvertedFile, prepareFileHandles]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSettingsSummary = (settings: ConversionSettings, file?: VideoFile) => {
    const resolutionText = file?.sourceResolution && 
      settings.resolution.width === file.sourceResolution.width && 
      settings.resolution.height === file.sourceResolution.height
      ? `${settings.resolution.width}x${settings.resolution.height} (Source)`
      : `${settings.resolution.width}x${settings.resolution.height}`;
    
    const frameRateText = file?.sourceFrameRate && settings.frameRate === file.sourceFrameRate
      ? `${settings.frameRate}fps (Source)`
      : `${settings.frameRate}fps`;
    
    return `${resolutionText}, ${frameRateText}, ${settings.maxBitrate/1000} Mbps ${settings.bitrateType}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/95 to-pink-50/95 dark:from-red-900/20 dark:to-rose-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-red-700 to-red-900 dark:from-rose-200 dark:to-orange-200 bg-clip-text text-transparent">
            MP4 to WMV Converter
          </h1>
          <p className="text-lg text-red-600 dark:text-rose-400 max-w-2xl mx-auto mb-2">
            Professional video conversion with customizable encoding settings.
          </p>
          <p className="text-lg text-red-600 dark:text-rose-400 max-w-2xl mx-auto">
            Convert MP4, MOV, and AVI files to WMV format.
          </p>
        </div>

        {/* 2x2 Grid Layout */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            
            {/* Top Row - Upload Area and Output Settings */}
            {/* Left Column - Upload Area (60%) */}
            <div className="lg:col-span-6">
              <div
                className={cn(
                  "border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer h-full",
                  isDragOver
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-red-300 dark:border-red-700 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/10"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".mp4,.mov,.avi,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <LuUpload className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-800 dark:text-rose-300 mb-2">
                  Upload Video Files
                </h3>
                <p className="text-red-600 dark:text-rose-400 mb-4">
                  Drag and drop your MP4, MOV, or AVI files here, or click to browse
                </p>
                <div className="text-sm text-red-500 dark:text-rose-500">
                  Supported formats: MP4, MOV, AVI
                </div>
              </div>
            </div>

            {/* Right Column - Output Settings (40%) */}
            <div className="lg:col-span-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-rose-200 dark:border-rose-800 p-6 h-full">
                <h3 className="text-lg font-semibold text-red-800 dark:text-rose-300 mb-4 flex items-center gap-2">
                  <LuSettings className="w-5 h-5" />
                  Output Settings
                </h3>
                
                <div className="space-y-4">
                  <TargetDirectory
                    onDirectorySelected={handleDirectorySelected}
                    selectedPath={targetDirectoryPath}
                    disabled={useFallbackMode}
                    title="Target Directory for WMV Files"
                    description={useFallbackMode 
                      ? 'Files will be downloaded individually to your Downloads folder'
                      : 'Select where the converted WMV files will be saved'
                    }
                    className="mb-4"
                  />
                  
                  {!targetDirectory && !useFallbackMode && (
                    <div className="space-y-2">
                      <button
                        onClick={enableFallbackMode}
                        className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <LuDownload className="w-4 h-4" />
                        Use Downloads Fallback
                      </button>
                      <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                        Or use the fallback option to download files individually
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Row - Conversion Queue (Full Width) */}
            {files.length > 0 && (
              <div className="lg:col-span-10 mt-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-rose-200 dark:border-rose-800 overflow-hidden">
                  {/* Queue Header */}
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                          <LuVideo className="w-5 h-5" />
                          Conversion Queue ({files.length} files)
                        </h2>
                        {targetDirectoryPath && (
                          <p className="text-sm text-red-100 mt-1">
                            Output: {targetDirectoryPath}
                          </p>
                        )}
                        {!targetDirectoryPath && !useFallbackMode && (
                          <p className="text-sm text-yellow-200 mt-1">
                            Please select the target directory
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openSettings(null)}
                          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <LuSettings className="w-4 h-4" />
                          Settings for All
                        </button>
                        <button
                          onClick={startConversion}
                          disabled={isConverting || files.every(f => f.status === 'completed') || (!targetDirectory && !targetDirectoryPath && !useFallbackMode)}
                          className="px-6 py-2 bg-white text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
                          title={(!targetDirectory && !targetDirectoryPath && !useFallbackMode) ? 'Please select a target directory or use Downloads fallback' : ''}
                        >
                          <svg className="w-4 h-4 fill-green-600" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                          {isConverting ? 'Converting...' : 'Start Queue'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Queue Items */}
                  <div className="divide-y divide-rose-100 dark:divide-rose-800">
                    {files.map((file) => (
                      <div key={file.id} className="p-4 hover:bg-rose-50/50 dark:hover:bg-red-900/10 transition-colors">
                        <div className="flex items-center gap-4">
                          {/* Thumbnail */}
                          <div className="w-16 h-12 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <LuVideo className="w-6 h-6 text-red-500" />
                          </div>

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-red-800 dark:text-rose-300 truncate">
                              {file.name}
                            </h3>
                            <p className="text-sm text-red-600 dark:text-rose-400">
                              {formatFileSize(file.size)}
                            </p>
                          </div>

                          {/* Settings Summary */}
                          <div className="hidden md:block">
                            <button
                              onClick={() => openSettings(file.id)}
                              className="text-sm text-red-600 dark:text-rose-400 hover:text-red-700 dark:hover:text-rose-300 border border-red-300 dark:border-red-700 rounded-lg px-3 py-1 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              {getSettingsSummary(file.settings, file)}
                            </button>
                          </div>

                          {/* Status */}
                          <div className="text-center min-w-[100px]">
                            {file.status === 'waiting' && (
                              <span className="text-sm text-amber-600 dark:text-amber-400">Waiting</span>
                            )}
                            {file.status === 'converting' && (
                              <div>
                                <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                                  {file.progress < 10 ? 'Loading engine...' : `Converting ${file.progress}%`}
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${file.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {file.status === 'completed' && (
                              <span className="text-sm text-green-600 dark:text-green-400">Completed</span>
                            )}
                            {file.status === 'error' && (
                              <span className="text-sm text-red-600 dark:text-red-400">Error</span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            {file.status === 'completed' && (
                              <button 
                                onClick={openTargetDirectory}
                                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Open target directory"
                              >
                                <LuDownload className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => removeFile(file.id)}
                              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <LuTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-rose-200 dark:border-rose-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {selectedFileId ? 'File Settings' : 'Settings for All Files'}
                  </h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <LuX className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-red-100 mt-2">
                  Default preset: &ldquo;POS Full 2 Mbps&rdquo; - Resolution and frame rate match source file. Customize encoding parameters below
                </p>
              </div>

              {/* Settings Form */}
              <div className="p-6 space-y-6">
                {/* Resolution */}
                <div>
                  <label className="block text-sm font-medium text-red-800 dark:text-rose-300 mb-2">
                    Resolution
                    {selectedFileId && (() => {
                      const file = files.find(f => f.id === selectedFileId);
                      const isSourceResolution = file?.sourceResolution && 
                        currentSettings.resolution.width === file.sourceResolution.width && 
                        currentSettings.resolution.height === file.sourceResolution.height;
                      return isSourceResolution ? (
                        <span className="ml-2 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                          Matches Source
                        </span>
                      ) : null;
                    })()}
                  </label>
                  <div className="flex gap-4">
                    <div>
                      <label className="block text-xs text-red-600 dark:text-rose-400 mb-1">Width</label>
                      <input
                        type="number"
                        value={currentSettings.resolution.width}
                        onChange={(e) => setCurrentSettings(prev => ({
                          ...prev,
                          resolution: { ...prev.resolution, width: parseInt(e.target.value) || 800 }
                        }))}
                        className="w-24 px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <span className="text-red-600 dark:text-rose-400">×</span>
                    </div>
                    <div>
                      <label className="block text-xs text-red-600 dark:text-rose-400 mb-1">Height</label>
                      <input
                        type="number"
                        value={currentSettings.resolution.height}
                        onChange={(e) => setCurrentSettings(prev => ({
                          ...prev,
                          resolution: { ...prev.resolution, height: parseInt(e.target.value) || 600 }
                        }))}
                        className="w-24 px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Frame Rate */}
                <div>
                  <label className="block text-sm font-medium text-red-800 dark:text-rose-300 mb-2">
                    Frame Rate (fps)
                    {selectedFileId && (() => {
                      const file = files.find(f => f.id === selectedFileId);
                      const isSourceFrameRate = file?.sourceFrameRate && currentSettings.frameRate === file.sourceFrameRate;
                      return isSourceFrameRate ? (
                        <span className="ml-2 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                          Matches Source
                        </span>
                      ) : null;
                    })()}
                  </label>
                  <select
                    value={currentSettings.frameRate}
                    onChange={(e) => setCurrentSettings(prev => ({
                      ...prev,
                      frameRate: parseInt(e.target.value)
                    }))}
                    className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                  >
                    <option value={24}>24 fps</option>
                    <option value={25}>25 fps</option>
                    <option value={30}>30 fps</option>
                    <option value={50}>50 fps</option>
                    <option value={60}>60 fps</option>
                  </select>
                </div>

                {/* Bitrate Type */}
                <div>
                  <label className="block text-sm font-medium text-red-800 dark:text-rose-300 mb-2">
                    Bitrate Encoding
                  </label>
                  <select
                    value={currentSettings.bitrateType}
                    onChange={(e) => setCurrentSettings(prev => ({
                      ...prev,
                      bitrateType: e.target.value as 'CBR' | 'VBR'
                    }))}
                    className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                  >
                    <option value="CBR">CBR (Constant Bitrate)</option>
                    <option value="VBR">VBR (Variable Bitrate)</option>
                  </select>
                </div>

                {/* Maximum Bitrate */}
                <div>
                  <label className="block text-sm font-medium text-red-800 dark:text-rose-300 mb-2">
                    Maximum Bitrate: {currentSettings.maxBitrate} kbps ({(currentSettings.maxBitrate/1000).toFixed(1)} Mbps)
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="100"
                    value={currentSettings.maxBitrate}
                    onChange={(e) => setCurrentSettings(prev => ({
                      ...prev,
                      maxBitrate: parseInt(e.target.value)
                    }))}
                    className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-red-500 dark:text-rose-500 mt-1">
                    <span>0.5 Mbps</span>
                    <span>10 Mbps</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 dark:bg-slate-800 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-red-600 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applySettings}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-colors font-medium"
                >
                  Apply Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
