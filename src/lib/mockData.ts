import { FileItem, FolderItem, Client, FileSystemRoot, ActivityItem } from '@/types';
import { FILE_TYPE_CATEGORIES } from './constants';

// Generate unique IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mock Clients
export const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '+1-555-0123',
    company: 'Acme Corporation',
    createdAt: new Date('2024-01-15'),
    lastAccessed: new Date('2025-09-14'),
    color: '#3B82F6',
    avatar: 'AC',
    description: 'Leading technology solutions provider',
    status: 'active',
    totalFiles: 45,
    totalSize: 125000000, // 125MB
    lastActivity: new Date('2025-09-14'),
  },
  {
    id: 'client-2',
    name: 'TechStart Inc',
    email: 'hello@techstart.com',
    phone: '+1-555-0456',
    company: 'TechStart Inc',
    createdAt: new Date('2024-03-20'),
    lastAccessed: new Date('2025-09-13'),
    color: '#10B981',
    avatar: 'TS',
    description: 'Innovative startup in fintech',
    status: 'active',
    totalFiles: 23,
    totalSize: 67000000, // 67MB
    lastActivity: new Date('2025-09-13'),
  },
  {
    id: 'client-3',
    name: 'Design Studio',
    email: 'info@designstudio.com',
    phone: '+1-555-0789',
    company: 'Design Studio LLC',
    createdAt: new Date('2024-06-10'),
    lastAccessed: new Date('2025-09-12'),
    color: '#F59E0B',
    avatar: 'DS',
    description: 'Creative design agency',
    status: 'active',
    totalFiles: 78,
    totalSize: 234000000, // 234MB
    lastActivity: new Date('2025-09-12'),
  },
  {
    id: 'client-4',
    name: 'Global Enterprises',
    email: 'admin@globalent.com',
    phone: '+1-555-0321',
    company: 'Global Enterprises Ltd',
    createdAt: new Date('2023-11-05'),
    lastAccessed: new Date('2025-09-10'),
    color: '#8B5CF6',
    avatar: 'GE',
    description: 'International business conglomerate',
    status: 'inactive',
    totalFiles: 156,
    totalSize: 456000000, // 456MB
    lastActivity: new Date('2025-09-10'),
  },
];

// Mock Files
export const mockFiles: FileItem[] = [
  // Acme Corporation Files
  {
    id: 'file-1',
    name: 'project-proposal.pdf',
    type: 'file',
    size: 2048000, // 2MB
    extension: 'pdf',
    mimeType: 'application/pdf',
    createdAt: new Date('2025-09-10'),
    modifiedAt: new Date('2025-09-10'),
    path: '/clients/acme-corporation/project-proposal.pdf',
    clientId: 'client-1',
    tags: ['proposal', 'project', 'important'],
    isFavorite: true,
    description: 'Initial project proposal document',
    version: 1,
  },
  {
    id: 'file-2',
    name: 'wireframes.fig',
    type: 'file',
    size: 5120000, // 5MB
    extension: 'fig',
    mimeType: 'application/figma',
    createdAt: new Date('2025-09-12'),
    modifiedAt: new Date('2025-09-12'),
    path: '/clients/acme-corporation/wireframes.fig',
    clientId: 'client-1',
    tags: ['design', 'wireframes', 'ui'],
    isFavorite: false,
    description: 'User interface wireframes',
    version: 2,
  },
  {
    id: 'file-3',
    name: 'logo-variations.png',
    type: 'file',
    size: 1024000, // 1MB
    extension: 'png',
    mimeType: 'image/png',
    createdAt: new Date('2025-09-14'),
    modifiedAt: new Date('2025-09-14'),
    path: '/clients/acme-corporation/logo-variations.png',
    clientId: 'client-1',
    tags: ['logo', 'branding', 'design'],
    isFavorite: true,
    description: 'Logo design variations',
    version: 1,
  },
  
  // TechStart Inc Files
  {
    id: 'file-4',
    name: 'app-mockup.jpg',
    type: 'file',
    size: 3072000, // 3MB
    extension: 'jpg',
    mimeType: 'image/jpeg',
    createdAt: new Date('2025-09-11'),
    modifiedAt: new Date('2025-09-11'),
    path: '/clients/techstart-inc/app-mockup.jpg',
    clientId: 'client-2',
    tags: ['mockup', 'mobile', 'app'],
    isFavorite: false,
    description: 'Mobile app mockup design',
    version: 1,
  },
  {
    id: 'file-5',
    name: 'user-stories.docx',
    type: 'file',
    size: 1536000, // 1.5MB
    extension: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    createdAt: new Date('2025-09-13'),
    modifiedAt: new Date('2025-09-13'),
    path: '/clients/techstart-inc/user-stories.docx',
    clientId: 'client-2',
    tags: ['documentation', 'requirements', 'user-stories'],
    isFavorite: true,
    description: 'User stories and requirements',
    version: 3,
  },
  
  // Design Studio Files
  {
    id: 'file-6',
    name: 'brand-guidelines.pdf',
    type: 'file',
    size: 8192000, // 8MB
    extension: 'pdf',
    mimeType: 'application/pdf',
    createdAt: new Date('2025-09-08'),
    modifiedAt: new Date('2025-09-08'),
    path: '/clients/design-studio/brand-guidelines.pdf',
    clientId: 'client-3',
    tags: ['branding', 'guidelines', 'design'],
    isFavorite: true,
    description: 'Complete brand guidelines document',
    version: 2,
  },
  {
    id: 'file-7',
    name: 'website-screenshots.zip',
    type: 'file',
    size: 25600000, // 25MB
    extension: 'zip',
    mimeType: 'application/zip',
    createdAt: new Date('2025-09-12'),
    modifiedAt: new Date('2025-09-12'),
    path: '/clients/design-studio/website-screenshots.zip',
    clientId: 'client-3',
    tags: ['screenshots', 'website', 'archive'],
    isFavorite: false,
    description: 'Website screenshots archive',
    version: 1,
  },
];

