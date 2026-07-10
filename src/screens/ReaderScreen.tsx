import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '@theme/ThemeProvider';
import {useLibraryStore} from '@store/libraryStore';
import {useReaderStore} from '@store/readerStore';
import {updateReadingProgress} from '@database/repositories/BookRepository';
import type {RootStackParamList} from '@navigation/AppNavigator';
import type {Book} from '@types';

type RouteProps = RouteProp<RootStackParamList, 'Reader'>;

const {width: SCREEN_W, height: SCREEN_H} = Dimensions.get('window');
const HIGHLIGHT_COLORS = ['#fbbf24', '#f87171', '#34d399', '#60a5fa', '#a78bfa', '#f472b6'];

interface HighlightOverlay {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  comment: string;
  selectedText: string;
}

export const ReaderScreen: React.FC = () => {
  const {t} = useTranslation();
  const {colors, fonts} = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const {bookId} = route.params;

  const pdfRef = useRef<Pdf>(null);
  const controlsAnim = useRef(new Animated.Value(1)).current;

  const books = useLibraryStore(state => state.books);
  const updateBookProgress = useLibraryStore(state => state.updateReadingProgress);
  const updateBook = useLibraryStore(state => state.updateBook);

  const currentPage = useReaderStore(state => state.currentPage);
  const totalPages = useReaderStore(state => state.totalPages);
  const highlights = useReaderStore(state => state.highlights);
  const showHighlightsPanel = useReaderStore(state => state.showHighlightsPanel);
  const setCurrentBook = useReaderStore(state => state.setCurrentBook);
  const setCurrentPage = useReaderStore(state => state.setCurrentPage);
  const addHighlight = useReaderStore(state => state.addHighlight);
  const loadHighlights = useReaderStore(state => state.loadHighlights);
  const setShowHighlightsPanel = useReaderStore(state => state.setShowHighlightsPanel);
  const readerDeleteHighlight = useReaderStore(state => state.deleteHighlight);

  const [showControls, setShowControls] = useState(true);
  const [showGoToModal, setShowGoToModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [goToPage, setGoToPage] = useState('');
  const [noteText, setNoteText] = useState('');
  const [selectedHighlightColor, setSelectedHighlightColor] = useState(HIGHLIGHT_COLORS[0]);
  const [tapCoordinates, setTapCoordinates] = useState({x: 0, y: 0});
  const [overlayHighlights, setOverlayHighlights] = useState<HighlightOverlay[]>([]);

  const book: Book | undefined = books.find(b => b.id === bookId);

  useEffect(() => {
    if (book?.filePath) {
      RNFS.stat(book.filePath.replace(/^file:\/\//i, ''))
        .then(stat => {
          Alert.alert('PDF file (debug)', `path: ${book.filePath}\nsize: ${stat.size} bytes`);
        })
        .catch(err => {
          Alert.alert('PDF file (debug) - STAT FAILED', `path: ${book.filePath}\nerror: ${err?.message || err}`);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.filePath]);

  useEffect(() => {
    if (book) {
      setCurrentBook(book.id, book.totalPages || 1, book.currentPage || 1);
    }
    return () => {
      // Save progress on unmount
      if (bookId && currentPage > 0) {
        updateReadingProgress(bookId, currentPage);
      }
    };
    // This effect must only run when the book changes, not on every page
    // turn (which would otherwise reset the reader position on each swipe).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  // Load highlights for current page
  useEffect(() => {
    if (bookId) {
      loadHighlights(bookId, currentPage);
    }
  }, [bookId, currentPage, loadHighlights]);

  // Convert stored highlights to overlay format
  useEffect(() => {
    const overlays: HighlightOverlay[] = highlights.map(h => ({
      id: h.id,
      x: (h.x1 / 100) * SCREEN_W,
      y: (h.y1 / 100) * SCREEN_H * 0.7,
      width: ((h.x2 - h.x1) / 100) * SCREEN_W,
      height: 24,
      color: h.color,
      comment: h.comment,
      selectedText: h.selectedText,
    }));
    setOverlayHighlights(overlays);
  }, [highlights]);

  const handlePageChange = useCallback((page: number, _total: number) => {
    setCurrentPage(page);
    if (bookId) {
      updateBookProgress(bookId, page);
      updateReadingProgress(bookId, page);
    }
  }, [bookId, setCurrentPage, updateBookProgress]);

  const toggleControls = useCallback(() => {
    const next = !showControls;
    setShowControls(next);
    Animated.timing(controlsAnim, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showControls, controlsAnim]);

  const handleTapOnPage = (e: any) => {
    if (showAddNoteModal) return;
    const {locationX, locationY} = e.nativeEvent;
    setTapCoordinates({x: locationX, y: locationY});
  };

  const handleAddHighlight = async () => {
    if (!bookId) return;

    const highlightData = {
      bookId,
      pageNumber: currentPage,
      selectedText: `Highlight on page ${currentPage}`,
      comment: noteText,
      color: selectedHighlightColor,
      x1: Math.max(0, (tapCoordinates.x / SCREEN_W) * 100),
      y1: Math.max(0, (tapCoordinates.y / (SCREEN_H * 0.7)) * 100),
      x2: Math.min(100, ((tapCoordinates.x + 100) / SCREEN_W) * 100),
      y2: Math.min(100, ((tapCoordinates.y + 24) / (SCREEN_H * 0.7)) * 100),
    };

    await addHighlight(highlightData);
    setNoteText('');
    setShowAddNoteModal(false);
  };

  const handleDeleteHighlightConfirm = (highlightId: string) => {
    Alert.alert(
      t('reader.delete'),
      t('reader.deleteConfirm'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => readerDeleteHighlight(highlightId),
        },
      ],
    );
  };

  const handleJumpToPage = () => {
    const page = parseInt(goToPage, 10);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      pdfRef.current?.setPage(page);
      setShowGoToModal(false);
      setGoToPage('');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      pdfRef.current?.setPage(prev);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      pdfRef.current?.setPage(next);
    }
  };

  if (!book || !book.filePath) {
    return (
      <View style={[styles.container, {backgroundColor: colors.readerBackground, justifyContent: 'center', alignItems: 'center'}]}>
        <Text style={{color: colors.text}}>No PDF file available</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
          <Text style={{color: colors.primary}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.readerBackground}]}>
      {/* PDF Viewer */}
      <TouchableOpacity
        style={styles.pdfContainer}
        onPress={e => {
          handleTapOnPage(e);
          toggleControls();
        }}
        activeOpacity={1}>
        <Pdf
          ref={pdfRef}
          source={{uri: book.filePath, cache: true}}
          style={[styles.pdf, {backgroundColor: colors.readerBackground}]}
          page={currentPage}
          onPageChanged={handlePageChange}
          onError={(error: any) => {
            console.log('PDF Error:', error);
            Alert.alert(
              'PDF Load Error',
              String(error?.message || error),
            );
          }}
          onLoadComplete={(total, filePath) => {
            Alert.alert(
              'PDF Loaded (debug)',
              `reported pages: ${total}\nfilePath prop: ${book.filePath}\nresolved path: ${filePath}`,
            );
            if (totalPages !== total) {
              setCurrentBook(book.id, total, currentPage);
            }
            if (book.totalPages !== total) {
              updateBook(book.id, {totalPages: total});
            }
          }}
          enablePaging
          horizontal={false}
          spacing={10}
          fitPolicy={2}
          renderActivityIndicator={() => (
            <ActivityIndicator size="large" color={colors.primary} />
          )}
        />

        {/* Highlight Overlays */}
        {overlayHighlights.map(overlay => (
          <TouchableOpacity
            key={overlay.id}
            style={[
              styles.highlightOverlay,
              {
                left: overlay.x,
                top: overlay.y,
                width: Math.max(overlay.width, 40),
                height: overlay.height,
                backgroundColor: overlay.color + '60',
                borderColor: overlay.color,
              },
            ]}
            onPress={(e) => {
              e.stopPropagation();
              if (overlay.comment) {
                Alert.alert('Note', overlay.comment, [{text: 'OK'}]);
              }
            }}
            onLongPress={(e) => {
              e.stopPropagation();
              handleDeleteHighlightConfirm(overlay.id);
            }}
          />
        ))}
      </TouchableOpacity>

      {/* Top Controls */}
      <Animated.View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.surface + 'ee',
            opacity: controlsAnim,
            transform: [{translateY: controlsAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-80, 0],
            })}],
          },
        ]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.barBtn}>
          <Icon name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.pageText, {color: colors.text, fontFamily: fonts.medium}]}>
          {t('reader.pageOf', {current: currentPage, total: totalPages || '?'})}
        </Text>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={() => setShowHighlightsPanel(true)} style={styles.barBtn}>
            <Icon name="bookmark-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowAddNoteModal(true)} style={styles.barBtn}>
            <Icon name="pencil-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Bottom Controls */}
      <Animated.View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface + 'ee',
            opacity: controlsAnim,
            transform: [{translateY: controlsAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [80, 0],
            })}],
          },
        ]}>
        <TouchableOpacity onPress={handlePrevPage} style={styles.navBtn}>
          <Icon name="chevron-back" size={24} color={currentPage <= 1 ? colors.textMuted : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pageBtn}
          onPress={() => setShowGoToModal(true)}>
          <Text style={[styles.pageBtnText, {color: colors.primary, fontFamily: fonts.semibold}]}>
            {currentPage} / {totalPages || '?'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNextPage} style={styles.navBtn}>
          <Icon name="chevron-forward" size={24} color={currentPage >= totalPages ? colors.textMuted : colors.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Go To Page Modal */}
      <Modal
        visible={showGoToModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoToModal(false)}>
        <View style={[styles.modalOverlay, {backgroundColor: colors.overlay}]}>
          <View style={[styles.modalContent, {backgroundColor: colors.surface}]}>
            <Text style={[styles.modalTitle, {color: colors.text, fontFamily: fonts.semibold}]}>
              {t('reader.jumpToPage')}
            </Text>
            <TextInput
              style={[styles.modalInput, {backgroundColor: colors.background, color: colors.text, borderColor: colors.border}]}
              placeholder={t('reader.pagePlaceholder')}
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={goToPage}
              onChangeText={setGoToPage}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: colors.surfaceVariant}]}
                onPress={() => setShowGoToModal(false)}>
                <Text style={{color: colors.text}}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: colors.primary}]}
                onPress={handleJumpToPage}>
                <Text style={{color: '#fff', fontWeight: '600'}}>{t('reader.goToPage')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Note / Highlight Modal */}
      <Modal
        visible={showAddNoteModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddNoteModal(false)}>
        <View style={[styles.modalOverlay, {backgroundColor: colors.overlay}]}>
          <View style={[styles.modalContent, {backgroundColor: colors.surface}]}>
            <Text style={[styles.modalTitle, {color: colors.text, fontFamily: fonts.semibold}]}>
              {t('reader.addNote')}
            </Text>

            {/* Color Picker */}
            <View style={styles.colorPicker}>
              <Text style={[styles.colorLabel, {color: colors.textSecondary}]}>{t('reader.highlightColor')}</Text>
              <View style={styles.colorRow}>
                {HIGHLIGHT_COLORS.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorBtn,
                      {backgroundColor: color},
                      selectedHighlightColor === color && styles.colorBtnSelected,
                    ]}
                    onPress={() => setSelectedHighlightColor(color)}
                  />
                ))}
              </View>
            </View>

            <TextInput
              style={[styles.noteInput, {backgroundColor: colors.background, color: colors.text, borderColor: colors.border}]}
              placeholder={t('reader.enterNote')}
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              value={noteText}
              onChangeText={setNoteText}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: colors.surfaceVariant}]}
                onPress={() => setShowAddNoteModal(false)}>
                <Text style={{color: colors.text}}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: colors.primary}]}
                onPress={handleAddHighlight}>
                <Text style={{color: '#fff', fontWeight: '600'}}>{t('reader.saveHighlight')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Highlights Panel */}
      <Modal
        visible={showHighlightsPanel}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHighlightsPanel(false)}>
        <View style={[styles.panelOverlay, {backgroundColor: colors.overlay}]}>
          <View style={[styles.panel, {backgroundColor: colors.surface}]}>
            <View style={styles.panelHeader}>
              <Text style={[styles.panelTitle, {color: colors.text, fontFamily: fonts.semibold}]}>
                {t('reader.highlightsOnPage')}
              </Text>
              <TouchableOpacity onPress={() => setShowHighlightsPanel(false)}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {highlights.length === 0 ? (
              <View style={styles.emptyPanel}>
                <Icon name="bookmark-outline" size={48} color={colors.textMuted} />
                <Text style={{color: colors.textMuted, marginTop: 12}}>
                  {t('reader.noHighlightsOnPage')}
                </Text>
              </View>
            ) : (
              <FlatList
                data={highlights}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.highlightsList}
                renderItem={({item}) => (
                  <View style={[styles.highlightItem, {borderBottomColor: colors.border}]}>
                    <View style={styles.highlightHeader}>
                      <View style={[styles.highlightDot, {backgroundColor: item.color}]} />
                      <Text style={[styles.highlightPage, {color: colors.textMuted}]}>
                        {t('vault.page', {page: item.pageNumber})}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteHighlightConfirm(item.id)}
                        style={styles.highlightDelete}>
                        <Icon name="trash-outline" size={16} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                    {item.selectedText ? (
                      <Text style={[styles.highlightText, {color: colors.text}]} numberOfLines={2}>
                        "{item.selectedText}"
                      </Text>
                    ) : null}
                    {item.comment ? (
                      <Text style={[styles.highlightComment, {color: colors.textSecondary}]}>
                        📝 {item.comment}
                      </Text>
                    ) : null}
                  </View>
                )}
              />
            )}
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
  pdfContainer: {
    flex: 1,
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: SCREEN_W,
    height: SCREEN_H,
  },
  highlightOverlay: {
    position: 'absolute',
    borderRadius: 3,
    borderWidth: 1,
    zIndex: 10,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    zIndex: 100,
  },
  barBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  topActions: {
    flexDirection: 'row',
    gap: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  navBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pageBtnText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  modalInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  noteInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPicker: {
    marginBottom: 16,
  },
  colorLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorBtnSelected: {
    borderColor: '#0f172a',
    borderWidth: 3,
    transform: [{scale: 1.1}],
  },
  panelOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_H * 0.7,
    paddingTop: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  panelTitle: {
    fontSize: 17,
  },
  emptyPanel: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  highlightsList: {
    padding: 16,
  },
  highlightItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  highlightDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  highlightPage: {
    fontSize: 12,
    flex: 1,
  },
  highlightDelete: {
    padding: 4,
  },
  highlightText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  highlightComment: {
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
});
