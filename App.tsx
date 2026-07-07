import React, {useEffect, useState} from 'react';
import {StatusBar, View, ActivityIndicator, StyleSheet, I18nManager} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import './src/i18n';
import {AppNavigator} from '@navigation/AppNavigator';
import {ThemeProvider} from '@theme/ThemeProvider';
import {initializeDatabase} from '@database/init';
import {useAppStore} from '@store/appStore';
import {loadStoredSettings} from '@database/repositories/SettingRepository';
import RNLocalize from 'react-native-localize';

const AppContent: React.FC = () => {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const setLanguage = useAppStore(state => state.setLanguage);
  const setTheme = useAppStore(state => state.setTheme);
  const setCustomColors = useAppStore(state => state.setCustomColors);
  const setFonts = useAppStore(state => state.setFonts);
  const language = useAppStore(state => state.language);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize database first
        await initializeDatabase();

        // Load stored settings
        const settings = await loadStoredSettings();

        if (settings.language) {
          setLanguage(settings.language);
        } else {
          // Default to system language
          const locales = RNLocalize.getLocales();
          const sysLang = locales[0]?.languageCode;
          if (sysLang === 'ar') setLanguage('ar');
          else if (sysLang === 'fr') setLanguage('fr');
          else setLanguage('en');
        }

        if (settings.theme) setTheme(settings.theme);
        if (settings.customColors) setCustomColors(settings.customColors);
        if (settings.fonts) setFonts(settings.fonts);
      } catch (err) {
        console.error('App initialization error:', err);
      } finally {
        setIsReady(true);
      }
    };

    init();
  }, []);

  // Force RTL for Arabic
  useEffect(() => {
    const isRTL = language === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
    }
  }, [language]);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <StatusBar barStyle="default" />
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});

export default App;
