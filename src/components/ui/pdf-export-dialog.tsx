'use client';

import { useState } from 'react';
import { Button } from './button';
import { LuX, LuFileText, LuUser, LuStickyNote } from 'react-icons/lu';
import { exportFolderStructurePDF, PDFExportOptions } from '@/lib/pdfExport';

interface FolderStructure {
  name: string;
  path: string;
  type: 'folder' | 'file';
  size?: number;
  modified?: Date;
  children?: FolderStructure[];
}

interface PDFExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  folderStructure: FolderStructure[];
  defaultProjectName: string;
}

export function PDFExportDialog({ 
  isOpen, 
  onClose, 
  folderStructure, 
  defaultProjectName 
}: PDFExportDialogProps) {
  const [projectName, setProjectName] = useState(defaultProjectName);
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('This report contains the complete file structure for your project deliverables.');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const options: PDFExportOptions = {
        projectName: projectName.trim() || defaultProjectName,
        clientName: clientName.trim() || undefined,
        includeFileSize: false, // Disabled as requested
        includeDate: false, // Disabled as requested
        notes: notes.trim() || undefined
      };

      exportFolderStructurePDF(folderStructure, options);
      
      // Close dialog after successful export
      setTimeout(() => {
        onClose();
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      console.error('PDF export failed:', error);
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <LuFileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Export PDF Report
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Generate professional client report
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <LuX className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Project Name */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <LuFileText className="h-4 w-4" />
              <span>Project Name</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Client Name */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <LuUser className="h-4 w-4" />
              <span>Client Name (Optional)</span>
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter client name"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <LuStickyNote className="h-4 w-4" />
              <span>Project Notes (Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add project notes or description"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none"
            />
          </div>

          {/* Preview Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700/30">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">PDF will include:</p>
                <ul className="mt-1 space-y-0.5 text-xs">
                  <li>• Complete folder structure (no file sizes or dates)</li>
                  <li>• Project information and statistics</li>
                  <li>• Professional formatting for client presentation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !projectName.trim()}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <LuFileText className="h-4 w-4 mr-2" />
                Generate PDF
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
