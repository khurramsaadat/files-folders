'use client';

import Link from 'next/link';

export function Header() {
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
      <nav className="flex items-center space-x-4">
        <Link 
          href="/" 
          className="text-sm font-medium text-red-600 dark:text-rose-400 hover:text-red-700 dark:hover:text-rose-300 transition-colors px-3 py-2 rounded-lg hover:bg-rose-100 dark:hover:bg-red-800/30"
        >
          Home
        </Link>
        <Link 
          href="/contact" 
          className="text-sm font-medium text-red-600 dark:text-rose-400 hover:text-red-700 dark:hover:text-rose-300 transition-colors px-3 py-2 rounded-lg hover:bg-rose-100 dark:hover:bg-red-800/30"
        >
          Contact
        </Link>
      </nav>
    </div>
  );
}
