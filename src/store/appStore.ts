import {create} from 'zustand';
import type {Language, ThemeMode, CustomColors, FontSettings} from '@types';
import {saveSetting} from '@database/repositories/SettingRepository';
import i18n from '@i18n';

interface AppState {
  // Settings
  theme: ThemeMode;
  language: Language;
  customColors: CustomColors | null;
  fonts: FontSettings | null;

  // Actions
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: Language) => void;
  setCustomColors: (colors: CustomColors | null) => void;
  setFonts: (fonts: FontSettings | null) => void;
  resetSettings: () => void;
}

export const useAppStore = create<AppState>(set => ({
  theme: 'system',
  language: 'en',
  customColors: null,
  fonts: null,

  setTheme: theme => {
    set({theme});
    saveSetting('theme', theme);
  },

  setLanguage: language => {
    set({language});
    saveSetting('language', language);
    i18n.changeLanguage(language);
  },

  setCustomColors: colors => {
    set({customColors: colors});
    if (colors) {
      saveSetting('customColors', JSON.stringify(colors));
    } else {
      saveSetting('customColors', '');
    }
  },

  setFonts: fonts => {
    set({fonts});
    if (fonts) {
      saveSetting('fonts', JSON.stringify(fonts));
    } else {
      saveSetting('fonts', '');
    }
  },

  resetSettings: () => {
    const defaults = {theme: 'system' as ThemeMode, language: 'en' as Language, customColors: null, fonts: null};
    set(defaults);
    saveSetting('theme', defaults.theme);
    saveSetting('language', defaults.language);
    saveSetting('customColors', '');
    saveSetting('fonts', '');
    i18n.changeLanguage(defaults.language);
  },
}));
