'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Label } from './label';
import { LuUpload, LuX, LuFile, LuCheck, LuTriangleAlert } from 'react-icons/lu';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { FileItem, FolderItem } from '@/types';
import { formatFileSize } from '@/lib/fileUtils';

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  clientId?: string;
  folderId?: string;
}

export function UploadDialog({ isOpen, onClose }: UploadDialogProps) {
  const { addFile, clients, fileSystem } = useFileSystem();
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get available folders for selection
  const getAvailableFolders = (): FolderItem[] => {
    const folders: FolderItem[] = [];
    
    function collectFolders(items: (FileItem | FolderItem)[]) {
      items.forEach(item => {
        if (item.type === 'folder') {
          folders.push(item as FolderItem);
          collectFolders((item as FolderItem).children);
        }
      });
    }
    
    collectFolders(fileSystem.children);
    return folders;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newUploadFiles: UploadFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending',
      clientId: selectedClient || undefined,
      folderId: selectedFolder || undefined,
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(file => file.id !== id));
  };

  const updateFileStatus = (id: string, updates: Partial<UploadFile>) => {
    setUploadFiles(prev => 
      prev.map(file => 
        file.id === id ? { ...file, ...updates } : file
      )
    );
  };

  const simulateUpload = async (uploadFile: UploadFile): Promise<void> => {
    return new Promise((resolve) => {
      const duration = Math.random() * 2000 + 1000; // 1-3 seconds
      const interval = 50;
      const increment = 100 / (duration / interval);
      
      let progress = 0;
      const timer = setInterval(() => {
        progress += increment;
        updateFileStatus(uploadFile.id, { progress: Math.min(progress, 100) });
        
        if (progress >= 100) {
          clearInterval(timer);
          resolve();
        }
      }, interval);
    });
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);
    
    for (const uploadFile of uploadFiles) {
      try {
        updateFileStatus(uploadFile.id, { status: 'uploading' });
        
        // Simulate upload progress
        await simulateUpload(uploadFile);
        
        // Create file item
        const fileItem: FileItem = {
          id: Math.random().toString(36).substr(2, 9),
          name: uploadFile.file.name,
          type: 'file',
          size: uploadFile.file.size,
          extension: uploadFile.file.name.split('.').pop()?.toLowerCase() || '',
          mimeType: uploadFile.file.type,
          createdAt: new Date(),
          modifiedAt: new Date(),
          path: selectedFolder ? `/${selectedFolder}/${uploadFile.file.name}` : `/${uploadFile.file.name}`,
          clientId: selectedClient || undefined,
          tags: [],
          isFavorite: false,
          description: `Uploaded file: ${uploadFile.file.name}`,
          version: 1,
        };

        // Add file to system
        addFile(fileItem);
        
        updateFileStatus(uploadFile.id, { status: 'completed' });
      } catch (error) {
        updateFileStatus(uploadFile.id, { 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed' 
        });
      }
    }

    setIsUploading(false);
    
    // Close dialog after successful upload
    setTimeout(() => {
      setUploadFiles([]);
      onClose();
    }, 2000);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const newUploadFiles: UploadFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending',
      clientId: selectedClient || undefined,
      folderId: selectedFolder || undefined,
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  }, [selectedClient, selectedFolder]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  if (!isOpen) return null;

  const availableFolders = getAvailableFolders();
  const completedFiles = uploadFiles.filter(f => f.status === 'completed').length;
  const totalFiles = uploadFiles.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LuUpload className="h-5 w-5" />
            Upload Files
          </CardTitle>
          <CardDescription>
            Upload files to your file system. You can drag and drop files or click to select.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Upload Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-select">Assign to Client (Optional)</Label>
              <select
                id="client-select"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="">No client assigned</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="folder-select">Upload to Folder (Optional)</Label>
              <select
                id="folder-select"
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="">Root directory</option>
                {availableFolders.map(folder => (
                  <option key={folder.id} value={folder.name}>
                    {folder.path}/{folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* File Drop Zone */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <LuUpload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Drop files here or click to select</p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports all file types. Maximum file size: 100MB per file.
            </p>
            <Button variant="outline" type="button">
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File List */}
          {uploadFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Files to Upload ({uploadFiles.length})</h4>
                {totalFiles > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {completedFiles}/{totalFiles} completed
                  </div>
                )}
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {uploadFiles.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className="flex items-center space-x-3 p-3 border border-border rounded-lg"
                  >
                    <LuFile className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {uploadFile.status === 'pending' && (
                        <div className="w-4 h-4 border-2 border-muted-foreground rounded-full" />
                      )}
                      
                      {uploadFile.status === 'uploading' && (
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      )}
                      
                      {uploadFile.status === 'completed' && (
                        <LuCheck className="h-4 w-4 text-green-500" />
                      )}
                      
                      {uploadFile.status === 'error' && (
                        <LuTriangleAlert className="h-4 w-4 text-red-500" />
                      )}

                      {uploadFile.status !== 'uploading' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(uploadFile.id)}
                          className="h-6 w-6 p-0"
                        >
                          <LuX className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {uploadFile.status === 'uploading' && (
                      <div className="w-20">
                        <div className="w-full bg-muted rounded-full h-1">
                          <div
                            className="bg-primary h-1 rounded-full transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {uploadFile.error && (
                      <p className="text-xs text-red-500">{uploadFile.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={uploadFiles.length === 0 || isUploading}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LuUpload className="h-4 w-4" />
                  Upload {uploadFiles.length > 0 && `(${uploadFiles.length})`}
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
