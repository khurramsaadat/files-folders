'use client';

import { useState } from 'react';
import { LuSearch, LuMenu, LuSettings, LuUser, LuBell } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  onMenuClick: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Header({ onMenuClick, onSearch, searchQuery, setSearchQuery }: HeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rose-200 dark:border-rose-700 bg-gradient-to-r from-rose-50/95 to-pink-50/95 dark:from-red-900/20 dark:to-rose-900/20 backdrop-blur supports-[backdrop-filter]:bg-rose-50/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden hover:bg-rose-100 dark:hover:bg-red-800/30 text-red-600 dark:text-rose-400"
          >
            <LuMenu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">FF</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-700 to-red-900 dark:from-rose-200 dark:to-orange-200 bg-clip-text text-transparent">Files & Folders</h1>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500 dark:text-rose-400" />
            <Input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`pl-10 pr-4 transition-all duration-200 border-rose-200 dark:border-rose-600 bg-rose-50/50 dark:bg-red-800/10 focus:bg-white dark:focus:bg-red-900/20 ${
                isSearchFocused ? 'ring-2 ring-red-500/20 border-red-300 dark:border-red-500' : ''
              }`}
            />
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="relative hover:bg-rose-100 dark:hover:bg-red-800/30 text-red-600 dark:text-rose-400">
            <LuBell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-600 rounded-full"></span>
          </Button>
          
          <Button variant="ghost" size="icon" className="hover:bg-rose-100 dark:hover:bg-red-800/30 text-red-600 dark:text-rose-400">
            <LuSettings className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="hover:bg-rose-100 dark:hover:bg-red-800/30 text-red-600 dark:text-rose-400">
            <LuUser className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
