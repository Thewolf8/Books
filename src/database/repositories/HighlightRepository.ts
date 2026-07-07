import {db} from '../connection';
import type {Highlight, HighlightWithBook, VaultFilters} from '@types';
import uuid from 'react-native-uuid';

const rowToHighlight = (row: any): Highlight => ({
  id: row.id,
  bookId: row.book_id,
  pageNumber: row.page_number,
  selectedText: row.selected_text,
  comment: row.comment || '',
  color: row.color,
  x1: row.x1 || 0,
  y1: row.y1 || 0,
  x2: row.x2 || 0,
  y2: row.y2 || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const rowToHighlightWithBook = (row: any): HighlightWithBook => ({
  ...rowToHighlight(row),
  bookTitle: row.book_title,
  bookAuthor: row.book_author,
  bookCoverPath: row.cover_image_path,
});

export const createHighlight = async (data: Omit<Highlight, 'id' | 'createdAt' | 'updatedAt'>): Promise<Highlight> => {
  const id = uuid.v4() as string;
  const now = Date.now();

  db.execute(
    `INSERT INTO highlights (id, book_id, page_number, selected_text, comment, color, x1, y1, x2, y2, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.bookId, data.pageNumber, data.selectedText, data.comment, data.color, data.x1, data.y1, data.x2, data.y2, now, now],
  );

  return {
    id,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
};

export const updateHighlight = (id: string, updates: Partial<Pick<Highlight, 'comment' | 'color' | 'x1' | 'y1' | 'x2' | 'y2'>>): void => {
  const sets: string[] = [];
  const values: any[] = [];

  if (updates.comment !== undefined) { sets.push('comment = ?'); values.push(updates.comment); }
  if (updates.color !== undefined) { sets.push('color = ?'); values.push(updates.color); }
  if (updates.x1 !== undefined) { sets.push('x1 = ?'); values.push(updates.x1); }
  if (updates.y1 !== undefined) { sets.push('y1 = ?'); values.push(updates.y1); }
  if (updates.x2 !== undefined) { sets.push('x2 = ?'); values.push(updates.x2); }
  if (updates.y2 !== undefined) { sets.push('y2 = ?'); values.push(updates.y2); }
  if (sets.length === 0) return;

  sets.push('updated_at = ?');
  values.push(Date.now());
  values.push(id);

  db.execute(`UPDATE highlights SET ${sets.join(', ')} WHERE id = ?`, values);
};

export const deleteHighlight = (id: string): void => {
  db.execute('DELETE FROM highlights WHERE id = ?', [id]);
};

export const getHighlightById = (id: string): Highlight | null => {
  const result = db.execute('SELECT * FROM highlights WHERE id = ?', [id]);
  if (!result.rows || result.rows.length === 0) return null;
  return rowToHighlight(result.rows[0]);
};

export const getHighlightsForBook = (bookId: string): Highlight[] => {
  const result = db.execute(
    'SELECT * FROM highlights WHERE book_id = ? ORDER BY page_number ASC, created_at ASC',
    [bookId],
  );
  if (!result.rows) return [];
  return result.rows.map(rowToHighlight);
};

export const getHighlightsForPage = (bookId: string, pageNumber: number): Highlight[] => {
  const result = db.execute(
    'SELECT * FROM highlights WHERE book_id = ? AND page_number = ? ORDER BY created_at ASC',
    [bookId, pageNumber],
  );
  if (!result.rows) return [];
  return result.rows.map(rowToHighlight);
};

export const getAllHighlights = (): HighlightWithBook[] => {
  const result = db.execute(
    `SELECT h.*, b.title as book_title, b.author as book_author, b.cover_image_path
     FROM highlights h
     INNER JOIN books b ON h.book_id = b.id
     ORDER BY h.created_at DESC`,
  );
  if (!result.rows) return [];
  return result.rows.map(rowToHighlightWithBook);
};

export const getFilteredHighlights = (filters: VaultFilters): HighlightWithBook[] => {
  let sql = `SELECT h.*, b.title as book_title, b.author as book_author, b.cover_image_path
             FROM highlights h
             INNER JOIN books b ON h.book_id = b.id
             WHERE 1=1`;
  const params: any[] = [];

  if (filters.searchQuery) {
    sql += ` AND (h.selected_text LIKE ? OR h.comment LIKE ? OR b.title LIKE ?)`;
    const like = `%${filters.searchQuery}%`;
    params.push(like, like, like);
  }

  if (filters.bookId) {
    sql += ` AND h.book_id = ?`;
    params.push(filters.bookId);
  }

  if (filters.dateFrom) {
    sql += ` AND h.created_at >= ?`;
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    sql += ` AND h.created_at <= ?`;
    params.push(filters.dateTo);
  }

  // Sort
  const sortCol = filters.sortBy === 'book' ? 'b.title' : filters.sortBy === 'page' ? 'h.page_number' : 'h.created_at';
  const sortDir = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
  sql += ` ORDER BY ${sortCol} ${sortDir}`;

  const result = db.execute(sql, params);
  if (!result.rows) return [];
  return result.rows.map(rowToHighlightWithBook);
};

export const deleteHighlightsForBook = (bookId: string): void => {
  db.execute('DELETE FROM highlights WHERE book_id = ?', [bookId]);
};
