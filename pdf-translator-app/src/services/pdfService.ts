import * as FileSystem from 'expo-file-system/legacy';

// pdfjs-dist legacy build — works in React Native without DOM/Canvas for text extraction.
// The fake-worker fallback kicks in automatically when no workerSrc is provided in RN.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function cleanText(raw: string): string {
  return raw
    .replace(/\s{3,}/g, '\n\n') // triple+ spaces → paragraph break
    .replace(/ {2}/g, ' ')       // double spaces → single
    .trim();
}

export async function extractTextFromPDF(fileUri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const data = base64ToUint8Array(base64);

  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;

  const pageTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .filter((item: { str?: string }) => typeof item.str === 'string')
      .map((item: { str: string }) => item.str)
      .join(' ');

    if (pageText.trim()) {
      pageTexts.push(pageText);
    }
  }

  return cleanText(pageTexts.join('   '));
}
