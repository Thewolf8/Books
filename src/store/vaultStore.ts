import {create} from 'zustand';
import type {HighlightWithBook, VaultFilters} from '@types';
import * as HighlightRepo from '@database/repositories/HighlightRepository';

interface VaultState {
  highlights: HighlightWithBook[];
  filters: VaultFilters;
  isLoading: boolean;
  selectedHighlightId: string | null;

  // Actions
  loadHighlights: () => void;
  setFilters: (filters: Partial<VaultFilters>) => void;
  resetFilters: () => void;
  deleteHighlight: (id: string) => void;
  setSelectedHighlightId: (id: string | null) => void;
  searchHighlights: (query: string) => void;
}

const defaultFilters: VaultFilters = {
  searchQuery: '',
  bookId: null,
  tagIds: [],
  dateFrom: null,
  dateTo: null,
  sortBy: 'date',
  sortOrder: 'desc',
};

export const useVaultStore = create<VaultState>((set, get) => ({
  highlights: [],
  filters: {...defaultFilters},
  isLoading: false,
  selectedHighlightId: null,

  loadHighlights: () => {
    set({isLoading: true});
    try {
      const highlights = HighlightRepo.getAllHighlights();
      set({highlights, isLoading: false});
    } catch (err) {
      set({isLoading: false});
      console.error('Failed to load highlights:', err);
    }
  },

  setFilters: (partial: Partial<VaultFilters>) => {
    set(state => {
      const filters = {...state.filters, ...partial};
      // Auto-apply filter
      try {
        const highlights = HighlightRepo.getFilteredHighlights(filters);
        return {filters, highlights};
      } catch {
        return {filters};
      }
    });
  },

  resetFilters: () => {
    set({filters: {...defaultFilters}});
    get().loadHighlights();
  },

  deleteHighlight: (id: string) => {
    HighlightRepo.deleteHighlight(id);
    set(state => ({
      highlights: state.highlights.filter(h => h.id !== id),
      selectedHighlightId: state.selectedHighlightId === id ? null : state.selectedHighlightId,
    }));
  },

  setSelectedHighlightId: (id: string | null) => set({selectedHighlightId: id}),

  searchHighlights: (query: string) => {
    get().setFilters({searchQuery: query});
  },
}));
