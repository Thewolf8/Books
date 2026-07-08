import {create} from 'zustand';
import type {Highlight} from '@types';
import * as HighlightRepo from '@database/repositories/HighlightRepository';

interface ReaderState {
  currentBookId: string | null;
  currentPage: number;
  totalPages: number;
  highlights: Highlight[];
  isAnnotating: boolean;
  selectedHighlightId: string | null;
  showHighlightsPanel: boolean;

  // Actions
  setCurrentBook: (bookId: string, totalPages: number, lastPage: number) => void;
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  loadHighlights: (bookId: string, pageNumber?: number) => Promise<void>;
  addHighlight: (data: Omit<Highlight, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Highlight>;
  updateHighlight: (id: string, updates: Partial<Pick<Highlight, 'comment' | 'color'>>) => Promise<void>;
  deleteHighlight: (id: string) => Promise<void>;
  setIsAnnotating: (value: boolean) => void;
  setSelectedHighlightId: (id: string | null) => void;
  setShowHighlightsPanel: (value: boolean) => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  currentBookId: null,
  currentPage: 1,
  totalPages: 1,
  highlights: [],
  isAnnotating: false,
  selectedHighlightId: null,
  showHighlightsPanel: false,

  setCurrentBook: (bookId, totalPages, lastPage) => {
    set({
      currentBookId: bookId,
      totalPages,
      currentPage: lastPage || 1,
      highlights: [],
    });
    get().loadHighlights(bookId);
  },

  setCurrentPage: (page: number) => {
    const {totalPages} = get();
    const clamped = Math.max(1, Math.min(page, totalPages));
    set({currentPage: clamped});
    get().loadHighlights(get().currentBookId!, clamped);
  },

  nextPage: () => {
    const {currentPage, totalPages} = get();
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      set({currentPage: next});
      get().loadHighlights(get().currentBookId!, next);
    }
  },

  prevPage: () => {
    const {currentPage} = get();
    if (currentPage > 1) {
      const prev = currentPage - 1;
      set({currentPage: prev});
      get().loadHighlights(get().currentBookId!, prev);
    }
  },

  loadHighlights: async (bookId: string, pageNumber?: number) => {
    try {
      const highlights = pageNumber
        ? await HighlightRepo.getHighlightsForPage(bookId, pageNumber)
        : await HighlightRepo.getHighlightsForBook(bookId);
      set({highlights});
    } catch (err) {
      console.error('Failed to load highlights:', err);
    }
  },

  addHighlight: async data => {
    const highlight = await HighlightRepo.createHighlight(data);
    set(state => ({highlights: [...state.highlights, highlight]}));
    return highlight;
  },

  updateHighlight: async (id, updates) => {
    await HighlightRepo.updateHighlight(id, updates);
    set(state => ({
      highlights: state.highlights.map(h =>
        h.id === id ? {...h, ...updates, updatedAt: Date.now()} : h,
      ),
    }));
  },

  deleteHighlight: async (id: string) => {
    await HighlightRepo.deleteHighlight(id);
    set(state => ({
      highlights: state.highlights.filter(h => h.id !== id),
      selectedHighlightId: state.selectedHighlightId === id ? null : state.selectedHighlightId,
    }));
  },

  setIsAnnotating: (value: boolean) => set({isAnnotating: value}),
  setSelectedHighlightId: (id: string | null) => set({selectedHighlightId: id}),
  setShowHighlightsPanel: (value: boolean) => set({showHighlightsPanel: value}),
}));
