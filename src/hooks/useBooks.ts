import {useEffect, useState, useCallback} from 'react';
import {useLibraryStore} from '@store/libraryStore';
import type {Book, BookFormData, Tag} from '@types';

export const useBooks = () => {
  const [isLoading, setIsLoading] = useState(true);
  const books = useLibraryStore(state => state.books);
  const loadBooks = useLibraryStore(state => state.loadBooks);
  const addBook = useLibraryStore(state => state.addBook);
  const updateBook = useLibraryStore(state => state.updateBook);
  const deleteBook = useLibraryStore(state => state.deleteBook);
  const getBookTags = useLibraryStore(state => state.getBookTags);

  useEffect(() => {
    loadBooks();
    setIsLoading(false);
  }, []);

  const getBookWithTags = useCallback((bookId: string): {book: Book | null; tags: Tag[]} => {
    const book = books.find(b => b.id === bookId) || null;
    const tags = book ? getBookTags(bookId) : [];
    return {book, tags};
  }, [books, getBookTags]);

  return {
    books,
    isLoading,
    addBook,
    updateBook,
    deleteBook,
    getBookWithTags,
    refresh: loadBooks,
  };
};

export const useBook = (bookId: string | null) => {
  const books = useLibraryStore(state => state.books);
  const getBookTags = useLibraryStore(state => state.getBookTags);
  const [tags, setTags] = useState<Tag[]>([]);

  const book = bookId ? books.find(b => b.id === bookId) || null : null;

  useEffect(() => {
    if (bookId) {
      const bookTags = getBookTags(bookId);
      setTags(bookTags);
    }
  }, [bookId, getBookTags]);

  return {book, tags};
};
