import {db} from '../connection';
import type {Book, BookFormData} from '@types';
import uuid from 'react-native-uuid';

const rowToBook = (row: any): Book => ({
  id: row.id,
  title: row.title,
  author: row.author,
  description: row.description || '',
  coverImagePath: row.cover_image_path,
  type: row.type as Book['type'],
  filePath: row.file_path,
  totalPages: row.total_pages || 0,
  currentPage: row.current_page || 0,
  summary: row.summary || '',
  review: row.review || '',
  rating: row.rating || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  lastReadAt: row.last_read_at,
});

export const createBook = async (data: BookFormData): Promise<Book> => {
  const id = uuid.v4() as string;
  const now = Date.now();

  await db.execute(
    `INSERT INTO books (id, title, author, description, cover_image_path, type, file_path, total_pages, current_page, summary, review, rating, created_at, updated_at, last_read_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, NULL)`,
    [
      id,
      data.title,
      data.author,
      data.description || '',
      data.coverImagePath,
      data.type,
      data.filePath,
      data.totalPages || 0,
      data.summary || '',
      data.review || '',
      data.rating || 0,
      now,
      now,
    ],
  );

  // Insert tags
  if (data.tags && data.tags.length > 0) {
    for (const tagId of data.tags) {
      await db.execute('INSERT OR IGNORE INTO book_tags (book_id, tag_id) VALUES (?, ?)', [id, tagId]);
    }
  }

  return (await getBookById(id))!;
};

export const updateBook = async (id: string, data: Partial<BookFormData>): Promise<Book> => {
  const now = Date.now();
  const sets: string[] = [];
  const values: any[] = [];

  if (data.title !== undefined) { sets.push('title = ?'); values.push(data.title); }
  if (data.author !== undefined) { sets.push('author = ?'); values.push(data.author); }
  if (data.description !== undefined) { sets.push('description = ?'); values.push(data.description); }
  if (data.coverImagePath !== undefined) { sets.push('cover_image_path = ?'); values.push(data.coverImagePath); }
  if (data.type !== undefined) { sets.push('type = ?'); values.push(data.type); }
  if (data.filePath !== undefined) { sets.push('file_path = ?'); values.push(data.filePath); }
  if (data.totalPages !== undefined) { sets.push('total_pages = ?'); values.push(data.totalPages); }
  if (data.summary !== undefined) { sets.push('summary = ?'); values.push(data.summary); }
  if (data.review !== undefined) { sets.push('review = ?'); values.push(data.review); }
  if (data.rating !== undefined) { sets.push('rating = ?'); values.push(data.rating); }
  sets.push('updated_at = ?'); values.push(now);
  values.push(id);

  await db.execute(`UPDATE books SET ${sets.join(', ')} WHERE id = ?`, values);

  // Update tags if provided
  if (data.tags !== undefined) {
    await db.execute('DELETE FROM book_tags WHERE book_id = ?', [id]);
    for (const tagId of data.tags) {
      await db.execute('INSERT OR IGNORE INTO book_tags (book_id, tag_id) VALUES (?, ?)', [id, tagId]);
    }
  }

  return (await getBookById(id))!;
};

export const deleteBook = async (id: string): Promise<void> => {
  await db.execute('DELETE FROM books WHERE id = ?', [id]);
};

export const getBookById = async (id: string): Promise<Book | null> => {
  const result = await db.execute('SELECT * FROM books WHERE id = ?', [id]);
  if (!result.rows || result.rows.length === 0) return null;
  return rowToBook(result.rows[0]);
};

export const getAllBooks = async (): Promise<Book[]> => {
  const result = await db.execute('SELECT * FROM books ORDER BY updated_at DESC');
  if (!result.rows) return [];
  return result.rows.map(rowToBook);
};

export const getBooksByType = async (type: Book['type']): Promise<Book[]> => {
  const result = await db.execute('SELECT * FROM books WHERE type = ? ORDER BY updated_at DESC', [type]);
  if (!result.rows) return [];
  return result.rows.map(rowToBook);
};

export const searchBooks = async (query: string): Promise<Book[]> => {
  const like = `%${query}%`;
  const result = await db.execute(
    'SELECT * FROM books WHERE title LIKE ? OR author LIKE ? ORDER BY title ASC',
    [like, like],
  );
  if (!result.rows) return [];
  return result.rows.map(rowToBook);
};

export const updateReadingProgress = async (id: string, currentPage: number): Promise<void> => {
  await db.execute(
    'UPDATE books SET current_page = ?, last_read_at = ?, updated_at = ? WHERE id = ?',
    [currentPage, Date.now(), Date.now(), id],
  );
};

export const getBookTags = async (bookId: string) => {
  const result = await db.execute(
    `SELECT t.* FROM tags t
     INNER JOIN book_tags bt ON t.id = bt.tag_id
     WHERE bt.book_id = ?`,
    [bookId],
  );
  return result.rows || [];
};

export const getBooksWithTag = async (tagId: string): Promise<Book[]> => {
  const result = await db.execute(
    `SELECT b.* FROM books b
     INNER JOIN book_tags bt ON b.id = bt.book_id
     WHERE bt.tag_id = ? ORDER BY b.updated_at DESC`,
    [tagId],
  );
  if (!result.rows) return [];
  return result.rows.map(rowToBook);
};
