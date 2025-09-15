'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LuFolderOpen, LuUsers, LuClock, LuStar, LuUpload } from 'react-icons/lu';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { mockFileSystem, mockClients, mockActivities } from '@/lib/mockData';
import { formatFileSize, formatRelativeDate } from '@/lib/fileUtils';
import { useEffect, useState, useRef } from 'react';
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
  const folderInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize with mock data
  useEffect(() => {
    // This would normally be done in the context provider
    // For now, we'll use the mock data directly
  }, []);

  const stats = getStats();
  const recentActivities = mockActivities.slice(0, 3);

  const buildFolderStructure = (files: File[], rootPath: string): FolderStructure[] => {
    const structure: { [key: string]: FolderStructure } = {};

    files.forEach(file => {
      const pathParts = file.webkitRelativePath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
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
        
        currentStructure = currentStructure[part].children as { [key: string]: FolderStructure };
      });
      
      // Add file
      const fileStructure: FolderStructure = {
        name: fileName,
        path: file.webkitRelativePath,
        type: 'file',
        size: file.size,
        modified: new Date(file.lastModified)
      };
      
      if (pathParts.length === 1) {
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
          
          currentStructure = currentStructure[part].children as { [key: string]: FolderStructure };
        });
        
        currentStructure[fileName] = fileStructure;
      }
    });

    return Object.values(structure);
  };

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Get the folder name from the first file
    const firstFile = files[0];
    const folderName = firstFile.webkitRelativePath.split('/')[0];
    
    // Build folder structure from files
    const structure = buildFolderStructure(files, folderName);
    setSelectedFolderStructure(structure);
    setSelectedFolderName(folderName);
  };

  const handleOpenFolder = () => {
    folderInputRef.current?.click();
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
              {fileSystem.children.find(f => f.name === 'Favorites')?.children.length || 0}
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
      
      {/* Hidden folder input */}
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderSelect}
        className="hidden"
      />
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
