import { FileSystemItem, Client, FileItem, FolderItem } from '@/types';
import { formatFileSize, formatDate } from './fileUtils';

// Export formats
export type ExportFormat = 'csv' | 'json' | 'txt' | 'xlsx';

// Export options
export interface ExportOptions {
  format: ExportFormat;
  includeMetadata: boolean;
  includeClients: boolean;
  includeStats: boolean;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

// File system statistics for export
export interface ExportStats {
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  fileTypes: Record<string, number>;
  clientStats: Array<{
    clientName: string;
    fileCount: number;
    totalSize: number;
    lastActivity: Date;
  }>;
  exportDate: Date;
}

// Generate CSV content
export function generateCSV(
  fileSystem: FileSystemItem[],
  clients: Client[]
): string {
  const headers = [
    'Type',
    'Name',
    'Path',
    'Size',
    'Extension',
    'Client',
    'Created',
    'Modified',
    'Tags',
    'Description'
  ];

  const rows: string[] = [headers.join(',')];

  function processItem(item: FileSystemItem, path: string = '') {
    const currentPath = path ? `${path}/${item.name}` : item.name;
    const client = clients.find(c => c.id === item.clientId);
    
    const row = [
      item.type,
      `"${item.name}"`,
      `"${currentPath}"`,
      item.type === 'file' ? (item as FileItem).size.toString() : '0',
      item.type === 'file' ? (item as FileItem).extension : '',
      client ? `"${client.name}"` : '',
      formatDate(item.createdAt),
      formatDate(item.modifiedAt),
      item.type === 'file' ? `"${(item as FileItem).tags?.join(';') || ''}"` : '',
      `"${item.description || ''}"`
    ];
    
    rows.push(row.join(','));
    
    if (item.type === 'folder') {
      (item as FolderItem).children.forEach(child => {
        processItem(child, currentPath);
      });
    }
  }

  fileSystem.forEach(item => processItem(item));
  return rows.join('\n');
}

// Generate JSON content
export function generateJSON(
  fileSystem: FileSystemItem[],
  clients: Client[],
  options: ExportOptions
): string {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      totalItems: fileSystem.length,
      format: options.format,
      version: '1.0'
    },
    clients: options.includeClients ? clients : undefined,
    fileSystem: fileSystem,
    stats: options.includeStats ? generateStats(fileSystem, clients) : undefined
  };

  return JSON.stringify(exportData, null, 2);
}

// Generate TXT content
export function generateTXT(
  fileSystem: FileSystemItem[],
  clients: Client[],
  options: ExportOptions
): string {
  let content = 'FILES & FOLDERS EXPORT REPORT\n';
  content += '='.repeat(50) + '\n\n';
  content += `Export Date: ${formatDate(new Date())}\n`;
  content += `Total Items: ${fileSystem.length}\n\n`;

  if (options.includeClients && clients.length > 0) {
    content += 'CLIENTS:\n';
    content += '-'.repeat(20) + '\n';
    clients.forEach(client => {
      content += `• ${client.name} (${client.status})\n`;
      if (client.email) content += `  Email: ${client.email}\n`;
      if (client.company) content += `  Company: ${client.company}\n`;
      content += `  Files: ${client.totalFiles}, Size: ${formatFileSize(client.totalSize)}\n\n`;
    });
  }

  content += 'FILE SYSTEM STRUCTURE:\n';
  content += '-'.repeat(30) + '\n';

  function processItem(item: FileSystemItem, depth: number = 0) {
    const indent = '  '.repeat(depth);
    const client = clients.find(c => c.id === item.clientId);
    const clientInfo = client ? ` [${client.name}]` : '';
    
    if (item.type === 'file') {
      const file = item as FileItem;
      content += `${indent}📄 ${item.name}${clientInfo}\n`;
      if (options.includeMetadata) {
        content += `${indent}   Size: ${formatFileSize(file.size)}\n`;
        content += `${indent}   Type: ${file.extension}\n`;
        content += `${indent}   Created: ${formatDate(file.createdAt)}\n`;
        if (file.tags && file.tags.length > 0) {
          content += `${indent}   Tags: ${file.tags.join(', ')}\n`;
        }
        if (file.description) {
          content += `${indent}   Description: ${file.description}\n`;
        }
      }
    } else {
      const folder = item as FolderItem;
      content += `${indent}📁 ${item.name}${clientInfo}\n`;
      if (options.includeMetadata && folder.description) {
        content += `${indent}   Description: ${folder.description}\n`;
      }
      folder.children.forEach(child => {
        processItem(child, depth + 1);
      });
    }
  }

  fileSystem.forEach(item => processItem(item));

  if (options.includeStats) {
    const stats = generateStats(fileSystem, clients);
    content += '\n\nSTATISTICS:\n';
    content += '-'.repeat(20) + '\n';
    content += `Total Files: ${stats.totalFiles}\n`;
    content += `Total Folders: ${stats.totalFolders}\n`;
    content += `Total Size: ${formatFileSize(stats.totalSize)}\n`;
    
    if (Object.keys(stats.fileTypes).length > 0) {
      content += '\nFile Types:\n';
      Object.entries(stats.fileTypes).forEach(([type, count]) => {
        content += `  ${type}: ${count}\n`;
      });
    }
  }

  return content;
}

// Generate statistics
export function generateStats(fileSystem: FileSystemItem[], clients: Client[]): ExportStats {
  let totalFiles = 0;
  let totalFolders = 0;
  let totalSize = 0;
  const fileTypes: Record<string, number> = {};

  function processItem(item: FileSystemItem) {
    if (item.type === 'file') {
      totalFiles++;
      const file = item as FileItem;
      totalSize += file.size;
      fileTypes[file.extension] = (fileTypes[file.extension] || 0) + 1;
    } else {
      totalFolders++;
      (item as FolderItem).children.forEach(processItem);
    }
  }

  fileSystem.forEach(processItem);

  const clientStats = clients.map(client => ({
    clientName: client.name,
    fileCount: client.totalFiles,
    totalSize: client.totalSize,
    lastActivity: client.lastActivity || client.createdAt
  }));

  return {
    totalFiles,
    totalFolders,
    totalSize,
    fileTypes,
    clientStats,
    exportDate: new Date()
  };
}

// Download file
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Main export function
export function exportFileSystem(
  fileSystem: FileSystemItem[],
  clients: Client[],
  options: ExportOptions
) {
  let content: string;
  let filename: string;
  let mimeType: string;

  const timestamp = new Date().toISOString().split('T')[0];

  switch (options.format) {
    case 'csv':
      content = generateCSV(fileSystem, clients);
      filename = `files-folders-export-${timestamp}.csv`;
      mimeType = 'text/csv';
      break;
    case 'json':
      content = generateJSON(fileSystem, clients, options);
      filename = `files-folders-export-${timestamp}.json`;
      mimeType = 'application/json';
      break;
    case 'txt':
      content = generateTXT(fileSystem, clients, options);
      filename = `files-folders-export-${timestamp}.txt`;
      mimeType = 'text/plain';
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }

  downloadFile(content, filename, mimeType);
}

// Generate Excel file (basic implementation)
export function generateExcel(
  fileSystem: FileSystemItem[],
  clients: Client[]
) {
  // This would require a library like xlsx
  // For now, we'll generate a CSV that can be opened in Excel
  const csvContent = generateCSV(fileSystem, clients);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `files-folders-export-${timestamp}.csv`, 'text/csv');
}
