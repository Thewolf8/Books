import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {I18nManager} from 'react-native';
import RNLocalize from 'react-native-localize';
import en from './en.json';
import ar from './ar.json';
import fr from './fr.json';

const resources = {
  en: {translation: en},
  ar: {translation: ar},
  fr: {translation: fr},
};

// Detect system language
const getSystemLanguage = (): string => {
  const locales = RNLocalize.getLocales();
  const lang = locales[0]?.languageCode;
  if (lang === 'ar') return 'ar';
  if (lang === 'fr') return 'fr';
  return 'en';
};

const isRTL = (lang: string) => lang === 'ar';

i18n.use(initReactI18next).init({
  resources,
  lng: getSystemLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Listen for language changes to update RTL
i18n.on('languageChanged', (lng) => {
  const shouldBeRTL = isRTL(lng);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
  }
});

export default i18n;
export const SUPPORTED_LANGUAGES = [
  {code: 'en', label: 'English', isRTL: false},
  {code: 'ar', label: 'العربية', isRTL: true},
  {code: 'fr', label: 'Français', isRTL: false},
] as const;
