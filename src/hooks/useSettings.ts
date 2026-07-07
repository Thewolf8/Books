import {useCallback} from 'react';
import {useAppStore} from '@store/appStore';
import type {Language, ThemeMode, CustomColors, FontSettings} from '@types';

export const useSettings = () => {
  const theme = useAppStore(state => state.theme);
  const language = useAppStore(state => state.language);
  const customColors = useAppStore(state => state.customColors);
  const fonts = useAppStore(state => state.fonts);
  const setTheme = useAppStore(state => state.setTheme);
  const setLanguage = useAppStore(state => state.setLanguage);
  const setCustomColors = useAppStore(state => state.setCustomColors);
  const setFonts = useAppStore(state => state.setFonts);
  const resetSettings = useAppStore(state => state.resetSettings);

  const updateTheme = useCallback((newTheme: ThemeMode) => {
    setTheme(newTheme);
  }, [setTheme]);

  const updateLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
  }, [setLanguage]);

  const updateCustomColors = useCallback((colors: CustomColors | null) => {
    setCustomColors(colors);
  }, [setCustomColors]);

  const updateFonts = useCallback((newFonts: FontSettings | null) => {
    setFonts(newFonts);
  }, [setFonts]);

  return {
    theme,
    language,
    customColors,
    fonts,
    updateTheme,
    updateLanguage,
    updateCustomColors,
    updateFonts,
    resetSettings,
  };
};
