import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '@theme/ThemeProvider';
import {useLibraryStore} from '@store/libraryStore';
import {getHighlightsForBook} from '@database/repositories/HighlightRepository';
import type {RootStackParamList} from '@navigation/AppNavigator';
import type {Book, Tag} from '@types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'BookDetail'>;

const DEFAULT_COVER = 'https://via.placeholder.com/160x220/6366f1/ffffff?text=📖';

export const BookDetailScreen: React.FC = () => {
  const {t} = useTranslation();
  const {colors, fonts} = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const {bookId} = route.params;

  const books = useLibraryStore(state => state.books);
  const deleteBook = useLibraryStore(state => state.deleteBook);
  const getBookTags = useLibraryStore(state => state.getBookTags);

  const [bookTags, setBookTags] = useState<Tag[]>([]);
  const [highlightsCount, setHighlightsCount] = useState(0);

  const book: Book | undefined = books.find(b => b.id === bookId);

  useEffect(() => {
    if (bookId) {
      const tags = getBookTags(bookId);
      setBookTags(tags);
      const highlights = getHighlightsForBook(bookId);
      setHighlightsCount(highlights.length);
    }
  }, [bookId, getBookTags]);

  if (!book) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <Text style={{color: colors.text}}>Book not found</Text>
      </View>
    );
  }

  const progress = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;

  const handleDelete = () => {
    Alert.alert(
      book.title,
      t('book.deleteConfirm'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            deleteBook(book.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${book.title} by ${book.author}\n\n${book.summary || ''}`,
        title: book.title,
      });
    } catch {}
  };

  const handleRead = () => {
    if (book.type === 'digital' && book.filePath) {
      navigation.navigate('Reader', {bookId: book.id});
    } else {
      // For physical books, just show a message
      Alert.alert(t('book.openReader'), t('book.details'));
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
            <Icon name="share-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddBook', {bookId: book.id})}
            style={styles.headerBtn}>
            <Icon name="create-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerBtn}>
            <Icon name="trash-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Book Header Card */}
        <View style={[styles.bookCard, {backgroundColor: colors.surface}]}>
          <Image
            source={book.coverImagePath ? {uri: book.coverImagePath} : {uri: DEFAULT_COVER}}
            style={[styles.cover, {backgroundColor: colors.surfaceVariant}]}
          />
          <View style={styles.bookInfo}>
            <Text style={[styles.title, {color: colors.text, fontFamily: fonts.bold}]} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={[styles.author, {color: colors.textSecondary, fontFamily: fonts.medium}]}>
              {book.author}
            </Text>
            <View style={styles.metaRow}>
              <View style={[styles.typeBadge, {backgroundColor: colors.surfaceVariant}]}>
                <Text style={[styles.typeText, {color: colors.textMuted}]}>
                  {book.type === 'physical' ? '📚 Physical' : '📱 Digital'}
                </Text>
              </View>
              {book.rating > 0 && (
                <View style={styles.ratingRow}>
                  {Array.from({length: 5}).map((_, i) => (
                    <Icon
                      key={i}
                      name={i < book.rating ? 'star' : 'star-outline'}
                      size={14}
                      color={i < book.rating ? '#fbbf24' : colors.textMuted}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Tags */}
            {bookTags.length > 0 && (
              <View style={styles.tagsRow}>
                {bookTags.map(tag => (
                  <View
                    key={tag.id}
                    style={[styles.tagBadge, {backgroundColor: tag.color + '20'}]}>
                    <View style={[styles.tagDot, {backgroundColor: tag.color}]} />
                    <Text style={[styles.tagName, {color: colors.text}]}>{tag.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Progress Card */}
        <View style={[styles.card, {backgroundColor: colors.surface}]}>
          <Text style={[styles.cardTitle, {color: colors.text, fontFamily: fonts.semibold}]}>
            {t('book.progress')}
          </Text>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressText, {color: colors.textSecondary}]}>
              {t('reader.pageOf', {current: book.currentPage, total: book.totalPages || '?'})}
            </Text>
            <Text style={[styles.progressPercent, {color: colors.primary, fontFamily: fonts.bold}]}>
              {progress}%
            </Text>
          </View>
          <View style={[styles.progressBar, {backgroundColor: colors.surfaceVariant}]}>
            <View
              style={[styles.progressFill, {width: `${progress}%`, backgroundColor: colors.primary}]}
            />
          </View>
          {highlightsCount > 0 && (
            <Text style={[styles.highlightsText, {color: colors.textMuted}]}>
              {t('book.highlightsCount', {count: highlightsCount})}
            </Text>
          )}
        </View>

        {/* Description */}
        {book.description ? (
          <View style={[styles.card, {backgroundColor: colors.surface}]}>
            <Text style={[styles.cardTitle, {color: colors.text, fontFamily: fonts.semibold}]}>
              {t('book.description')}
            </Text>
            <Text style={[styles.cardBody, {color: colors.textSecondary, fontFamily: fonts.regular}]}>
              {book.description}
            </Text>
          </View>
        ) : null}

        {/* Summary */}
        {book.summary ? (
          <View style={[styles.card, {backgroundColor: colors.surface}]}>
            <Text style={[styles.cardTitle, {color: colors.text, fontFamily: fonts.semibold}]}>
              {t('book.summary')}
            </Text>
            <Text style={[styles.cardBody, {color: colors.textSecondary, fontFamily: fonts.regular}]}>
              {book.summary}
            </Text>
          </View>
        ) : null}

        {/* Review */}
        {book.review ? (
          <View style={[styles.card, {backgroundColor: colors.surface}]}>
            <Text style={[styles.cardTitle, {color: colors.text, fontFamily: fonts.semibold}]}>
              {t('book.review')}
            </Text>
            <Text style={[styles.cardBody, {color: colors.textSecondary, fontFamily: fonts.regular}]}>
              {book.review}
            </Text>
          </View>
        ) : null}

        {/* Read Button */}
        <TouchableOpacity
          style={[styles.readBtn, {backgroundColor: colors.primary}]}
          onPress={handleRead}>
          <Icon name="book-outline" size={20} color="#fff" />
          <Text style={styles.readBtnText}>{t('book.openReader')}</Text>
        </TouchableOpacity>

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  scrollContent: {
    padding: 16,
  },
  bookCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cover: {
    width: 110,
    height: 150,
    borderRadius: 12,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  author: {
    fontSize: 14,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagName: {
    fontSize: 11,
    fontWeight: '500',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
  },
  progressPercent: {
    fontSize: 18,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  highlightsText: {
    fontSize: 13,
    marginTop: 10,
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 16,
    gap: 10,
    marginTop: 8,
  },
  readBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
