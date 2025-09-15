'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LuFolderOpen, LuUsers, LuClock, LuStar } from 'react-icons/lu';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { mockActivities } from '@/lib/mockData';
import { formatFileSize, formatRelativeDate } from '@/lib/fileUtils';
import { useEffect, useState } from 'react';
import { ExportDialog } from '@/components/ui/export-dialog';
import { FolderViewer } from '@/components/ui/folder-viewer';
import { LuDownload } from 'react-icons/lu';

interface FolderStructure {
  name: string;
  path: string;
  type: 'folder' | 'file';
  size?: number;
  modified?: Date;
  children?: FolderStructure[];
}

function DashboardContent() {
  const { fileSystem, clients, getStats } = useFileSystem();
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedFolderStructure, setSelectedFolderStructure] = useState<FolderStructure[] | null>(null);
  const [selectedFolderName, setSelectedFolderName] = useState<string>('');
  
  // Initialize with mock data
  useEffect(() => {
    // This would normally be done in the context provider
    // For now, we'll use the mock data directly
    
    // Demo data removed - using real folder selection instead
  }, []);

  const stats = getStats();
  const recentActivities = mockActivities.slice(0, 3);

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
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Welcome to Files & Folders</h1>
          <p className="text-muted-foreground">
            Manage and organize your client files and folders efficiently
          </p>
        </div>
        <Button 
          onClick={() => setShowExportDialog(true)}
          className="flex items-center gap-2"
        >
          <LuDownload className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <LuFolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(stats.totalSize)} total size
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <LuUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.filter(c => c.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {clients.length} total clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Files</CardTitle>
            <LuClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFolders}</div>
            <p className="text-xs text-muted-foreground">
              Folders available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <LuStar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const favoritesFolder = fileSystem.children.find(f => f.name === 'Favorites' && f.type === 'folder');
                return (favoritesFolder && 'children' in favoritesFolder) ? favoritesFolder.children.length : 0;
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              Starred items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full justify-start"
                onClick={handleOpenFolder}
              >
                <LuFolderOpen className="mr-2 h-4 w-4" />
                Open Folder
              </Button>
            <Button variant="outline" className="w-full justify-start">
              <LuFolderOpen className="mr-2 h-4 w-4" />
              Create Folder
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <LuUsers className="mr-2 h-4 w-4" />
              Add Client
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowExportDialog(true)}
            >
              <LuDownload className="mr-2 h-4 w-4" />
              Export All Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest file operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-primary' : 
                    index === 1 ? 'bg-secondary' : 'bg-accent'
                  }`}></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Export Dialog */}
      <ExportDialog 
        isOpen={showExportDialog} 
        onClose={() => setShowExportDialog(false)} 
      />
      
      {/* Dynamic folder input created on demand - no upload dialogs */}
    </div>
  );
}

export default function Home() {
  return (
    <MainLayout>
      <DashboardContent />
    </MainLayout>
  );
}
