import { ActivityItem } from '@/types';

// Mock activities for dashboard display
export const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'upload',
    item: {
      id: 'file1',
      name: 'logo-variations.png',
      type: 'file',
      size: 2048000,
      extension: 'png',
      mimeType: 'image/png',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      modifiedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      path: '/acme-corp/assets/logo-variations.png',
      clientId: 'client1'
    },
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    description: 'Uploaded logo-variations.png to Acme Corporation'
  },
  {
    id: '2',
    type: 'create',
    item: {
      id: 'folder1',
      name: 'Favorites',
      type: 'folder',
      path: '/favorites',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      modifiedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      children: []
    },
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    description: 'Created Favorites folder'
  },
  {
    id: '3',
    type: 'favorite',
    item: {
      id: 'file2',
      name: 'project-proposal.pdf',
      type: 'file',
      size: 1536000,
      extension: 'pdf',
      mimeType: 'application/pdf',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      modifiedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      path: '/documents/project-proposal.pdf',
      isFavorite: true
    },
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    description: 'Starred project-proposal.pdf'
  }
];