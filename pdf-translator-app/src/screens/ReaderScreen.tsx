import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { TranslationModal } from '../components/TranslationModal';
import { translateAndExplain } from '../services/aiService';
import { extractTextFromPDF } from '../services/pdfService';
import { saveVocabularyEntry } from '../services/storageService';
import { RootStackParamList, TranslationResult } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reader'>;
  route: RouteProp<RootStackParamList, 'Reader'>;
};

interface Token {
  text: string;
  index: number;
  isWhitespace: boolean;
}

function tokenize(text: string): Token[] {
  const parts = text.split(/(\s+)/);
  const tokens: Token[] = [];
  let idx = 0;
  for (const part of parts) {
    if (part === '') continue;
    tokens.push({
      text: part,
      index: idx++,
      isWhitespace: /^\s+$/.test(part),
    });
  }
  return tokens;
}

export function ReaderScreen({ route, navigation }: Props) {
  const { pdfUri, pdfName } = route.params;

  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Word selection state
  const [anchorIndex, setAnchorIndex] = useState<number | null>(null);
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

  // Translation popup state
  const [modalVisible, setModalVisible] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translationResult, setTranslationResult] =
    useState<TranslationResult | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [savedToVocab, setSavedToVocab] = useState(false);

  const actionBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    navigation.setOptions({ title: pdfName });
  }, [navigation, pdfName]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingPdf(true);
        const text = await extractTextFromPDF(pdfUri);
        setExtractedText(text);
        setTokens(tokenize(text));
      } catch (err) {
        setPdfError(
          err instanceof Error ? err.message : 'Erro ao extrair texto do PDF'
        );
      } finally {
        setLoadingPdf(false);
      }
    })();
  }, [pdfUri]);

  const hasSelection = selectionStart !== null && selectionEnd !== null;

  // Animate action bar in/out
  useEffect(() => {
    Animated.spring(actionBarAnim, {
      toValue: hasSelection ? 1 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [hasSelection, actionBarAnim]);

  function isInSelection(tokenIndex: number) {
    if (selectionStart === null || selectionEnd === null) return false;
    return tokenIndex >= selectionStart && tokenIndex <= selectionEnd;
  }

  function handleWordPress(token: Token) {
    if (token.isWhitespace) return;

    if (anchorIndex === null) {
      // First tap: start selection
      setAnchorIndex(token.index);
      setSelectionStart(token.index);
      setSelectionEnd(token.index);
    } else {
      // Subsequent tap: extend range from anchor to this token
      const newStart = Math.min(anchorIndex, token.index);
      const newEnd = Math.max(anchorIndex, token.index);
      setSelectionStart(newStart);
      setSelectionEnd(newEnd);
    }
  }

  function cancelSelection() {
    setAnchorIndex(null);
    setSelectionStart(null);
    setSelectionEnd(null);
  }

  const getSelectedText = useCallback(() => {
    if (selectionStart === null || selectionEnd === null) return '';
    return tokens
      .filter((t) => t.index >= selectionStart && t.index <= selectionEnd)
      .map((t) => t.text)
      .join('')
      .trim();
  }, [tokens, selectionStart, selectionEnd]);

  async function handleTranslate() {
    const term = getSelectedText();
    if (!term) return;

    setSelectedTerm(term);
    setTranslationResult(null);
    setTranslationError(null);
    setSavedToVocab(false);
    setTranslating(true);
    setModalVisible(true);
    cancelSelection();

    try {
      const result = await translateAndExplain(term);
      setTranslationResult(result);
      await saveVocabularyEntry({
        term,
        translation: result.translation,
        explanation: result.explanation,
        example: result.example,
      });
      setSavedToVocab(true);
    } catch (err) {
      setTranslationError(
        err instanceof Error ? err.message : 'Erro ao traduzir'
      );
    } finally {
      setTranslating(false);
    }
  }

  function closeModal() {
    setModalVisible(false);
    setTranslationResult(null);
    setTranslationError(null);
  }

  const selectedWordCount =
    selectionStart !== null && selectionEnd !== null
      ? tokens
          .slice(selectionStart, selectionEnd + 1)
          .filter((t) => !t.isWhitespace).length
      : 0;

  const actionBarTranslateY = actionBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, 0],
  });

  if (loadingPdf) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Extraindo texto do PDF…</Text>
      </View>
    );
  }

  if (pdfError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Não foi possível ler o PDF</Text>
        <Text style={styles.errorDetail}>{pdfError}</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {hasSelection && (
        <View style={styles.selectionHint}>
          <Text style={styles.selectionHintText}>
            {selectedWordCount} {selectedWordCount === 1 ? 'palavra' : 'palavras'} selecionada
            {selectedWordCount !== 1 ? 's' : ''} — toque em mais palavras para
            ampliar
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.textContainer}>
          {tokens.map((token) => {
            if (token.isWhitespace) {
              return (
                <Text key={token.index} style={styles.space}>
                  {token.text.includes('\n') ? '\n' : ' '}
                </Text>
              );
            }
            const selected = isInSelection(token.index);
            const isAnchor = token.index === anchorIndex;
            return (
              <TouchableOpacity
                key={token.index}
                onPress={() => handleWordPress(token)}
                activeOpacity={0.7}
                style={[
                  styles.wordWrapper,
                  selected && styles.wordWrapperSelected,
                  isAnchor && styles.wordWrapperAnchor,
                ]}
              >
                <Text
                  style={[
                    styles.word,
                    selected && styles.wordSelected,
                  ]}
                >
                  {token.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating action bar */}
      <Animated.View
        style={[
          styles.actionBar,
          { transform: [{ translateY: actionBarTranslateY }] },
        ]}
        pointerEvents={hasSelection ? 'auto' : 'none'}
      >
        <TouchableOpacity style={styles.cancelBtn} onPress={cancelSelection}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.translateBtn}
          onPress={handleTranslate}
        >
          <Text style={styles.translateBtnText}>Traduzir seleção</Text>
        </TouchableOpacity>
      </Animated.View>

      <TranslationModal
        visible={modalVisible}
        term={selectedTerm}
        result={translationResult}
        loading={translating}
        error={translationError}
        saved={savedToVocab}
        onClose={closeModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFB',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 15,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  backBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  selectionHint: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#BFDBFE',
  },
  selectionHintText: {
    fontSize: 12,
    color: '#3B82F6',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  space: {
    fontSize: 16,
    lineHeight: 28,
    color: '#1F2937',
  },
  wordWrapper: {
    borderRadius: 4,
    paddingHorizontal: 1,
    paddingVertical: 1,
  },
  wordWrapperSelected: {
    backgroundColor: '#BFDBFE',
  },
  wordWrapperAnchor: {
    backgroundColor: '#93C5FD',
  },
  word: {
    fontSize: 16,
    lineHeight: 28,
    color: '#1F2937',
    letterSpacing: 0.1,
  },
  wordSelected: {
    color: '#1E40AF',
    fontWeight: '500',
  },
  actionBar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#374151',
  },
  cancelBtnText: {
    color: '#D1D5DB',
    fontWeight: '600',
    fontSize: 15,
  },
  translateBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#3B82F6',
  },
  translateBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
