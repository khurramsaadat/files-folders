'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { FileSystemProvider, useFileSystem } from '@/contexts/FileSystemContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { searchQuery, setSearchQuery, currentPath, setCurrentPath, search } = useFileSystem();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = search(query);
    console.log('Search results:', results);
  };

  const handlePathChange = (path: string) => {
    setCurrentPath(path);
    console.log('Navigating to:', path);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={currentPath}
        onPathChange={handlePathChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <FileSystemProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </FileSystemProvider>
  );
}
