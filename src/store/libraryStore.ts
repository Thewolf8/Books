import {create} from 'zustand';
import type {Book, BookFormData, Tag} from '@types';
import * as BookRepo from '@database/repositories/BookRepository';
import * as TagRepo from '@database/repositories/TagRepository';

interface LibraryState {
  books: Book[];
  tags: Tag[];
  selectedBookId: string | null;
  searchQuery: string;
  filterType: 'all' | 'physical' | 'digital';
  sortBy: 'recent' | 'title' | 'author' | 'rating';
  isLoading: boolean;
  error: string | null;

  // Actions
  loadBooks: () => void;
  loadTags: () => void;
  addBook: (data: BookFormData) => Promise<Book>;
  updateBook: (id: string, data: Partial<BookFormData>) => Promise<Book>;
  deleteBook: (id: string) => void;
  selectBook: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (type: 'all' | 'physical' | 'digital') => void;
  setSortBy: (sort: 'recent' | 'title' | 'author' | 'rating') => void;
  createTag: (name: string, color: string) => Promise<Tag>;
  deleteTag: (id: string) => void;
  getBookTags: (bookId: string) => Tag[];
  addTagToBook: (bookId: string, tagId: string) => void;
  removeTagFromBook: (bookId: string, tagId: string) => void;
  updateReadingProgress: (bookId: string, page: number) => void;
  getFilteredBooks: () => Book[];
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  books: [],
  tags: [],
  selectedBookId: null,
  searchQuery: '',
  filterType: 'all',
  sortBy: 'recent',
  isLoading: false,
  error: null,

  loadBooks: () => {
    set({isLoading: true, error: null});
    try {
      const books = BookRepo.getAllBooks();
      set({books, isLoading: false});
    } catch (err) {
      set({error: 'Failed to load books', isLoading: false});
    }
  },

  loadTags: () => {
    try {
      const tags = TagRepo.getAllTags();
      set({tags});
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  },

  addBook: async (data: BookFormData) => {
    const book = await BookRepo.createBook(data);
    set(state => ({books: [book, ...state.books]}));
    return book;
  },

  updateBook: async (id, data) => {
    const book = await BookRepo.updateBook(id, data);
    set(state => ({
      books: state.books.map(b => (b.id === id ? book : b)),
    }));
    return book;
  },

  deleteBook: (id: string) => {
    BookRepo.deleteBook(id);
    set(state => ({
      books: state.books.filter(b => b.id !== id),
      selectedBookId: state.selectedBookId === id ? null : state.selectedBookId,
    }));
  },

  selectBook: (id: string | null) => set({selectedBookId: id}),

  setSearchQuery: (query: string) => set({searchQuery: query}),

  setFilterType: (type: 'all' | 'physical' | 'digital') => set({filterType: type}),

  setSortBy: (sort: 'recent' | 'title' | 'author' | 'rating') => set({sortBy: sort}),

  createTag: async (name: string, color: string) => {
    const tag = await TagRepo.createTag(name, color);
    set(state => ({tags: [...state.tags, tag]}));
    return tag;
  },

  deleteTag: (id: string) => {
    TagRepo.deleteTag(id);
    set(state => ({tags: state.tags.filter(t => t.id !== id)}));
  },

  getBookTags: (bookId: string) => {
    return TagRepo.getTagsForBook(bookId);
  },

  addTagToBook: (bookId: string, tagId: string) => {
    TagRepo.addTagToBook(bookId, tagId);
  },

  removeTagFromBook: (bookId: string, tagId: string) => {
    TagRepo.removeTagFromBook(bookId, tagId);
  },

  updateReadingProgress: (bookId: string, page: number) => {
    BookRepo.updateReadingProgress(bookId, page);
    set(state => ({
      books: state.books.map(b =>
        b.id === bookId ? {...b, currentPage: page, lastReadAt: Date.now()} : b,
      ),
    }));
  },

  getFilteredBooks: () => {
    const state = get();
    let books = [...state.books];

    // Search filter
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      books = books.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q),
      );
    }

    // Type filter
    if (state.filterType !== 'all') {
      books = books.filter(b => b.type === state.filterType);
    }

    // Sort
    switch (state.sortBy) {
      case 'title':
        books.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'author':
        books.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case 'rating':
        books.sort((a, b) => b.rating - a.rating);
        break;
      case 'recent':
      default:
        books.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    return books;
  },
}));
