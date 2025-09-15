'use client';

import { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Label } from './label';
import { LuDownload, LuFileText, LuFile, LuDatabase, LuSettings } from 'react-icons/lu';
import { ExportFormat, ExportOptions, exportFileSystem } from '@/lib/exportUtils';
import { useFileSystem } from '@/contexts/FileSystemContext';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const { fileSystem, clients } = useFileSystem();
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeClients, setIncludeClients] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const options: ExportOptions = {
        format,
        includeMetadata,
        includeClients,
        includeStats,
      };

      exportFileSystem(fileSystem.children, clients, options);
      
      // Close dialog after successful export
      setTimeout(() => {
        onClose();
        setIsExporting(false);
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const formatOptions = [
    {
      value: 'csv' as ExportFormat,
      label: 'CSV',
      description: 'Comma-separated values, perfect for Excel',
      icon: LuFileText,
    },
    {
      value: 'json' as ExportFormat,
      label: 'JSON',
      description: 'Structured data format',
      icon: LuDatabase,
    },
    {
      value: 'txt' as ExportFormat,
      label: 'Text',
      description: 'Human-readable text report',
      icon: LuFile,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LuDownload className="h-5 w-5" />
            Export Files & Folders
          </CardTitle>
          <CardDescription>
            Download a comprehensive report of all your files and folders
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Export Format</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {formatOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setFormat(option.value)}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      format === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <LuSettings className="h-4 w-4" />
              Export Options
            </Label>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Include file metadata (size, tags, descriptions)</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeClients}
                  onChange={(e) => setIncludeClients(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Include client information</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={includeStats}
                  onChange={(e) => setIncludeStats(e.target.checked)}
                  className="rounded border-border"
                />
                <span className="text-sm">Include statistics and summary</span>
              </label>
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Export Summary</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• {fileSystem.children.length} top-level items</div>
              <div>• {clients.length} clients</div>
              <div>• Format: {format.toUpperCase()}</div>
              <div>• Includes: {[
                includeMetadata && 'Metadata',
                includeClients && 'Clients',
                includeStats && 'Statistics'
              ].filter(Boolean).join(', ')}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="min-w-[120px]"
            >
              {isExporting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Exporting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LuDownload className="h-4 w-4" />
                  Export Now
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
