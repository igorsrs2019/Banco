import AsyncStorage from '@react-native-async-storage/async-storage';
import { VocabularyEntry } from '../types';

const VOCAB_KEY = '@pdf_translator:vocabulary';

export async function getVocabularyEntries(): Promise<VocabularyEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(VOCAB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveVocabularyEntry(
  entry: Omit<VocabularyEntry, 'id' | 'savedAt'>
): Promise<void> {
  const entries = await getVocabularyEntries();
  const existing = entries.findIndex(
    (e) => e.term.toLowerCase() === entry.term.toLowerCase()
  );

  const newEntry: VocabularyEntry = {
    ...entry,
    id: existing >= 0 ? entries[existing].id : Date.now().toString(),
    savedAt: Date.now(),
  };

  if (existing >= 0) {
    entries[existing] = newEntry;
  } else {
    entries.unshift(newEntry);
  }

  await AsyncStorage.setItem(VOCAB_KEY, JSON.stringify(entries));
}

export async function deleteVocabularyEntry(id: string): Promise<void> {
  const entries = await getVocabularyEntries();
  const filtered = entries.filter((e) => e.id !== id);
  await AsyncStorage.setItem(VOCAB_KEY, JSON.stringify(filtered));
}
