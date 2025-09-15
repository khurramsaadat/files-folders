'use client';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-rose-200 dark:border-rose-700 bg-gradient-to-r from-rose-50/95 to-pink-50/95 dark:from-red-900/20 dark:to-rose-900/20 backdrop-blur supports-[backdrop-filter]:bg-rose-50/60">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Section - Brand */}
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xs">FF</span>
            </div>
            <span className="text-sm font-medium bg-gradient-to-r from-red-700 to-red-900 dark:from-rose-200 dark:to-orange-200 bg-clip-text text-transparent">
              Files & Folders
            </span>
          </div>

          {/* Center Section - Copyright */}
          <div className="text-center">
            <p className="text-sm text-red-600 dark:text-rose-400">
              © {currentYear} Files & Folders App. Made with ❤️ for better file organization.
            </p>
          </div>

          {/* Right Section - Version */}
          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-rose-300 font-medium">
              v2.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
