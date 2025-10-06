'use client';

import Link from 'next/link';
import { FaFacebook, FaLinkedin, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/batch-rename', label: 'Batch Rename' },
    { href: '/mp4-to-wmv', label: 'MP4 to WMV' },
    { href: '/contact', label: 'Contact' },
  ];

  const socialLinks = [
    { icon: FaFacebook, href: '#', label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: FaXTwitter, href: '#', label: 'X (Twitter)', color: 'hover:text-gray-900 dark:hover:text-white' },
    { icon: FaLinkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-700' },
    { icon: FaInstagram, href: '#', label: 'Instagram', color: 'hover:text-pink-600' },
    { icon: FaYoutube, href: '#', label: 'YouTube', color: 'hover:text-red-600' },
  ];

  return (
    <footer className="border-t border-rose-200 dark:border-rose-700 bg-gradient-to-r from-rose-50/95 to-pink-50/95 dark:from-red-900/20 dark:to-rose-900/20 backdrop-blur supports-[backdrop-filter]:bg-rose-50/60">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white font-bold text-sm">FF</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-red-700 to-red-900 dark:from-rose-200 dark:to-orange-200 bg-clip-text text-transparent">
                Files & Folders
              </span>
            </Link>
            <p className="text-sm text-red-600 dark:text-rose-400 leading-relaxed">
              Professional file management and conversion tools. Organize, rename, and convert your files with ease using our client-side applications.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-red-800 dark:text-rose-300 mb-4 uppercase tracking-wider">
              Navigation
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-sm text-red-600 dark:text-rose-400 hover:text-red-800 dark:hover:text-rose-200 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-red-800 dark:text-rose-300 mb-4 uppercase tracking-wider">
              Features
            </h3>
            <ul className="space-y-2 text-sm text-red-600 dark:text-rose-400">
              <li>• File Organization</li>
              <li>• Batch Renaming</li>
              <li>• Video Conversion</li>
              <li>• PDF Reports</li>
              <li>• Client-side Processing</li>
            </ul>
          </div>

          {/* Social Links & Contact */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-red-800 dark:text-rose-300 mb-4 uppercase tracking-wider">
              Connect
            </h3>
            <div className="flex space-x-4 mb-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className={`text-red-500 dark:text-rose-400 ${social.color} transition-colors`}
                  aria-label={social.label}
                  title={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="text-xs text-red-500/80 dark:text-rose-400/80">
              For the best experience with file operations and conversions, we recommend using 
              <span className="font-medium text-red-600 dark:text-rose-300"> Google Chrome</span>
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-rose-200 dark:border-rose-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-red-600 dark:text-rose-400">
              © {currentYear} Files & Folders App. Made with ❤️ for better file organization.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-rose-300 font-medium">
                v2.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
