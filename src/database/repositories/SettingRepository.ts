import {db} from '../connection';
import type {AppSettings, Language, ThemeMode, CustomColors, FontSettings} from '@types';

export const saveSetting = (key: string, value: string): void => {
  db.execute(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value],
  );
};

export const getSetting = (key: string): string | null => {
  const result = db.execute('SELECT value FROM settings WHERE key = ?', [key]);
  if (!result.rows || result.rows.length === 0) return null;
  return result.rows[0].value;
};

export const loadStoredSettings = (): Partial<AppSettings> => {
  const settings: Partial<AppSettings> = {};

  const theme = getSetting('theme');
  if (theme) settings.theme = theme as ThemeMode;

  const language = getSetting('language');
  if (language) settings.language = language as Language;

  const customColors = getSetting('customColors');
  if (customColors) {
    try { settings.customColors = JSON.parse(customColors) as CustomColors; } catch {}
  }

  const fonts = getSetting('fonts');
  if (fonts) {
    try { settings.fonts = JSON.parse(fonts) as FontSettings; } catch {}
  }

  return settings;
};

export const saveAllSettings = (settings: AppSettings): void => {
  db.execute('BEGIN TRANSACTION');
  try {
    saveSetting('theme', settings.theme);
    saveSetting('language', settings.language);
    if (settings.customColors) {
      saveSetting('customColors', JSON.stringify(settings.customColors));
    }
    if (settings.fonts) {
      saveSetting('fonts', JSON.stringify(settings.fonts));
    }
    db.execute('COMMIT');
  } catch {
    db.execute('ROLLBACK');
  }
};
