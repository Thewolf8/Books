import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Clipboard,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '@theme/ThemeProvider';
import {useVaultStore} from '@store/vaultStore';
import {useLibraryStore} from '@store/libraryStore';
import type {RootStackParamList} from '@navigation/AppNavigator';
import type {HighlightWithBook} from '@types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const VaultScreen: React.FC = () => {
  const {t} = useTranslation();
  const {colors, fonts} = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const highlights = useVaultStore(state => state.highlights);
  const filters = useVaultStore(state => state.filters);
  const isLoading = useVaultStore(state => state.isLoading);
  const loadHighlights = useVaultStore(state => state.loadHighlights);
  const setFilters = useVaultStore(state => state.setFilters);
  const resetFilters = useVaultStore(state => state.resetFilters);
  const deleteHighlight = useVaultStore(state => state.deleteHighlight);

  const books = useLibraryStore(state => state.books);

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHighlights();
  }, []);

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    setFilters({searchQuery: text});
  }, [setFilters]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      t('common.delete'),
      t('reader.deleteConfirm'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteHighlight(id),
        },
      ],
    );
  }, [t, deleteHighlight]);

  const handleCopy = useCallback((text: string) => {
    Clipboard.setString(text);
    Alert.alert('', t('common.copied'), [{text: 'OK'}]);
  }, [t]);

  const renderSnippetCard = ({item}: {item: HighlightWithBook}) => (
    <View style={[styles.card, {backgroundColor: colors.surface}]}>
      <View style={styles.cardHeader}>
        <View style={[styles.colorDot, {backgroundColor: item.color}]} />
        <View style={styles.cardMeta}>
          <Text style={[styles.bookTitle, {color: colors.text, fontFamily: fonts.medium}]} numberOfLines={1}>
            {item.bookTitle}
          </Text>
          <Text style={[styles.pageText, {color: colors.textMuted}]}>
            {t('vault.page', {page: item.pageNumber})} · {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleCopy(item.selectedText)}>
            <Icon name="copy-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDelete(item.id)}>
            <Icon name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.quoteContainer, {backgroundColor: colors.surfaceVariant}]}>
        <Icon name="quote" size={16} color={colors.textMuted} style={styles.quoteIcon} />
        <Text style={[styles.quoteText, {color: colors.text, fontFamily: fonts.regular}]}>
          {item.selectedText}
        </Text>
      </View>

      {item.comment ? (
        <View style={styles.commentContainer}>
          <Icon name="chatbubble-outline" size={14} color={colors.primary} />
          <Text style={[styles.commentText, {color: colors.textSecondary}]}>
            {item.comment}
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, {color: colors.text, fontFamily: fonts.bold}]}>
            {t('vault.title')}
          </Text>
          <Text style={[styles.headerSubtitle, {color: colors.textMuted}]}>
            {t('vault.subtitle')}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, {backgroundColor: colors.surface, borderColor: colors.border}]}>
        <Icon name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, {color: colors.text}]}
          placeholder={t('vault.searchPlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter & Sort Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterBtn, {backgroundColor: colors.surface}]}
          onPress={() => setShowFilterModal(true)}>
          <Icon name="funnel-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.filterText, {color: colors.textSecondary}]}>
            {filters.bookId ? books.find(b => b.id === filters.bookId)?.title || t('vault.filterByBook') : t('vault.filterByBook')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, {backgroundColor: colors.surface}]}
          onPress={() => setShowSortModal(true)}>
          <Icon name="swap-vertical-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.filterText, {color: colors.textSecondary}]}>
            {t('vault.sortBy')}
          </Text>
        </TouchableOpacity>
        {(filters.bookId || filters.searchQuery) && (
          <TouchableOpacity onPress={resetFilters}>
            <Icon name="close-circle" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results Count */}
      <Text style={[styles.countText, {color: colors.textMuted}]}>
        {highlights.length} {highlights.length === 1 ? 'snippet' : 'snippets'}
      </Text>

      {/* Snippets List */}
      <FlatList
        data={highlights}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderSnippetCard}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="bookmark-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, {color: colors.text}]}>{t('vault.noResults')}</Text>
            <Text style={[styles.emptySubtext, {color: colors.textMuted}]}>
              {t('reader.noHighlightsOnPage')}
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}>
        <View style={[styles.modalOverlay, {backgroundColor: colors.overlay}]}>
          <View style={[styles.modalContent, {backgroundColor: colors.surface}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: colors.text, fontFamily: fonts.semibold}]}>
                {t('vault.filterByBook')}
              </Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.bookFilterItem, !filters.bookId && {backgroundColor: colors.surfaceHighlight}]}
              onPress={() => {
                setFilters({bookId: null});
                setShowFilterModal(false);
              }}>
              <Text style={[styles.bookFilterText, {color: colors.text}]}>{t('vault.allBooks')}</Text>
              {!filters.bookId && <Icon name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>

            {books.map(book => (
              <TouchableOpacity
                key={book.id}
                style={[styles.bookFilterItem, filters.bookId === book.id && {backgroundColor: colors.surfaceHighlight}]}
                onPress={() => {
                  setFilters({bookId: book.id});
                  setShowFilterModal(false);
                }}>
                <View style={styles.bookFilterInfo}>
                  <Text style={[styles.bookFilterText, {color: colors.text}]} numberOfLines={1}>
                    {book.title}
                  </Text>
                  <Text style={[styles.bookFilterAuthor, {color: colors.textMuted}]}>
                    {book.author}
                  </Text>
                </View>
                {filters.bookId === book.id && <Icon name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}>
        <View style={[styles.modalOverlay, {backgroundColor: colors.overlay}]}>
          <View style={[styles.modalContent, {backgroundColor: colors.surface}]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: colors.text, fontFamily: fonts.semibold}]}>
                {t('vault.sortBy')}
              </Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {(['date', 'book', 'page'] as const).map(sort => (
              <TouchableOpacity
                key={sort}
                style={[styles.sortItem, filters.sortBy === sort && {backgroundColor: colors.surfaceHighlight}]}
                onPress={() => {
                  setFilters({sortBy: sort});
                  setShowSortModal(false);
                }}>
                <Text style={[styles.sortText, {color: colors.text}]}>
                  {sort === 'date' ? t('vault.sortRecent') : sort === 'book' ? t('vault.sortBook') : t('vault.sortPage')}
                </Text>
                {filters.sortBy === sort && <Icon name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}

            <View style={[styles.divider, {backgroundColor: colors.divider}]} />

            <TouchableOpacity
              style={[styles.sortItem, filters.sortOrder === 'asc' && {backgroundColor: colors.surfaceHighlight}]}
              onPress={() => {
                setFilters({sortOrder: 'asc'});
                setShowSortModal(false);
              }}>
              <Text style={[styles.sortText, {color: colors.text}]}>{t('vault.sortAsc')}</Text>
              {filters.sortOrder === 'asc' && <Icon name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortItem, filters.sortOrder === 'desc' && {backgroundColor: colors.surfaceHighlight}]}
              onPress={() => {
                setFilters({sortOrder: 'desc'});
                setShowSortModal(false);
              }}>
              <Text style={[styles.sortText, {color: colors.text}]}>{t('vault.sortDesc')}</Text>
              {filters.sortOrder === 'desc' && <Icon name="checkmark" size={20} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    flex: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  countText: {
    fontSize: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
    color: '#94a3b8',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  cardMeta: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  pageText: {
    fontSize: 12,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteContainer: {
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
  },
  quoteIcon: {
    marginTop: 2,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    gap: 8,
    paddingHorizontal: 4,
  },
  commentText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  bookFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  bookFilterInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookFilterText: {
    fontSize: 15,
    fontWeight: '500',
  },
  bookFilterAuthor: {
    fontSize: 12,
    marginTop: 2,
  },
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sortText: {
    fontSize: 15,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 20,
  },
});
