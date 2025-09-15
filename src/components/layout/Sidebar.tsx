'use client';

import { useState } from 'react';
import { 
  LuHouse, 
  LuFolderOpen, 
  LuUsers, 
  LuStar, 
  LuClock, 
  LuTrash2, 
  LuChevronRight,
  LuPlus
} from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  currentPath: string;
  onPathChange: (path: string) => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  children?: SidebarItem[];
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LuHouse,
    path: '/',
  },
  {
    id: 'files',
    label: 'All Files',
    icon: LuFolderOpen,
    path: '/files',
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: LuUsers,
    path: '/clients',
    children: [
      { id: 'client-1', label: 'Client A', icon: LuFolderOpen, path: '/clients/client-a' },
      { id: 'client-2', label: 'Client B', icon: LuFolderOpen, path: '/clients/client-b' },
    ],
  },
  {
    id: 'favorites',
    label: 'Favorites',
    icon: LuStar,
    path: '/favorites',
  },
  {
    id: 'recent',
    label: 'Recent',
    icon: LuClock,
    path: '/recent',
  },
  {
    id: 'trash',
    label: 'Trash',
    icon: LuTrash2,
    path: '/trash',
  },
];

export function Sidebar({ isCollapsed, onToggle, currentPath, onPathChange }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['clients']);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const isActive = currentPath === item.path;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);

    return (
      <div key={item.id}>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start text-left font-normal',
            level > 0 && 'ml-4',
            isCollapsed && 'px-2',
            isActive 
              ? 'bg-gradient-to-r from-rose-100 to-pink-100 dark:from-red-800/40 dark:to-rose-800/40 text-red-700 dark:text-rose-200 border-rose-200 dark:border-rose-600' 
              : 'hover:bg-rose-100/50 dark:hover:bg-red-800/20 text-red-600 dark:text-rose-300 hover:text-red-700 dark:hover:text-rose-200'
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              onPathChange(item.path);
            }
          }}
        >
          <item.icon className={cn('h-4 w-4', isCollapsed && 'mr-0')} />
          {!isCollapsed && (
            <>
              <span className="ml-2">{item.label}</span>
              {hasChildren && (
                <LuChevronRight 
                  className={cn(
                    'ml-auto h-4 w-4 transition-transform',
                    isExpanded && 'rotate-90'
                  )} 
                />
              )}
            </>
          )}
        </Button>

        {/* Children */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn(
      'flex flex-col h-full bg-gradient-to-b from-rose-50 to-pink-50 dark:from-red-900/20 dark:to-rose-900/20 border-r border-rose-200 dark:border-rose-700 transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-rose-200 dark:border-rose-700">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold bg-gradient-to-r from-red-700 to-red-900 dark:from-rose-200 dark:to-orange-200 bg-clip-text text-transparent">Navigation</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 hover:bg-rose-100 dark:hover:bg-red-800/30"
        >
          <LuChevronRight className={cn(
            'h-4 w-4 transition-transform text-red-600 dark:text-rose-400',
            isCollapsed && 'rotate-180'
          )} />
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map(item => renderSidebarItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-rose-200 dark:border-rose-700">
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start border-rose-300 dark:border-rose-600 bg-rose-50/50 dark:bg-red-800/10 hover:bg-rose-100 dark:hover:bg-red-800/20 text-red-600 dark:text-rose-300 hover:text-red-700 dark:hover:text-rose-200',
            isCollapsed && 'px-2'
          )}
        >
          <LuPlus className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Add Client</span>}
        </Button>
      </div>
    </aside>
  );
}
