import React from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TranslationResult } from '../types';

interface Props {
  visible: boolean;
  term: string;
  result: TranslationResult | null;
  loading: boolean;
  error: string | null;
  saved: boolean;
  onClose: () => void;
}

export function TranslationModal({
  visible,
  term,
  result,
  loading,
  error,
  saved,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text style={styles.term} numberOfLines={3}>
            {term}
          </Text>

          {loading && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Traduzindo…</Text>
            </View>
          )}

          {error && !loading && (
            <View style={styles.center}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {result && !loading && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.resultScroll}
            >
              <Section label="Tradução" value={result.translation} accent />
              <Section label="Explicação" value={result.explanation} />
              <Section label="Exemplo de uso" value={result.example} italic />
              {saved && (
                <Text style={styles.savedBadge}>
                  ✓ Salvo no vocabulário
                </Text>
              )}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Section({
  label,
  value,
  accent,
  italic,
}: {
  label: string;
  value: string;
  accent?: boolean;
  italic?: boolean;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text
        style={[
          styles.sectionValue,
          accent && styles.accentValue,
          italic && styles.italicValue,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  term: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  center: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 15,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
  },
  resultScroll: {
    marginBottom: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#6B7280',
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  accentValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
  },
  italicValue: {
    fontStyle: 'italic',
    color: '#374151',
  },
  savedBadge: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    marginBottom: 12,
  },
  closeBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