// Mock Folders
export const mockFolders: FolderItem[] = [
  {
    id: 'folder-1',
    name: 'Acme Corporation',
    type: 'folder',
    path: '/clients/acme-corporation',
    createdAt: new Date('2024-01-15'),
    modifiedAt: new Date('2025-09-14'),
    clientId: 'client-1',
    children: [
      mockFiles[0], // project-proposal.pdf
      mockFiles[1], // wireframes.fig
      mockFiles[2], // logo-variations.png
    ],
    isExpanded: true,
    description: 'Acme Corporation project files',
    color: '#3B82F6',
    icon: 'building',
  },
  {
    id: 'folder-2',
    name: 'TechStart Inc',
    type: 'folder',
    path: '/clients/techstart-inc',
    createdAt: new Date('2024-03-20'),
    modifiedAt: new Date('2025-09-13'),
    clientId: 'client-2',
    children: [
      mockFiles[3], // app-mockup.jpg
      mockFiles[4], // user-stories.docx
    ],
    isExpanded: false,
    description: 'TechStart Inc project files',
    color: '#10B981',
    icon: 'rocket',
  },
  {
    id: 'folder-3',
    name: 'Design Studio',
    type: 'folder',
    path: '/clients/design-studio',
    createdAt: new Date('2024-06-10'),
    modifiedAt: new Date('2025-09-12'),
    clientId: 'client-3',
    children: [
      mockFiles[5], // brand-guidelines.pdf
      mockFiles[6], // website-screenshots.zip
    ],
    isExpanded: false,
    description: 'Design Studio project files',
    color: '#F59E0B',
    icon: 'palette',
  },
  {
    id: 'folder-4',
    name: 'Recent Files',
    type: 'folder',
    path: '/recent',
    createdAt: new Date('2025-09-01'),
    modifiedAt: new Date('2025-09-14'),
    children: [
      mockFiles[2], // logo-variations.png
      mockFiles[4], // user-stories.docx
      mockFiles[6], // website-screenshots.zip
    ],
    isExpanded: true,
    description: 'Recently accessed files',
    color: '#6B7280',
    icon: 'clock',
  },
  {
    id: 'folder-5',
    name: 'Favorites',
    type: 'folder',
    path: '/favorites',
    createdAt: new Date('2025-09-01'),
    modifiedAt: new Date('2025-09-14'),
    children: [
      mockFiles[0], // project-proposal.pdf
      mockFiles[2], // logo-variations.png
      mockFiles[4], // user-stories.docx
      mockFiles[5], // brand-guidelines.pdf
    ],
    isExpanded: false,
    description: 'Starred and favorite files',
    color: '#EF4444',
    icon: 'star',
  },
];

// Mock File System Root
export const mockFileSystem: FileSystemRoot = {
  id: 'root',
  name: 'Root',
  type: 'root',
  children: mockFolders,
  createdAt: new Date('2024-01-01'),
  modifiedAt: new Date('2025-09-15'),
};

// Mock Activity Items
export const mockActivities: ActivityItem[] = [
  {
    id: 'activity-1',
    type: 'upload',
    item: mockFiles[2],
    timestamp: new Date('2025-09-14T10:30:00'),
    user: 'John Doe',
    description: 'Uploaded logo-variations.png to Acme Corporation',
  },
  {
    id: 'activity-2',
    type: 'create',
    item: mockFolders[4],
    timestamp: new Date('2025-09-14T09:15:00'),
    user: 'Jane Smith',
    description: 'Created Favorites folder',
  },
  {
    id: 'activity-3',
    type: 'favorite',
    item: mockFiles[0],
    timestamp: new Date('2025-09-13T16:45:00'),
    user: 'John Doe',
    description: 'Starred project-proposal.pdf',
  },
  {
    id: 'activity-4',
    type: 'upload',
    item: mockFiles[6],
    timestamp: new Date('2025-09-12T14:20:00'),
    user: 'Mike Johnson',
    description: 'Uploaded website-screenshots.zip to Design Studio',
  },
  {
    id: 'activity-5',
    type: 'create',
    item: mockFiles[4],
    timestamp: new Date('2025-09-11T11:30:00'),
    user: 'Sarah Wilson',
    description: 'Created user-stories.docx for TechStart Inc',
  },
];

// Utility function to get file type category
export function getFileTypeCategory(extension: string): string {
  for (const [category, extensions] of Object.entries(FILE_TYPE_CATEGORIES)) {
    if ((extensions as readonly string[]).includes(extension.toLowerCase())) {
      return category;
    }
  }
  return 'OTHER';
}

// Utility function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utility function to get file icon
export function getFileIcon(extension: string): string {
  const category = getFileTypeCategory(extension);
  
  const iconMap: Record<string, string> = {
    IMAGE: 'image',
    DOCUMENT: 'file-text',
    SPREADSHEET: 'table',
    PRESENTATION: 'presentation',
    ARCHIVE: 'archive',
    VIDEO: 'video',
    AUDIO: 'music',
    CODE: 'code',
    OTHER: 'file',
  };
  
  return iconMap[category] || 'file';
}
