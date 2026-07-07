/**
 * Validate a book form
 */
export const validateBookForm = (title: string, author: string): string | null => {
  if (!title.trim()) return 'Title is required';
  if (!author.trim()) return 'Author is required';
  if (title.length > 200) return 'Title must be less than 200 characters';
  if (author.length > 200) return 'Author must be less than 200 characters';
  return null;
};

/**
 * Sanitize a filename
 */
export const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9\u0600-\u06FF\u00C0-\u017F\s-]/g, '').trim();
};

/**
 * Format a date for display
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Truncate text to a maximum length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};
