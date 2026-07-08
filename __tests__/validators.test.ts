/**
 * @format
 */

import {
  validateBookForm,
  sanitizeFilename,
  formatDate,
  truncateText,
} from '../src/utils/validators';

describe('validateBookForm', () => {
  it('requires a title', () => {
    expect(validateBookForm('', 'Author')).toBe('Title is required');
  });

  it('requires an author', () => {
    expect(validateBookForm('Title', '')).toBe('Author is required');
  });

  it('returns null when valid', () => {
    expect(validateBookForm('Title', 'Author')).toBeNull();
  });
});

describe('sanitizeFilename', () => {
  it('strips unsafe characters', () => {
    expect(sanitizeFilename('my/book*name?.pdf')).toBe('mybooknamepdf');
  });
});

describe('truncateText', () => {
  it('leaves short text untouched', () => {
    expect(truncateText('short', 10)).toBe('short');
  });

  it('truncates long text with ellipsis', () => {
    expect(truncateText('this is a long string', 10)).toBe('this is...');
  });
});

describe('formatDate', () => {
  it('formats a timestamp as a readable date string', () => {
    const result = formatDate(new Date('2026-01-15').getTime());
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
