import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  deleteVocabularyEntry,
  getVocabularyEntries,
} from '../services/storageService';
import { RootStackParamList, VocabularyEntry } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Vocabulary'>;
};

export function VocabularyScreen({ navigation: _navigation }: Props) {
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getVocabularyEntries().then(setEntries);
    }, [])
  );

  async function handleDelete(entry: VocabularyEntry) {
    Alert.alert(
      'Remover palavra',
      `Remover "${entry.term}" do vocabulário?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await deleteVocabularyEntry(entry.id);
            setEntries((prev) => prev.filter((e) => e.id !== entry.id));
          },
        },
      ]
    );
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyEmoji}>📚</Text>
        <Text style={styles.emptyTitle}>Nenhuma palavra salva</Text>
        <Text style={styles.emptySub}>
          Abra um PDF e toque em palavras{'\n'}para começar a aprender
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text style={styles.countLabel}>
        {entries.length} {entries.length === 1 ? 'palavra' : 'palavras'} aprendida
        {entries.length !== 1 ? 's' : ''}
      </Text>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const expanded = expandedId === item.id;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => toggleExpand(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitles}>
                  <Text style={styles.term}>{item.term}</Text>
                  <Text style={styles.translation}>{item.translation}</Text>
                </View>
                <View style={styles.cardActions}>
                  <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.deleteIcon}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {expanded && (
                <View style={styles.cardBody}>
                  <Text style={styles.bodyLabel}>Explicação</Text>
                  <Text style={styles.bodyText}>{item.explanation}</Text>
                  <Text style={[styles.bodyLabel, { marginTop: 10 }]}>
                    Exemplo
                  </Text>
                  <Text style={[styles.bodyText, styles.exampleText]}>
                    {item.example}
                  </Text>
                  <Text style={styles.dateText}>
                    Salvo em {formatDate(item.savedAt)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F9FAFB',
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  countLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#9CA3AF',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitles: {
    flex: 1,
    marginRight: 12,
  },
  term: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  translation: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '500',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chevron: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  deleteIcon: {
    fontSize: 18,
  },
  cardBody: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  bodyLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 21,
  },
  exampleText: {
    fontStyle: 'italic',
  },
  dateText: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 12,
    textAlign: 'right',
  },
});
