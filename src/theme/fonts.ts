import {Platform} from 'react-native';
import type {Language, FontSettings} from '@types';

export interface FontTheme {
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
  italic: string;
}

export const defaultFonts: Record<Language, FontTheme> = {
  en: {
    regular: Platform.select({ios: 'System', android: 'Roboto', default: 'System'}),
    medium: Platform.select({ios: 'System', android: 'Roboto', default: 'System'}),
    semibold: Platform.select({ios: 'System', android: 'Roboto', default: 'System'}),
    bold: Platform.select({ios: 'System', android: 'Roboto', default: 'System'}),
    italic: Platform.select({ios: 'System', android: 'Roboto', default: 'System'}),
  },
  ar: {
    regular: Platform.select({ios: 'GeezaPro', android: 'NotoNaskhArabic', default: 'System'}),
    medium: Platform.select({ios: 'GeezaPro', android: 'NotoNaskhArabic', default: 'System'}),
    semibold: Platform.select({ios: 'GeezaPro', android: 'NotoNaskhArabic', default: 'System'}),
    bold: Platform.select({ios: 'GeezaPro', android: 'NotoNaskhArabic', default: 'System'}),
    italic: Platform.select({ios: 'GeezaPro', android: 'NotoNaskhArabic', default: 'System'}),
  },
  fr: {
    regular: Platform.select({ios: 'System', android: 'Roboto', default: 'System'}),
    medium: Platform.select({ios: 'System', android: 'Roboto', default: 'System'}),
    semibold: Platform.select({ios: 'System', android: 'Roboto', default: 'System'}),
    bold: Platform.select({ios: 'System', android: 'Roboto', default: 'System'}),
    italic: Platform.select({ios: 'System', android: 'Roboto', default: 'System'}),
  },
};

// Available custom fonts (user can add their own .ttf files to assets/fonts)
export const availableFonts = [
  {label: 'System Default', value: 'System'},
  {label: 'Roboto', value: 'Roboto'},
  {label: 'Merriweather', value: 'Merriweather'},
  {label: 'Open Sans', value: 'OpenSans'},
  {label: 'Lato', value: 'Lato'},
  {label: 'Playfair Display', value: 'PlayfairDisplay'},
  // Arabic fonts
  {label: 'Noto Naskh Arabic', value: 'NotoNaskhArabic'},
  {label: 'Amiri', value: 'Amiri'},
  {label: 'Cairo', value: 'Cairo'},
  {label: 'Tajawal', value: 'Tajawal'},
  {label: 'Almarai', value: 'Almarai'},
];

export const getFontsForLanguage = (lang: Language, customFonts?: FontSettings | null): FontTheme => {
  const base = defaultFonts[lang];

  if (customFonts) {
    const customFont = lang === 'ar' ? customFonts.arabicFont : lang === 'fr' ? customFonts.frenchFont : customFonts.englishFont;
    if (customFont && customFont !== 'System') {
      return {
        regular: customFont,
        medium: customFont,
        semibold: customFont,
        bold: customFont,
        italic: customFont,
      };
    }
  }

  return base;
};
