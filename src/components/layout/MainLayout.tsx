'use client';

import { Header } from './Header';
import { Footer } from './Footer';
import { FileSystemProvider } from '@/contexts/FileSystemContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Page Content with Header */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <Header />
        {children}
      </main>

      {/* Footer */}
      <Footer />
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
