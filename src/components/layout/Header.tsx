'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/batch-rename', label: 'Batch Rename' },
    { href: '/contact', label: 'Contact' },
  ];

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <div className="flex h-16 items-center justify-between mb-8 pb-4 border-b border-rose-200 dark:border-rose-700 relative">
      {/* Left Section - Brand */}
      <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm">FF</span>
        </div>
        <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-red-700 to-red-900 dark:from-rose-200 dark:to-orange-200 bg-clip-text text-transparent">Files & Folders</h1>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1">
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

      {/* Mobile Menu Button */}
      <div className="md:hidden mobile-menu-container">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          aria-label="Toggle menu"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={cn(
              "block w-full h-0.5 bg-white transition-all duration-300 transform origin-center",
              isMenuOpen ? "rotate-45 translate-y-1.5" : ""
            )} />
            <span className={cn(
              "block w-full h-0.5 bg-white transition-all duration-300",
              isMenuOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
            )} />
            <span className={cn(
              "block w-full h-0.5 bg-white transition-all duration-300 transform origin-center",
              isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
            )} />
          </div>
        </button>

        {/* Mobile Menu Dropdown */}
        <div className={cn(
          "absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-rose-200 dark:border-rose-700 overflow-hidden transition-all duration-300 transform origin-top-right z-50",
          isMenuOpen 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        )}>
          <div className="py-2">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block px-4 py-3 text-sm font-medium transition-all duration-200 transform",
                    isActive
                      ? "text-white bg-gradient-to-r from-red-600 to-red-700 shadow-md"
                      : "text-red-600 dark:text-rose-400 hover:text-red-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-red-800/20",
                    isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                  )}
                  style={{
                    transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms'
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
