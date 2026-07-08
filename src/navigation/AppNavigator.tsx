import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import {Platform} from 'react-native';
import {useTheme} from '@theme/ThemeProvider';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {LibraryScreen} from '@screens/LibraryScreen';
import {AddBookScreen} from '@screens/AddBookScreen';
import {BookDetailScreen} from '@screens/BookDetailScreen';
import {ReaderScreen} from '@screens/ReaderScreen';
import {VaultScreen} from '@screens/VaultScreen';
import {SettingsScreen} from '@screens/SettingsScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  AddBook: {bookId?: string} | undefined;
  BookDetail: {bookId: string};
  Reader: {bookId: string};
};

export type MainTabParamList = {
  Library: undefined;
  Vault: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
  const {t} = useTranslation();
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 80 + insets.bottom : 60 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? 20 + insets.bottom : 8 + insets.bottom,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: t('navigation.library'),
          tabBarIcon: ({color, size}) => (
            <Icon name="library-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Vault"
        component={VaultScreen}
        options={{
          tabBarLabel: t('navigation.vault'),
          tabBarIcon: ({color, size}) => (
            <Icon name="bookmark-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('navigation.settings'),
          tabBarIcon: ({color, size}) => (
            <Icon name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const {colors} = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddBook"
        component={AddBookScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Reader"
        component={ReaderScreen}
        options={{
          headerShown: false,
          animation: 'fade',
        }}
      />
    </Stack.Navigator>
  );
};
