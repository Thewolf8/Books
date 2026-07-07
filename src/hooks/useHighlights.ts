import {useEffect, useState, useCallback} from 'react';
import {useVaultStore} from '@store/vaultStore';
import type {HighlightWithBook, VaultFilters} from '@types';

export const useHighlights = (bookId?: string) => {
  const highlights = useVaultStore(state => state.highlights);
  const isLoading = useVaultStore(state => state.isLoading);
  const loadHighlights = useVaultStore(state => state.loadHighlights);
  const deleteHighlight = useVaultStore(state => state.deleteHighlight);
  const setFilters = useVaultStore(state => state.setFilters);

  useEffect(() => {
    if (bookId) {
      setFilters({bookId});
    } else {
      loadHighlights();
    }
  }, [bookId]);

  const search = useCallback((query: string) => {
    setFilters({searchQuery: query});
  }, [setFilters]);

  return {
    highlights,
    isLoading,
    search,
    deleteHighlight,
    refresh: loadHighlights,
  };
};
