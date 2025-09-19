'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/batch-rename', label: 'Batch Rename' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <div className="flex h-16 items-center justify-between mb-8 pb-4 border-b border-rose-200 dark:border-rose-700">
      {/* Left Section - Brand */}
      <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm">FF</span>
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-red-700 to-red-900 dark:from-rose-200 dark:to-orange-200 bg-clip-text text-transparent">Files & Folders</h1>
      </Link>

      {/* Right Section - Navigation */}
      <nav className="flex items-center space-x-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={cn(
                "text-sm font-medium transition-all duration-200 px-3 py-2 rounded-lg relative",
                isActive 
                  ? "text-white bg-gradient-to-r from-red-600 to-red-700 shadow-md" 
                  : "text-red-600 dark:text-rose-400 hover:text-red-700 dark:hover:text-rose-300 hover:bg-rose-100 dark:hover:bg-red-800/30"
              )}
            >
              {item.label}
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-300 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
