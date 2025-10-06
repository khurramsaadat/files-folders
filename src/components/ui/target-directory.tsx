'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { LuFolderOpen, LuFolderCheck } from 'react-icons/lu';
import type { FileSystemDirectoryHandle } from '@/types/file-system';

interface TargetDirectoryProps {
  onDirectorySelected: (directoryHandle: FileSystemDirectoryHandle | null, displayPath: string) => void;
  selectedPath?: string;
  disabled?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

const TargetDirectory: React.FC<TargetDirectoryProps> = ({
  onDirectorySelected,
  selectedPath = '',
  disabled = false,
  className = '',
  title = 'Target Directory',
  description = 'Select where files will be saved'
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [status, setStatus] = useState<string>('');

  const selectTargetDirectory = useCallback(async () => {
    if (disabled) return;
    
    try {
      setIsSelecting(true);
      setStatus('Opening directory picker...');

      // Use the File System Access API to select a directory
      if ('showDirectoryPicker' in window) {
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
        setStatus('Directory selected successfully');
        
        // Store the directory handle for later use
        (window as unknown as { selectedDirectoryHandle: FileSystemDirectoryHandle }).selectedDirectoryHandle = directoryHandle;
        
        // Notify parent component
        onDirectorySelected(directoryHandle, displayPath);
        
        // Clear status after a moment
        setTimeout(() => setStatus(''), 2000);
        
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
              setStatus(`Target directory selected: ${directoryName}`);
              
              // Store reference to the selected directory
              (window as unknown as { selectedDirectoryPath: string }).selectedDirectoryPath = directoryName;
              
              // Notify parent component (no handle available in fallback)
              onDirectorySelected(null, displayPath);
              
              document.body.removeChild(input);
              resolve(directoryName);
            } else {
              document.body.removeChild(input);
              resolve(null);
            }
          };
          
          input.oncancel = () => {
            document.body.removeChild(input);
            // Don't show cancelled message - just clear any existing status
            setStatus('');
            resolve(null);
          };
          
          document.body.appendChild(input);
          input.click();
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Directory selection failed:', error);
        setStatus('Directory selection failed. You can manually enter a directory name.');
        
        // Fallback: Allow user to type custom directory name
        const customName = prompt('Enter target directory name:', 'Renamed Files');
        if (customName) {
          const displayPath = `📝 ${customName} (Custom Directory)`;
          setStatus(`Custom directory set: ${customName}`);
          
          // Notify parent component (no handle available for custom name)
          onDirectorySelected(null, displayPath);
          
          setTimeout(() => setStatus(''), 2000);
        } else {
          setStatus('');
        }
      } else {
        // User cancelled the picker
        console.log('Directory selection cancelled or failed:', error);
        // Don't show cancelled message - just clear any existing status
        setStatus('');
      }
    } finally {
      setIsSelecting(false);
    }
  }, [disabled, onDirectorySelected]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {title}
        </label>
        <div className="flex gap-3">
          <Button
            onClick={selectTargetDirectory}
            disabled={disabled || isSelecting}
            className="flex items-center gap-2"
            variant="outline"
          >
            <LuFolderOpen className="w-4 h-4" />
            {isSelecting ? 'Selecting...' : 'Browse'}
          </Button>
          <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 flex items-center">
            {selectedPath ? (
              <div className="flex items-center gap-2">
                <LuFolderCheck className="w-4 h-4 text-green-600" />
                <span>{selectedPath}</span>
              </div>
            ) : (
              <span className="text-gray-500">No directory selected</span>
            )}
          </div>
        </div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
        {status && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default TargetDirectory;
