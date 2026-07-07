import {db} from '../connection';
import type {Tag} from '@types';
import uuid from 'react-native-uuid';

const rowToTag = (row: any): Tag => ({
  id: row.id,
  name: row.name,
  color: row.color,
  category: row.category,
  createdAt: row.created_at,
});

export const createTag = async (name: string, color: string, category: Tag['category'] = 'custom'): Promise<Tag> => {
  const id = uuid.v4() as string;
  const now = Date.now();

  db.execute(
    'INSERT INTO tags (id, name, color, category, created_at) VALUES (?, ?, ?, ?, ?)',
    [id, name, color, category, now],
  );

  return {id, name, color, category, createdAt: now};
};

export const deleteTag = (id: string): void => {
  db.execute('DELETE FROM tags WHERE id = ?', [id]);
};

export const getAllTags = (): Tag[] => {
  const result = db.execute('SELECT * FROM tags ORDER BY name ASC');
  if (!result.rows) return [];
  return result.rows.map(rowToTag);
};

export const getTagById = (id: string): Tag | null => {
  const result = db.execute('SELECT * FROM tags WHERE id = ?', [id]);
  if (!result.rows || result.rows.length === 0) return null;
  return rowToTag(result.rows[0]);
};

export const getTagByName = (name: string): Tag | null => {
  const result = db.execute('SELECT * FROM tags WHERE name = ?', [name]);
  if (!result.rows || result.rows.length === 0) return null;
  return rowToTag(result.rows[0]);
};

export const updateTag = (id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>): void => {
  const sets: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) { sets.push('name = ?'); values.push(updates.name); }
  if (updates.color !== undefined) { sets.push('color = ?'); values.push(updates.color); }
  if (sets.length === 0) return;

  values.push(id);
  db.execute(`UPDATE tags SET ${sets.join(', ')} WHERE id = ?`, values);
};

export const getTagsForBook = (bookId: string): Tag[] => {
  const result = db.execute(
    `SELECT t.* FROM tags t
     INNER JOIN book_tags bt ON t.id = bt.tag_id
     WHERE bt.book_id = ? ORDER BY t.name ASC`,
    [bookId],
  );
  if (!result.rows) return [];
  return result.rows.map(rowToTag);
};

export const addTagToBook = (bookId: string, tagId: string): void => {
  db.execute('INSERT OR IGNORE INTO book_tags (book_id, tag_id) VALUES (?, ?)', [bookId, tagId]);
};

export const removeTagFromBook = (bookId: string, tagId: string): void => {
  db.execute('DELETE FROM book_tags WHERE book_id = ? AND tag_id = ?', [bookId, tagId]);
};
