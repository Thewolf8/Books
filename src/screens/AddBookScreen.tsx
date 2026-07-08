import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary, launchCamera, ImagePickerResponse} from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import {useTheme} from '@theme/ThemeProvider';
import {useLibraryStore} from '@store/libraryStore';
import type {RootStackParamList} from '@navigation/AppNavigator';
import type {BookFormData, BookType} from '@types';
import RNFS from 'react-native-fs';

type RouteProps = RouteProp<RootStackParamList, 'AddBook'>;

const DEFAULT_COVER = 'https://via.placeholder.com/200x280/6366f1/ffffff?text=📖';

export const AddBookScreen: React.FC = () => {
  const {t} = useTranslation();
  const {colors, fonts} = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const bookId = route.params?.bookId;

  const addBook = useLibraryStore(state => state.addBook);
  const updateBook = useLibraryStore(state => state.updateBook);
  const tags = useLibraryStore(state => state.tags);
  const loadTags = useLibraryStore(state => state.loadTags);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [bookType, setBookType] = useState<BookType>('physical');
  const [coverPath, setCoverPath] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState('');
  const [summary, setSummary] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // Load existing book data if editing
  useEffect(() => {
    if (bookId) {
      const book = useLibraryStore.getState().books.find(b => b.id === bookId);
      if (book) {
        setTitle(book.title);
        setAuthor(book.author);
        setDescription(book.description);
        setBookType(book.type);
        setCoverPath(book.coverImagePath);
        setFilePath(book.filePath);
        setTotalPages(book.totalPages ? String(book.totalPages) : '');
        setSummary(book.summary);
        setReview(book.review);
        setRating(book.rating);
      }
    }
  }, [bookId]);

  const handleImagePick = useCallback(async (source: 'camera' | 'gallery') => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8 as const,
      maxWidth: 800,
      maxHeight: 1200,
    };

    const response: ImagePickerResponse =
      source === 'camera'
        ? await launchCamera(options)
        : await launchImageLibrary(options);

    if (response.assets && response.assets[0]?.uri) {
      // Copy to app storage
      const sourceUri = response.assets[0].uri;
      const fileName = `cover_${Date.now()}.jpg`;
      const destPath = `${RNFS.DocumentDirectoryPath}/covers/${fileName}`;

      try {
        await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/covers`);
        await RNFS.copyFile(sourceUri, destPath);
        setCoverPath(destPath);
      } catch (err) {
        // Fallback to direct URI if copy fails
        setCoverPath(sourceUri);
      }
    }
  }, []);

  const handlePDFPick = useCallback(async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
        copyTo: 'documentDirectory',
      });

      if (result[0].fileCopyUri || result[0].uri) {
        setFilePath(result[0].fileCopyUri || result[0].uri);
        if (!title && result[0].name) {
          setTitle(result[0].name.replace('.pdf', ''));
        }
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert(t('common.error'), 'Failed to pick PDF');
      }
    }
  }, [title, t]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId],
    );
  };

  const handleSave = async () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert(t('common.error'), t('addBook.requiredFields'));
      return;
    }

    setIsSaving(true);

    try {
      const data: BookFormData = {
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        type: bookType,
        coverImagePath: coverPath,
        filePath: filePath,
        totalPages: parseInt(totalPages, 10) || 0,
        summary: summary.trim(),
        review: review.trim(),
        rating,
        tags: selectedTags,
      };

      if (bookId) {
        await updateBook(bookId, data);
      } else {
        await addBook(data);
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert(t('common.error'), t('addBook.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const renderStarRating = () => (
    <View style={styles.ratingRow}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity key={star} onPress={() => setRating(star)}>
          <Icon
            name={star <= rating ? 'star' : 'star-outline'}
            size={28}
            color={star <= rating ? '#fbbf24' : colors.textMuted}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: colors.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="close-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: colors.text, fontFamily: fonts.bold}]}>
            {bookId ? t('addBook.editTitle') : t('addBook.title')}
          </Text>
          <View style={{width: 40}} />
        </View>

        {/* Cover Image */}
        <View style={styles.coverSection}>
          <Image
            source={coverPath ? {uri: coverPath} : {uri: DEFAULT_COVER}}
            style={[styles.coverPreview, {backgroundColor: colors.surfaceVariant}]}
          />
          <View style={styles.coverActions}>
            <TouchableOpacity
              style={[styles.coverBtn, {backgroundColor: colors.primary}]}
              onPress={() => handleImagePick('camera')}>
              <Icon name="camera-outline" size={18} color="#fff" />
              <Text style={styles.coverBtnText}>{t('addBook.takePhoto')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.coverBtn, {backgroundColor: colors.surfaceVariant}]}
              onPress={() => handleImagePick('gallery')}>
              <Icon name="images-outline" size={18} color={colors.text} />
              <Text style={[styles.coverBtnText, {color: colors.text}]}>{t('addBook.chooseGallery')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Book Type Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, {color: colors.textSecondary, fontFamily: fonts.medium}]}>
            {t('addBook.type')}
          </Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                bookType === 'physical' && {backgroundColor: colors.primary, borderColor: colors.primary},
                {borderColor: colors.border},
              ]}
              onPress={() => { setBookType('physical'); setFilePath(null); }}>
              <Icon name="book-outline" size={20} color={bookType === 'physical' ? '#fff' : colors.textSecondary} />
              <Text style={[styles.typeBtnText, {color: bookType === 'physical' ? '#fff' : colors.text}]}>
                {t('addBook.physical')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                bookType === 'digital' && {backgroundColor: colors.primary, borderColor: colors.primary},
                {borderColor: colors.border},
              ]}
              onPress={() => setBookType('digital')}>
              <Icon name="phone-portrait-outline" size={20} color={bookType === 'digital' ? '#fff' : colors.textSecondary} />
              <Text style={[styles.typeBtnText, {color: bookType === 'digital' ? '#fff' : colors.text}]}>
                {t('addBook.digital')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PDF Import (Digital only) */}
        {bookType === 'digital' && (
          <View style={styles.section}>
            <Text style={[styles.label, {color: colors.textSecondary, fontFamily: fonts.medium}]}>
              PDF
            </Text>
            <TouchableOpacity
              style={[styles.pdfBtn, {backgroundColor: colors.surface, borderColor: colors.border}]}
              onPress={handlePDFPick}>
              <Icon name="document-outline" size={20} color={filePath ? colors.success : colors.primary} />
              <Text style={[styles.pdfBtnText, {color: filePath ? colors.success : colors.text}]}>
                {filePath ? '✓ PDF Selected' : t('addBook.selectPDF')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.section}>
          <Text style={[styles.label, {color: colors.textSecondary, fontFamily: fonts.medium}]}>
            {t('addBook.bookTitle')} *
          </Text>
          <TextInput
            style={[styles.input, {backgroundColor: colors.surface, color: colors.text, borderColor: colors.border}]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter book title..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, {color: colors.textSecondary, fontFamily: fonts.medium}]}>
            {t('addBook.author')} *
          </Text>
          <TextInput
            style={[styles.input, {backgroundColor: colors.surface, color: colors.text, borderColor: colors.border}]}
            value={author}
            onChangeText={setAuthor}
            placeholder="Enter author name..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, {color: colors.textSecondary, fontFamily: fonts.medium}]}>
            {t('addBook.description')}
          </Text>
          <TextInput
            style={[styles.textArea, {backgroundColor: colors.surface, color: colors.text, borderColor: colors.border}]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, {color: colors.textSecondary, fontFamily: fonts.medium}]}>
            {t('addBook.pages')}
          </Text>
          <TextInput
            style={[styles.input, {backgroundColor: colors.surface, color: colors.text, borderColor: colors.border}]}
            value={totalPages}
            onChangeText={setTotalPages}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
          />
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={[styles.label, {color: colors.textSecondary, fontFamily: fonts.medium}]}>
            {t('book.rating')}
          </Text>
          {renderStarRating()}
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={[styles.label, {color: colors.textSecondary, fontFamily: fonts.medium}]}>
            {t('book.tags')}
          </Text>
          <View style={styles.tagsContainer}>
            {tags.map(tag => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: selectedTags.includes(tag.id)
                      ? tag.color + '30'
                      : colors.surfaceVariant,
                    borderColor: selectedTags.includes(tag.id) ? tag.color : colors.border,
                  },
                ]}
                onPress={() => toggleTag(tag.id)}>
                <View style={[styles.tagDot, {backgroundColor: tag.color}]} />
                <Text style={[styles.tagText, {color: colors.text}]}>{tag.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary & Review */}
        <View style={styles.section}>
          <Text style={[styles.label, {color: colors.textSecondary, fontFamily: fonts.medium}]}>
            {t('book.summary')}
          </Text>
          <TextInput
            style={[styles.textArea, {backgroundColor: colors.surface, color: colors.text, borderColor: colors.border}]}
            value={summary}
            onChangeText={setSummary}
            placeholder={t('book.writeSummary')}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.label, {color: colors.textSecondary, fontFamily: fonts.medium}]}>
            {t('book.review')}
          </Text>
          <TextInput
            style={[styles.textArea, {backgroundColor: colors.surface, color: colors.text, borderColor: colors.border}]}
            value={review}
            onChangeText={setReview}
            placeholder={t('book.writeReview')}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, {backgroundColor: colors.primary}]}
          onPress={handleSave}
          disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {bookId ? t('addBook.update') : t('addBook.save')}
            </Text>
          )}
        </TouchableOpacity>

        <View style={{height: 40}} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  coverSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  coverPreview: {
    width: 160,
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
  },
  coverActions: {
    flexDirection: 'row',
    gap: 12,
  },
  coverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  coverBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 10,
  },
  pdfBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textArea: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  tagDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
