// File type categories
export const FILE_TYPE_CATEGORIES = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
  DOCUMENT: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
  SPREADSHEET: ['xls', 'xlsx', 'csv', 'ods'],
  PRESENTATION: ['ppt', 'pptx', 'odp'],
  ARCHIVE: ['zip', 'rar', '7z', 'tar', 'gz'],
  VIDEO: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
  AUDIO: ['mp3', 'wav', 'aac', 'flac', 'ogg'],
  CODE: ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'xml'],
} as const;

// File size limits
export const FILE_SIZE_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_TOTAL_SIZE: 10 * 1024 * 1024 * 1024, // 10GB
} as const;

// UI Constants
export const UI_CONSTANTS = {
  GRID_ITEMS_PER_ROW: {
    mobile: 2,
    tablet: 3,
    desktop: 4,
  },
  PAGINATION: {
    ITEMS_PER_PAGE: 20,
    MAX_VISIBLE_PAGES: 5,
  },
  ANIMATION: {
    DURATION: 200,
    EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Theme colors
export const THEME_COLORS = {
  WARM: {
    primary: 'oklch(0.45 0.15 30)',
    secondary: 'oklch(0.92 0.05 30)',
    accent: 'oklch(0.88 0.08 30)',
    background: 'oklch(0.98 0.02 30)',
    foreground: 'oklch(0.15 0.05 30)',
  },
} as const;
