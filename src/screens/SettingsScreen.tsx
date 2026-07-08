import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '@theme/ThemeProvider';
import {useAppStore} from '@store/appStore';
import {SUPPORTED_LANGUAGES} from '@i18n';
import type {Language, ThemeMode} from '@types';

const THEME_OPTIONS: {key: ThemeMode; label: string; icon: string}[] = [
  {key: 'light', label: 'themeLight', icon: 'sunny-outline'},
  {key: 'dark', label: 'themeDark', icon: 'moon-outline'},
  {key: 'system', label: 'themeSystem', icon: 'phone-portrait-outline'},
];

const HIGHLIGHT_COLOR_PRESETS = [
  '#fbbf24', '#f87171', '#34d399', '#60a5fa', '#a78bfa', '#f472b6',
  '#fb923c', '#2dd4bf', '#e879f9', '#facc15', '#4ade80', '#38bdf8',
];

const FONT_OPTIONS = [
  {label: 'System Default', value: 'System'},
  {label: 'Merriweather', value: 'Merriweather'},
  {label: 'Open Sans', value: 'OpenSans'},
  {label: 'Lato', value: 'Lato'},
  {label: 'Playfair Display', value: 'PlayfairDisplay'},
];

const ARABIC_FONTS = [
  {label: 'System Default', value: 'System'},
  {label: 'Noto Naskh Arabic', value: 'NotoNaskhArabic'},
  {label: 'Amiri', value: 'Amiri'},
  {label: 'Cairo', value: 'Cairo'},
  {label: 'Tajawal', value: 'Tajawal'},
  {label: 'Almarai', value: 'Almarai'},
];

