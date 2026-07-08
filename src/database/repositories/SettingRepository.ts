import {db} from '../connection';
import type {AppSettings, Language, ThemeMode, CustomColors, FontSettings} from '@types';

export const saveSetting = async (key: string, value: string): Promise<void> => {
  await db.execute(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value],
  );
};

export const getSetting = async (key: string): Promise<string | null> => {
  const result = await db.execute('SELECT value FROM settings WHERE key = ?', [key]);
  if (!result.rows || result.rows.length === 0) return null;
  return result.rows[0].value;
};

export const loadStoredSettings = async (): Promise<Partial<AppSettings>> => {
  const settings: Partial<AppSettings> = {};

  const theme = await getSetting('theme');
  if (theme) settings.theme = theme as ThemeMode;

  const language = await getSetting('language');
  if (language) settings.language = language as Language;

  const customColors = await getSetting('customColors');
  if (customColors) {
    try { settings.customColors = JSON.parse(customColors) as CustomColors; } catch {}
  }

  const fonts = await getSetting('fonts');
  if (fonts) {
    try { settings.fonts = JSON.parse(fonts) as FontSettings; } catch {}
  }

  return settings;
};

export const saveAllSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await saveSetting('theme', settings.theme);
    await saveSetting('language', settings.language);
    if (settings.customColors) {
      await saveSetting('customColors', JSON.stringify(settings.customColors));
    }
    if (settings.fonts) {
      await saveSetting('fonts', JSON.stringify(settings.fonts));
    }
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
};
