import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import React, { useCallback, useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';

const RECENT_KEY = '@pdf_translator:recent_files';

interface RecentFile {
  uri: string;
  name: string;
  openedAt: number;
}

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export function HomeScreen({ navigation }: Props) {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);

  const loadRecent = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(RECENT_KEY);
      if (raw) setRecentFiles(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadRecent);
    return unsubscribe;
  }, [navigation, loadRecent]);

  async function saveRecent(file: RecentFile) {
    const existing = recentFiles.filter((f) => f.uri !== file.uri);
    const updated = [file, ...existing].slice(0, 10);
    setRecentFiles(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  }

  async function pickPDF() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const destUri =
        FileSystem.cacheDirectory + encodeURIComponent(asset.name);

      await FileSystem.copyAsync({ from: asset.uri, to: destUri });

      const recentFile: RecentFile = {
        uri: destUri,
        name: asset.name,
        openedAt: Date.now(),
      };
      await saveRecent(recentFile);
      navigation.navigate('Reader', {
        pdfUri: destUri,
        pdfName: asset.name,
      });
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível abrir o PDF.');
    }
  }

  async function openRecent(file: RecentFile) {
    const info = await FileSystem.getInfoAsync(file.uri);
    if (!info.exists) {
      Alert.alert(
        'Arquivo não encontrado',
        'O arquivo foi removido do cache. Importe-o novamente.'
      );
      const filtered = recentFiles.filter((f) => f.uri !== file.uri);
      setRecentFiles(filtered);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(filtered));
      return;
    }
    navigation.navigate('Reader', { pdfUri: file.uri, pdfName: file.name });
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>📖</Text>
        <Text style={styles.heroTitle}>PDF Translator</Text>
        <Text style={styles.heroSub}>
          Importe um PDF em inglês, toque nas palavras{'\n'}e aprenda com IA
        </Text>
      </View>

      <TouchableOpacity style={styles.importBtn} onPress={pickPDF}>
        <Text style={styles.importBtnText}>＋  Importar PDF</Text>
      </TouchableOpacity>

      {recentFiles.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Arquivos recentes</Text>
          <FlatList
            data={recentFiles}
            keyExtractor={(item) => item.uri}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.fileItem}
                onPress={() => openRecent(item)}
              >
                <Text style={styles.fileIcon}>📄</Text>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.fileDate}>{formatDate(item.openedAt)}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  heroIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  importBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  importBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  fileIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  fileDate: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
