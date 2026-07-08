import {create} from 'zustand';
import type {HighlightWithBook, VaultFilters} from '@types';
import * as HighlightRepo from '@database/repositories/HighlightRepository';

interface VaultState {
  highlights: HighlightWithBook[];
  filters: VaultFilters;
  isLoading: boolean;
  selectedHighlightId: string | null;

  // Actions
  loadHighlights: () => Promise<void>;
  setFilters: (filters: Partial<VaultFilters>) => Promise<void>;
  resetFilters: () => void;
  deleteHighlight: (id: string) => Promise<void>;
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

  loadHighlights: async () => {
    set({isLoading: true});
    try {
      const highlights = await HighlightRepo.getAllHighlights();
      set({highlights, isLoading: false});
    } catch (err) {
      set({isLoading: false});
      console.error('Failed to load highlights:', err);
    }
  },

  setFilters: async (partial: Partial<VaultFilters>) => {
    const filters = {...get().filters, ...partial};
    set({filters});
    // Auto-apply filter
    try {
      const highlights = await HighlightRepo.getFilteredHighlights(filters);
      set({highlights});
    } catch (err) {
      console.error('Failed to filter highlights:', err);
    }
  },

  resetFilters: () => {
    set({filters: {...defaultFilters}});
    get().loadHighlights();
  },

  deleteHighlight: async (id: string) => {
    await HighlightRepo.deleteHighlight(id);
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
