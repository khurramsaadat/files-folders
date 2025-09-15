import { formatFileSize } from './fileUtils';

// PDF Export for Folder Structure (Client-friendly)
export interface FolderStructure {
  name: string;
  path: string;
  type: 'folder' | 'file';
  size?: number;
  modified?: Date;
  children?: FolderStructure[];
}

export interface PDFExportOptions {
  projectName: string;
  clientName?: string;
  includeFileSize?: boolean;
  includeDate?: boolean;
  companyLogo?: string;
  notes?: string;
}

// Helper function to count total files (excluding folders)
function countTotalFiles(structure: FolderStructure[]): number {
  let count = 0;
  structure.forEach(item => {
    if (item.type === 'file') {
      count++;
    }
    if (item.children) {
      count += countTotalFiles(item.children);
    }
  });
  return count;
}

// Generate Professional PDF Report for Client
export function generateClientPDF(
  folderStructure: FolderStructure[],
  options: PDFExportOptions
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const timeString = new Date().toLocaleString();
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Files Report - ${options.projectName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #7c2d12;
            padding-bottom: 20px;
        }
        
        .header h1 {
            color: #7c2d12;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 15px;
        }
        
        .project-info {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            border-left: 4px solid #7c2d12;
        }
        
        .project-info h2 {
            color: #1f2937;
            margin-bottom: 15px;
            font-size: 20px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .info-item {
            background: white;
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .info-label {
            font-weight: 600;
            color: #374151;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        
        .info-value {
            color: #1f2937;
            font-size: 16px;
            font-weight: 500;
        }
        
        .file-structure {
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .structure-header {
            background: linear-gradient(135deg, #7c2d12 0%, #6b2713 100%);
            color: white;
            padding: 20px;
            font-size: 18px;
            font-weight: 600;
        }
        
        .structure-content {
            padding: 20px;
        }
        
        .folder-item, .file-item {
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .folder-item:last-child, .file-item:last-child {
            border-bottom: none;
        }
        
        .item-info {
            display: flex;
            align-items: center;
            flex-grow: 1;
        }
        
        .item-icon {
            width: 20px;
            height: 20px;
            margin-right: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            color: white;
        }
        
        .folder-icon {
            background: linear-gradient(135deg, #7c2d12 0%, #6b2713 100%);
        }
        
        .file-icon {
            background: linear-gradient(135deg, #a16207 0%, #7c2d12 100%);
        }
        
        .file-icon.video {
            background: linear-gradient(135deg, #a16207 0%, #7c2d12 100%);
        }
        
        .file-icon.image {
            background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
        }
        
        .file-icon.document {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
        
        .item-name {
            font-weight: 500;
            color: #1f2937;
            flex-grow: 1;
        }
        
        .folder-name {
            color: #7c2d12;
            font-weight: 600;
        }
        
        .item-meta {
            font-size: 12px;
            color: #6b7280;
            text-align: right;
        }
        
        .nested {
            margin-left: 32px;
        }
        
        .summary {
            margin-top: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }
        
        .summary h3 {
            color: #7c2d12;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        
        .summary-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .summary-number {
            font-size: 24px;
            font-weight: bold;
            color: #7c2d12;
            margin-bottom: 5px;
        }
        
        .summary-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        
        @media print {
            body { padding: 0; }
            .header { page-break-after: avoid; }
            .project-info { page-break-inside: avoid; }
            .folder-item, .file-item { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📁 ${options.projectName}</h1>
        <div class="subtitle">Professional File Structure Overview</div>
        <div class="subtitle">Generated on ${timeString}</div>
    </div>

    <div class="project-info">
        <h2>Project Information</h2>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Project Name</div>
                <div class="info-value">${options.projectName}</div>
            </div>
            ${options.clientName ? `
            <div class="info-item">
                <div class="info-label">Client</div>
                <div class="info-value">${options.clientName}</div>
            </div>
            ` : ''}
            <div class="info-item">
                <div class="info-label">Report Date</div>
                <div class="info-value">${timestamp}</div>
            </div>
                    <div class="info-item">
                        <div class="info-label">Total Files</div>
                        <div class="info-value">${countTotalFiles(folderStructure)} files</div>
                    </div>
        </div>
        ${options.notes ? `
        <div style="margin-top: 15px; padding: 12px; background: white; border-radius: 8px;">
            <div class="info-label">Project Notes</div>
            <div class="info-value">${options.notes}</div>
        </div>
        ` : ''}
    </div>

    <div class="file-structure">
        <div class="structure-header">
            📂 File Structure
        </div>
        <div class="structure-content">
            ${generateFileStructureHTML(folderStructure, options)}
        </div>
    </div>

    ${generateSummaryHTML(folderStructure)}

    <div class="footer">
        <p>This report was generated automatically from the project file structure.</p>
        <p>For questions about this project, please contact your project manager.</p>
    </div>
</body>
</html>`;

  return htmlContent;
}

// Helper function to get file icon class
function getFileIconClass(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v'].includes(extension)) {
    return 'video';
  } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
    return 'image';
  } else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)) {
    return 'document';
  }
  return '';
}

// Helper function to get file icon text
function getFileIconText(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'mp4': return 'MP4';
    case 'avi': return 'AVI';
    case 'mov': return 'MOV';
    case 'wmv': return 'WMV';
    case 'flv': return 'FLV';
    case 'mkv': return 'MKV';
    case 'webm': return 'WEBM';
    case 'm4v': return 'M4V';
    case 'jpg': case 'jpeg': return 'JPG';
    case 'png': return 'PNG';
    case 'pdf': return 'PDF';
    case 'txt': return 'TXT';
    case 'json': return 'JSON';
    default: return extension.substring(0, 3).toUpperCase() || 'FILE';
  }
}

// Helper function to generate file structure HTML
function generateFileStructureHTML(structure: FolderStructure[], options: PDFExportOptions, depth: number = 0): string {
  let html = '';
  
  structure.forEach(item => {
    const isFolder = item.type === 'folder';
    const nestClass = depth > 0 ? 'nested' : '';
    
    if (isFolder) {
      html += `
        <div class="folder-item ${nestClass}">
          <div class="item-info">
            <div class="item-icon folder-icon">📁</div>
            <div class="item-name folder-name">${item.name}</div>
          </div>
          <div class="item-meta">
            ${item.children ? `${item.children.length} items` : ''}
          </div>
        </div>
      `;
      
      if (item.children) {
        html += generateFileStructureHTML(item.children, options, depth + 1);
      }
    } else {
      const iconClass = getFileIconClass(item.name);
      const iconText = getFileIconText(item.name);
      
      html += `
        <div class="file-item ${nestClass}">
          <div class="item-info">
            <div class="item-icon file-icon ${iconClass}">${iconText}</div>
            <div class="item-name">${item.name}</div>
          </div>
          <div class="item-meta">
            <!-- File metadata removed for cleaner client presentation -->
          </div>
        </div>
      `;
    }
  });
  
  return html;
}

// Helper function to generate summary HTML
function generateSummaryHTML(structure: FolderStructure[]): string {
  const stats = calculateFolderStats(structure);
  
  return `
    <div class="summary">
      <h3>📊 Project Summary</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-number">${stats.totalFiles}</div>
          <div class="summary-label">Total Files</div>
        </div>
        <div class="summary-item">
          <div class="summary-number">${stats.totalFolders}</div>
          <div class="summary-label">Total Folders</div>
        </div>
        <div class="summary-item">
          <div class="summary-number">${formatFileSize(stats.totalSize)}</div>
          <div class="summary-label">Total Size</div>
        </div>
        <div class="summary-item">
          <div class="summary-number">${Object.keys(stats.fileTypes).length}</div>
          <div class="summary-label">File Types</div>
        </div>
      </div>
    </div>
  `;
}

// Helper function to calculate folder statistics
function calculateFolderStats(structure: FolderStructure[]) {
  let totalFiles = 0;
  let totalFolders = 0;
  let totalSize = 0;
  const fileTypes: Record<string, number> = {};
  
  function processItem(item: FolderStructure) {
    if (item.type === 'folder') {
      totalFolders++;
      if (item.children) {
        item.children.forEach(processItem);
      }
    } else {
      totalFiles++;
      if (item.size) {
        totalSize += item.size;
      }
      
      const extension = item.name.split('.').pop()?.toLowerCase() || 'unknown';
      fileTypes[extension] = (fileTypes[extension] || 0) + 1;
    }
  }
  
  structure.forEach(processItem);
  
  return { totalFiles, totalFolders, totalSize, fileTypes };
}

// Function to export folder structure as PDF (using browser print)
export function exportFolderStructurePDF(
  folderStructure: FolderStructure[],
  options: PDFExportOptions
) {
  const htmlContent = generateClientPDF(folderStructure, options);
  
  // Create a new window with the HTML content
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
}

// Function to download HTML report
export function downloadHTMLReport(
  folderStructure: FolderStructure[],
  options: PDFExportOptions
) {
  const htmlContent = generateClientPDF(folderStructure, options);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `${options.projectName.replace(/[^a-zA-Z0-9]/g, '-')}-report-${timestamp}.html`;
  
  // Create download link
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
