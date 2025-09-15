'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  FileSystemContextType,
  FileSystemRoot,
  Client,
  FileItem,
  FolderItem,
  ViewMode,
  SortBy,
  SortOrder,
  FileFilter,
  SearchResult,
  FileSystemStats,
  ActivityItem,
} from '@/types';
import { mockFileSystem, mockClients } from '@/lib/mockData';

// State Interface
interface FileSystemState {
  fileSystem: FileSystemRoot;
  clients: Client[];
  currentPath: string;
  selectedItems: string[];
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  searchQuery: string;
  filter: FileFilter;
  isLoading: boolean;
  error: string | null;
}

// Initial State
const initialState: FileSystemState = {
  fileSystem: {
    id: 'root',
    name: 'Root',
    type: 'root' as const,
    children: [] as (FileItem | FolderItem)[],
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
  clients: [] as Client[],
  currentPath: '/',
  selectedItems: [] as string[],
  viewMode: 'grid' as ViewMode,
  sortBy: 'name' as SortBy,
  sortOrder: 'asc' as SortOrder,
  searchQuery: '',
  filter: {
    searchTerm: '',
    fileTypes: [] as string[],
    dateRange: {},
    clientId: undefined,
    tags: [] as string[],
  },
  isLoading: false,
  error: null,
};

// Action Types
type FileSystemAction =
  | { type: 'SET_CURRENT_PATH'; payload: string }
  | { type: 'SET_SELECTED_ITEMS'; payload: string[] }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_SORT_BY'; payload: SortBy }
  | { type: 'SET_SORT_ORDER'; payload: SortOrder }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTER'; payload: FileFilter }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILE_SYSTEM'; payload: FileSystemRoot }
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'ADD_FILE'; payload: FileItem }
  | { type: 'ADD_FOLDER'; payload: FolderItem }
  | { type: 'UPDATE_FILE'; payload: { id: string; updates: Partial<FileItem> } }
  | { type: 'UPDATE_FOLDER'; payload: { id: string; updates: Partial<FolderItem> } }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: { id: string; updates: Partial<Client> } }
  | { type: 'DELETE_CLIENT'; payload: string };

// Reducer
function fileSystemReducer(state: FileSystemState, action: FileSystemAction): FileSystemState {
  switch (action.type) {
    case 'SET_CURRENT_PATH':
      return { ...state, currentPath: action.payload };
    case 'SET_SELECTED_ITEMS':
      return { ...state, selectedItems: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
    case 'SET_SORT_ORDER':
      return { ...state, sortOrder: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FILE_SYSTEM':
      return { ...state, fileSystem: action.payload };
    case 'SET_CLIENTS':
      return { ...state, clients: action.payload };
    case 'ADD_FILE':
      return {
        ...state,
        fileSystem: {
          ...state.fileSystem,
          children: [...state.fileSystem.children, action.payload],
          modifiedAt: new Date(),
        },
      };
    case 'ADD_FOLDER':
      return {
        ...state,
        fileSystem: {
          ...state.fileSystem,
          children: [...state.fileSystem.children, action.payload],
          modifiedAt: new Date(),
        },
      };
    case 'UPDATE_FILE':
      return {
        ...state,
        fileSystem: {
          ...state.fileSystem,
          children: state.fileSystem.children.map((item) =>
            (item as any).id === action.payload.id && (item as any).type === 'file'
              ? { ...(item as any), ...action.payload.updates }
              : item
          ),
          modifiedAt: new Date(),
        },
      };
    case 'UPDATE_FOLDER':
      return {
        ...state,
        fileSystem: {
          ...state.fileSystem,
          children: state.fileSystem.children.map((item) =>
            (item as any).id === action.payload.id && (item as any).type === 'folder'
              ? { ...(item as any), ...action.payload.updates }
              : item
          ),
          modifiedAt: new Date(),
        },
      };
    case 'DELETE_ITEM':
      return {
        ...state,
        fileSystem: {
          ...state.fileSystem,
          children: state.fileSystem.children.filter((item) => (item as any).id !== action.payload),
          modifiedAt: new Date(),
        },
      };
    case 'ADD_CLIENT':
      return {
        ...state,
        clients: [...state.clients, action.payload],
      };
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map((client) =>
          (client as any).id === action.payload.id
            ? { ...(client as any), ...action.payload.updates }
            : client
        ),
      };
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter((client) => (client as any).id !== action.payload),
      };
    default:
      return state;
  }
}

