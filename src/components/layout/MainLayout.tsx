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
      
      {/* WhatsApp Widget - Fixed position, appears on all pages */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/971507849917?text=Hello!%20I%20found%20your%20website%20and%20would%20like%20to%20know%20more%20about%20your%20services.%20Can%20you%20help%20me?"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          aria-label="Chat with us on WhatsApp"
          title="Chat with us on WhatsApp"
        >
          {/* WhatsApp Icon - Simple SVG */}
          <svg 
            viewBox="0 0 24 24" 
            className="w-8 h-8 fill-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.484 3.488"/>
          </svg>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
            Chat with us on WhatsApp
            <div className="absolute top-1/2 left-full transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
          </div>
        </a>
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
