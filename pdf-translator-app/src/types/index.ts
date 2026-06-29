export interface VocabularyEntry {
  id: string;
  term: string;
  translation: string;
  explanation: string;
  example: string;
  savedAt: number;
}

export interface TranslationResult {
  translation: string;
  explanation: string;
  example: string;
}

export type RootStackParamList = {
  Home: undefined;
  Reader: { pdfUri: string; pdfName: string };
  Vocabulary: undefined;
};
