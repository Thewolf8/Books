import React, {useEffect, useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '@theme/ThemeProvider';
import {useLibraryStore} from '@store/libraryStore';
import type {RootStackParamList} from '@navigation/AppNavigator';
import type {Book} from '@types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DEFAULT_COVER = 'https://via.placeholder.com/120x180/6366f1/ffffff?text=📖';

const BookCard: React.FC<{book: Book; onPress: () => void; onLongPress: () => void}> = ({
  book,
  onPress,
  onLongPress,
}) => {
  const {colors, fonts} = useTheme();
  const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;

  return (
    <TouchableOpacity
      style={[styles.card, {backgroundColor: colors.surface}]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}>
      <Image
        source={book.coverImagePath ? {uri: book.coverImagePath} : {uri: DEFAULT_COVER}}
        style={styles.cover}
        resizeMode="cover"
      />
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, {color: colors.text, fontFamily: fonts.regular}]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.cardAuthor, {color: colors.textSecondary, fontFamily: fonts.regular}]} numberOfLines={1}>
          {book.author}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={[styles.cardType, {color: colors.textMuted}]}>
            {book.type === 'physical' ? '📚 Physical' : '📱 Digital'}
          </Text>
          {book.rating > 0 && (
            <View style={styles.ratingRow}>
              {Array.from({length: 5}).map((_, i) => (
                <Icon
                  key={i}
                  name={i < book.rating ? 'star' : 'star-outline'}
                  size={12}
                  color={i < book.rating ? '#fbbf24' : colors.textMuted}
                />
              ))}
            </View>
          )}
        </View>
        {book.totalPages > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, {backgroundColor: colors.surfaceVariant}]}>
              <View
                style={[
                  styles.progressFill,
                  {width: `${Math.min(progress, 100)}%`, backgroundColor: colors.primary},
                ]}
              />
            </View>
            <Text style={[styles.progressText, {color: colors.textMuted}]}>
              {Math.round(progress)}%
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const LibraryScreen: React.FC = () => {
  const {t} = useTranslation();
  const {colors, fonts} = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  const books = useLibraryStore(state => state.books);
  const searchQuery = useLibraryStore(state => state.searchQuery);
  const filterType = useLibraryStore(state => state.filterType);
  const sortBy = useLibraryStore(state => state.sortBy);
  const loadBooks = useLibraryStore(state => state.loadBooks);
  const setSearchQuery = useLibraryStore(state => state.setSearchQuery);
  const setFilterType = useLibraryStore(state => state.setFilterType);
  const setSortBy = useLibraryStore(state => state.setSortBy);
  const deleteBook = useLibraryStore(state => state.deleteBook);
  const selectBook = useLibraryStore(state => state.selectBook);

  const getFilteredBooks = useLibraryStore(state => state.getFilteredBooks);
  const filteredBooks = getFilteredBooks();

  useEffect(() => {
    loadBooks();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBooks();
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleBookPress = (book: Book) => {
    selectBook(book.id);
    navigation.navigate('BookDetail', {bookId: book.id});
  };

  const handleBookLongPress = (book: Book) => {
    Alert.alert(
      book.title,
      t('book.deleteConfirm'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteBook(book.id),
        },
      ],
    );
  };

  const getSortIcon = () => {
    switch (sortBy) {
      case 'title': return 'text-outline';
      case 'author': return 'person-outline';
      case 'rating': return 'star-outline';
      default: return 'time-outline';
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, {color: colors.text, fontFamily: fonts.bold}]}>
          {t('library.title')}
        </Text>
        <TouchableOpacity
          style={[styles.addBtn, {backgroundColor: colors.primary}]}
          onPress={() => navigation.navigate('AddBook')}>
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, {backgroundColor: colors.surface, borderColor: colors.border}]}>
        <Icon name="search-outline" size={18} color={colors.textMuted} />
        <Text
          style={[styles.searchInput, {color: colors.text}]}
          onPress={() => {}}>
          {searchQuery || t('library.searchPlaceholder')}
        </Text>
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter & Sort Bar */}
      <View style={styles.filterBar}>
        <View style={styles.filterButtons}>
          {(['all', 'physical', 'digital'] as const).map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterBtn,
                filterType === type && {backgroundColor: colors.primary},
              ]}
              onPress={() => setFilterType(type)}>
              <Text
                style={[
                  styles.filterBtnText,
                  {color: filterType === type ? '#fff' : colors.textSecondary},
                  {fontFamily: fonts.medium},
                ]}>
                {t(`library.${type === 'all' ? 'allBooks' : type}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.sortBtn, {backgroundColor: colors.surfaceVariant}]}
          onPress={() => {
            const sorts: Array<'recent' | 'title' | 'author' | 'rating'> = ['recent', 'title', 'author', 'rating'];
            const next = sorts[(sorts.indexOf(sortBy) + 1) % sorts.length];
            setSortBy(next);
          }}>
          <Icon name={getSortIcon()} size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Book Count */}
      <Text style={[styles.countText, {color: colors.textMuted}]}>
        {filteredBooks.length} {filteredBooks.length === 1 ? t('library.allBooks') : t('library.allBooks')}
      </Text>

      {/* Book Grid */}
      <FlatList
        data={filteredBooks}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="library-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, {color: colors.text, fontFamily: fonts.medium}]}>
              {t('library.emptyTitle')}
            </Text>
            <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
              {t('library.emptySubtitle')}
            </Text>
          </View>
        }
        renderItem={({item}) => (
          <View style={styles.gridItem}>
            <BookCard
              book={item}
              onPress={() => handleBookPress(item)}
              onLongPress={() => handleBookLongPress(item)}
            />
          </View>
        )}
      />
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sortBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingBottom: 24,
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cover: {
    width: '100%',
    height: 180,
    backgroundColor: '#e2e8f0',
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  cardAuthor: {
    fontSize: 12,
    marginTop: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  cardType: {
    fontSize: 11,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    minWidth: 32,
    textAlign: 'right',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
