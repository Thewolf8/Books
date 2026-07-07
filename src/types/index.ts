export type BookType = 'physical' | 'digital';

export type TagCategory = 'liked' | 'disliked' | 'no-comment' | 'custom';

export type ThemeMode = 'light' | 'dark' | 'system';

export type Language = 'en' | 'ar' | 'fr';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImagePath: string | null;
  type: BookType;
  filePath: string | null;
  totalPages: number;
  currentPage: number;
  summary: string;
  review: string;
  rating: number;
  createdAt: number;
  updatedAt: number;
  lastReadAt: number | null;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  category: TagCategory;
  createdAt: number;
}

export interface BookTag {
  bookId: string;
  tagId: string;
}

export interface Highlight {
  id: string;
  bookId: string;
  pageNumber: number;
  selectedText: string;
  comment: string;
  color: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  createdAt: number;
  updatedAt: number;
}

export interface HighlightWithBook extends Highlight {
  bookTitle: string;
  bookAuthor: string;
  bookCoverPath: string | null;
}

export interface AppSettings {
  theme: ThemeMode;
  language: Language;
  customColors: CustomColors | null;
  fonts: FontSettings | null;
}

export interface CustomColors {
  pageBackground: string;
  textColor: string;
  highlightColor: string;
}

export interface FontSettings {
  englishFont: string;
  arabicFont: string;
  frenchFont: string;
  globalFont: string;
}

export interface VaultFilters {
  searchQuery: string;
  bookId: string | null;
  tagIds: string[];
  dateFrom: number | null;
  dateTo: number | null;
  sortBy: 'date' | 'book' | 'page';
  sortOrder: 'asc' | 'desc';
}

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  type: BookType;
  coverImagePath: string | null;
  filePath: string | null;
  totalPages: number;
  summary: string;
  review: string;
  rating: number;
  tags: string[];
}