export const SettingsScreen: React.FC = () => {
  const {t} = useTranslation();
  const {colors, fonts} = useTheme();

  const theme = useAppStore(state => state.theme);
  const language = useAppStore(state => state.language);
  const customColors = useAppStore(state => state.customColors);
  const fontSettings = useAppStore(state => state.fonts);
  const setTheme = useAppStore(state => state.setTheme);
  const setLanguage = useAppStore(state => state.setLanguage);
  const setCustomColors = useAppStore(state => state.setCustomColors);
  const setFonts = useAppStore(state => state.setFonts);
  const resetSettings = useAppStore(state => state.resetSettings);

  const [showLangModal, setShowLangModal] = useState(false);
  const [showFontModal, setShowFontModal] = useState<'english' | 'arabic' | 'french' | null>(null);
  const [showPageColorPicker, setShowPageColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightColorPicker, setShowHighlightColorPicker] = useState(false);

  const handleReset = () => {
    Alert.alert(
      t('settings.resetAll'),
      t('settings.resetConfirm'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {text: t('common.confirm'), onPress: resetSettings},
      ],
    );
  };

  const handleResetColors = () => {
    setCustomColors(null);
  };

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === language);

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, {color: colors.textMuted, fontFamily: fonts.medium}]}>
        {title}
      </Text>
      <View style={[styles.sectionCard, {backgroundColor: colors.surface}]}>
        {children}
      </View>
    </View>
  );

  const renderColorCircle = (color: string, onPress: () => void, isSelected: boolean) => (
    <TouchableOpacity
      key={color}
      onPress={onPress}
      style={[
        styles.colorCircle,
        {backgroundColor: color},
        isSelected && styles.colorCircleSelected,
      ]}>
      {isSelected && <Icon name="checkmark" size={16} color="#fff" />}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, {color: colors.text, fontFamily: fonts.bold}]}>
            {t('settings.title')}
          </Text>
        </View>

        {/* Language */}
        {renderSection(t('settings.language'), (
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowLangModal(true)}>
            <View style={styles.settingInfo}>
              <Icon name="language-outline" size={22} color={colors.primary} />
              <Text style={[styles.settingLabel, {color: colors.text}]}>
                {t('settings.language')}
              </Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={[styles.valueText, {color: colors.textSecondary}]}>
                {currentLang?.label || 'English'}
              </Text>
              <Icon name="chevron-forward" size={18} color={colors.textMuted} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Theme */}
        {renderSection(t('settings.theme'), (
          <View style={styles.themeGrid}>
            {THEME_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.themeBtn,
                  theme === opt.key && {backgroundColor: colors.primary + '20', borderColor: colors.primary},
                  {borderColor: colors.border},
                ]}
                onPress={() => setTheme(opt.key)}>
                <Icon
                  name={opt.icon}
                  size={24}
                  color={theme === opt.key ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.themeBtnText,
                    {color: theme === opt.key ? colors.primary : colors.text},
                    {fontFamily: fonts.medium},
                  ]}>
                  {t(`settings.${opt.label}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Custom Colors */}
        {renderSection(t('settings.customColors'), (
          <View>
            {/* Page Background */}
            <View style={styles.colorRow}>
              <Text style={[styles.colorLabel, {color: colors.text}]}>{t('settings.pageBackground')}</Text>
              <View style={styles.colorRowRight}>
                <View
                  style={[styles.colorPreview, {backgroundColor: customColors?.pageBackground || colors.readerBackground}]}
                />
                <TouchableOpacity onPress={() => setShowPageColorPicker(true)}>
                  <Text style={[styles.colorAction, {color: colors.primary}]}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.rowDivider, {backgroundColor: colors.divider}]} />

            {/* Text Color */}
            <View style={styles.colorRow}>
              <Text style={[styles.colorLabel, {color: colors.text}]}>{t('settings.textColor')}</Text>
              <View style={styles.colorRowRight}>
                <View
                  style={[styles.colorPreview, {backgroundColor: customColors?.textColor || colors.readerText}]}
                />
                <TouchableOpacity onPress={() => setShowTextColorPicker(true)}>
                  <Text style={[styles.colorAction, {color: colors.primary}]}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.rowDivider, {backgroundColor: colors.divider}]} />

            {/* Highlight Color */}
            <View style={styles.colorRow}>
              <Text style={[styles.colorLabel, {color: colors.text}]}>{t('settings.highlightColor')}</Text>
              <View style={styles.colorRowRight}>
                <View
                  style={[styles.colorPreview, {backgroundColor: customColors?.highlightColor || HIGHLIGHT_COLOR_PRESETS[0]}]}
                />
                <TouchableOpacity onPress={() => setShowHighlightColorPicker(true)}>
                  <Text style={[styles.colorAction, {color: colors.primary}]}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.rowDivider, {backgroundColor: colors.divider}]} />

            <TouchableOpacity style={styles.resetColorsBtn} onPress={handleResetColors}>
              <Text style={[styles.resetColorsText, {color: colors.error}]}>
                {t('settings.resetColors')}
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Typography */}
        {renderSection(t('settings.typography'), (
          <View>
            <TouchableOpacity
              style={styles.fontRow}
              onPress={() => setShowFontModal('english')}>
              <Text style={[styles.fontLabel, {color: colors.text}]}>{t('settings.englishFont')}</Text>
              <View style={styles.fontValue}>
                <Text style={[styles.fontValueText, {color: colors.textSecondary}]}>
                  {fontSettings?.englishFont || 'System'}
                </Text>
                <Icon name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </TouchableOpacity>

            <View style={[styles.rowDivider, {backgroundColor: colors.divider}]} />

            <TouchableOpacity
              style={styles.fontRow}
              onPress={() => setShowFontModal('arabic')}>
              <Text style={[styles.fontLabel, {color: colors.text}]}>{t('settings.arabicFont')}</Text>
              <View style={styles.fontValue}>
                <Text style={[styles.fontValueText, {color: colors.textSecondary}]}>
                  {fontSettings?.arabicFont || 'System'}
                </Text>
                <Icon name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </TouchableOpacity>

            <View style={[styles.rowDivider, {backgroundColor: colors.divider}]} />

            <TouchableOpacity
              style={styles.fontRow}
              onPress={() => setShowFontModal('french')}>
              <Text style={[styles.fontLabel, {color: colors.text}]}>{t('settings.frenchFont')}</Text>
              <View style={styles.fontValue}>
                <Text style={[styles.fontValueText, {color: colors.textSecondary}]}>
                  {fontSettings?.frenchFont || 'System'}
                </Text>
                <Icon name="chevron-forward" size={18} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          </View>
        ))}

        {/* Reset */}
        <TouchableOpacity
          style={[styles.resetBtn, {backgroundColor: colors.surface}]}
          onPress={handleReset}>
          <Icon name="refresh-outline" size={20} color={colors.error} />
          <Text style={[styles.resetText, {color: colors.error}]}>{t('settings.resetAll')}</Text>
        </TouchableOpacity>

        {/* About */}
        <View style={styles.aboutContainer}>
          <Text style={[styles.aboutVersion, {color: colors.textMuted}]}>{t('settings.version')}</Text>
          <Text style={[styles.aboutText, {color: colors.textMuted}]}>{t('settings.madeWith')}</Text>
        </View>

        <View style={{height: 40}} />
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={showLangModal} transparent animationType="slide" onRequestClose={() => setShowLangModal(false)}>
        <View style={[styles.modalOverlay, {backgroundColor: colors.overlay}]}>
          <View style={[styles.modalPanel, {backgroundColor: colors.surface}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: colors.text, fontFamily: fonts.semibold}]}>
                {t('settings.language')}
              </Text>
              <TouchableOpacity onPress={() => setShowLangModal(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            {SUPPORTED_LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langItem, language === lang.code && {backgroundColor: colors.surfaceHighlight}]}
                onPress={() => {
                  setLanguage(lang.code as Language);
                  setShowLangModal(false);
                }}>
                <Text style={[styles.langText, {color: colors.text}]}>{lang.label}</Text>
                {language === lang.code && <Icon name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Font Modal */}
      <Modal visible={!!showFontModal} transparent animationType="slide" onRequestClose={() => setShowFontModal(null)}>
        <View style={[styles.modalOverlay, {backgroundColor: colors.overlay}]}>
          <View style={[styles.modalPanel, {backgroundColor: colors.surface}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: colors.text, fontFamily: fonts.semibold}]}>
                {t('settings.selectFont')}
              </Text>
              <TouchableOpacity onPress={() => setShowFontModal(null)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            {(showFontModal === 'arabic' ? ARABIC_FONTS : FONT_OPTIONS).map(font => (
              <TouchableOpacity
                key={font.value}
                style={[
                  styles.fontItem,
                  (
                    (showFontModal === 'english' && fontSettings?.englishFont === font.value) ||
                    (showFontModal === 'arabic' && fontSettings?.arabicFont === font.value) ||
                    (showFontModal === 'french' && fontSettings?.frenchFont === font.value)
                  ) && {backgroundColor: colors.surfaceHighlight},
                ]}
                onPress={() => {
                  const current = fontSettings || {englishFont: 'System', arabicFont: 'System', frenchFont: 'System', globalFont: 'System'};
                  if (showFontModal === 'english') setFonts({...current, englishFont: font.value});
                  else if (showFontModal === 'arabic') setFonts({...current, arabicFont: font.value});
                  else setFonts({...current, frenchFont: font.value});
                  setShowFontModal(null);
                }}>
                <Text style={[styles.fontItemText, {color: colors.text}]}>{font.label}</Text>
                {(
                  (showFontModal === 'english' && fontSettings?.englishFont === font.value) ||
                  (showFontModal === 'arabic' && fontSettings?.arabicFont === font.value) ||
                  (showFontModal === 'french' && fontSettings?.frenchFont === font.value)
                ) && <Icon name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Color Picker Modals */}
      {['page', 'text', 'highlight'].map(type => {
        const isPage = type === 'page';
        const isText = type === 'text';
        const show = isPage ? showPageColorPicker : isText ? showTextColorPicker : showHighlightColorPicker;
        const setShow = isPage ? setShowPageColorPicker : isText ? setShowTextColorPicker : setShowHighlightColorPicker;
        const currentColor = isPage
          ? (customColors?.pageBackground || colors.readerBackground)
          : isText
            ? (customColors?.textColor || colors.readerText)
            : (customColors?.highlightColor || HIGHLIGHT_COLOR_PRESETS[0]);

        return (
          <Modal key={type} visible={show} transparent animationType="fade" onRequestClose={() => setShow(false)}>
            <View style={[styles.modalOverlay, {backgroundColor: colors.overlay}]}>
              <View style={[styles.colorPickerPanel, {backgroundColor: colors.surface}]}>
                <Text style={[styles.colorPickerTitle, {color: colors.text, fontFamily: fonts.semibold}]}>
                  {isPage ? t('settings.pageBackground') : isText ? t('settings.textColor') : t('settings.highlightColor')}
                </Text>
                <View style={styles.colorGrid}>
                  {HIGHLIGHT_COLOR_PRESETS.concat(['#1c1917', '#fafaf9', '#0f172a', '#f8fafc']).map(color =>
                    renderColorCircle(color, () => {
                      const current = customColors || {pageBackground: '', textColor: '', highlightColor: ''};
                      if (isPage) setCustomColors({...current, pageBackground: color});
                      else if (isText) setCustomColors({...current, textColor: color});
                      else setCustomColors({...current, highlightColor: color});
                      setShow(false);
                    }, currentColor === color),
                  )}
                </View>
              </View>
            </View>
          </Modal>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  valueText: {
    fontSize: 14,
  },
  themeGrid: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
  },
  themeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  themeBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  colorLabel: {
    fontSize: 15,
  },
  colorRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorPreview: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  colorAction: {
    fontSize: 14,
    fontWeight: '500',
  },
  rowDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  resetColorsBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetColorsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fontRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fontLabel: {
    fontSize: 15,
  },
  fontValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fontValueText: {
    fontSize: 14,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    marginBottom: 24,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '500',
  },
  aboutContainer: {
    alignItems: 'center',
    gap: 4,
  },
  aboutVersion: {
    fontSize: 14,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalPanel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  langText: {
    fontSize: 16,
  },
  fontItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  fontItemText: {
    fontSize: 15,
  },
  colorPickerPanel: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    maxWidth: 400,
    alignSelf: 'center',
  },
  colorPickerTitle: {
    fontSize: 17,
    marginBottom: 16,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderColor: '#0f172a',
    borderWidth: 3,
    transform: [{scale: 1.1}],
  },
});
