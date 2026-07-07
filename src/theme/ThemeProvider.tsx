import React, {createContext, useContext, useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {useAppStore} from '@store/appStore';
import {getColorsForTheme} from './colors';
import {getFontsForLanguage} from './fonts';
import type {ColorTheme} from './colors';
import type {FontTheme} from './fonts';

interface ThemeContextType {
  colors: ColorTheme;
  fonts: FontTheme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const theme = useAppStore(state => state.theme);
  const language = useAppStore(state => state.language);
  const customColors = useAppStore(state => state.customColors);
  const fonts = useAppStore(state => state.fonts);
  const systemColorScheme = useColorScheme();

  const isDark = useMemo(() => {
    if (theme === 'system') return systemColorScheme === 'dark';
    return theme === 'dark';
  }, [theme, systemColorScheme]);

  const colors = useMemo(
    () => getColorsForTheme(isDark ? 'dark' : 'light', customColors),
    [isDark, customColors],
  );

  const currentFonts = useMemo(
    () => getFontsForLanguage(language, fonts),
    [language, fonts],
  );

  const value = useMemo(
    () => ({colors, fonts: currentFonts, isDark}),
    [colors, currentFonts, isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