// Context
const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

// Provider
export function FileSystemProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(fileSystemReducer, initialState);

  // Initialize with mock data
  useEffect(() => {
    dispatch({ type: 'SET_FILE_SYSTEM', payload: mockFileSystem });
    dispatch({ type: 'SET_CLIENTS', payload: mockClients });
  }, []);

  // Action creators
  const setCurrentPath = useCallback((path: string) => {
    dispatch({ type: 'SET_CURRENT_PATH', payload: path });
  }, []);

  const setSelectedItems = useCallback((items: string[]) => {
    dispatch({ type: 'SET_SELECTED_ITEMS', payload: items });
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const setSortBy = useCallback((sort: SortBy) => {
    dispatch({ type: 'SET_SORT_BY', payload: sort });
  }, []);

  const setSortOrder = useCallback((order: SortOrder) => {
    dispatch({ type: 'SET_SORT_ORDER', payload: order });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setFilter = useCallback((filter: FileFilter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const addFile = useCallback((file: FileItem) => {
    dispatch({ type: 'ADD_FILE', payload: file });
  }, []);

  const addFolder = useCallback((folder: FolderItem) => {
    dispatch({ type: 'ADD_FOLDER', payload: folder });
  }, []);

  const updateFile = useCallback((id: string, updates: Partial<FileItem>) => {
    dispatch({ type: 'UPDATE_FILE', payload: { id, updates } });
  }, []);

  const updateFolder = useCallback((id: string, updates: Partial<FolderItem>) => {
    dispatch({ type: 'UPDATE_FOLDER', payload: { id, updates } });
  }, []);

  const deleteItem = useCallback((id: string) => {
    dispatch({ type: 'DELETE_ITEM', payload: id });
  }, []);

  const moveItem = useCallback((id: string, newPath: string) => {
    // TODO: Implement move logic
    console.log('Move item:', id, 'to:', newPath);
  }, []);

  const renameItem = useCallback((id: string, newName: string) => {
    // TODO: Implement rename logic
    console.log('Rename item:', id, 'to:', newName);
  }, []);

  const addClient = useCallback((client: Client) => {
    dispatch({ type: 'ADD_CLIENT', payload: client });
  }, []);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    dispatch({ type: 'UPDATE_CLIENT', payload: { id, updates } });
  }, []);

  const deleteClient = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CLIENT', payload: id });
  }, []);

  const search = useCallback((query: string): SearchResult[] => {
    // TODO: Implement search logic
    console.log('Search query:', query);
    return [];
  }, []);

  const filterItems = useCallback((filter: FileFilter) => {
    // TODO: Implement filter logic
    console.log('Filter items:', filter);
    return state.fileSystem.children;
  }, [state.fileSystem.children]);

  const getStats = useCallback((): FileSystemStats => {
    const totalFiles = state.fileSystem.children.filter(item => item.type === 'file').length;
    const totalFolders = state.fileSystem.children.filter(item => item.type === 'folder').length;
    const totalSize = state.fileSystem.children
      .filter(item => item.type === 'file')
      .reduce((sum, item) => sum + (item as FileItem).size, 0);
    
    const fileTypes: Record<string, number> = {};
    state.fileSystem.children
      .filter(item => item.type === 'file')
      .forEach(item => {
        const extension = (item as FileItem).extension;
        fileTypes[extension] = (fileTypes[extension] || 0) + 1;
      });

    return {
      totalFiles,
      totalFolders,
      totalSize,
      fileTypes,
      recentActivity: [],
    };
  }, [state.fileSystem.children]);

  const value: FileSystemContextType = {
    ...state,
    setCurrentPath,
    setSelectedItems,
    setViewMode,
    setSortBy,
    setSortOrder,
    setSearchQuery,
    setFilter,
    addFile,
    addFolder,
    updateFile,
    updateFolder,
    deleteItem,
    moveItem,
    renameItem,
    addClient,
    updateClient,
    deleteClient,
    search,
    filterItems,
    getStats,
  };

  return (
    <FileSystemContext.Provider value={value}>
      {children}
    </FileSystemContext.Provider>
  );
}

// Hook
export function useFileSystem() {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
}
