import { WeighRecord, PrinterSettings, ItemCategoryPreset } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'sinergi_ballpress_settings_v2',
  HISTORY: 'sinergi_ballpress_history_v2',
  CATEGORIES: 'sinergi_ballpress_categories_v2',
  LAST_COUNTER: 'sinergi_ballpress_receipt_counter_v2',
};

export const DEFAULT_SETTINGS: PrinterSettings = {
  namaUsaha: 'SINERGI BALLPRESS',
  subJudul: 'LABEL RESMI HASIL PRESS',
  alamat: 'Bantul, D.I. Yogyakarta',
  telepon: '081325886282',
  footerPesan: 'Label Barang Resmi Sinergi Ballpress - Bantul Yogyakarta',
  paperWidth: '58mm',
  feedLines: 3,
  cutPaper: true,
  showBarcode: false,
  showQRCode: false,
  showOperator: false,
  showTaraGross: false,
  showSignature: false,
  autoPrintOnSave: true,
  soundEnabled: true,
  darkReceipt: false,
};

export const DEFAULT_CATEGORIES: ItemCategoryPreset[] = [
  { id: '1', name: 'Ballpress BN', defaultTara: 0, satuan: 'kg', prefix: 'B-BN' },
  { id: '2', name: 'Ballpress BM', defaultTara: 0, satuan: 'kg', prefix: 'B-BM' },
  { id: '3', name: 'Ballpress Mix', defaultTara: 0, satuan: 'kg', prefix: 'B-MIX' },
  { id: '4', name: 'Ballpress Botol minyak', defaultTara: 0, satuan: 'kg', prefix: 'B-BTM' },
  { id: '5', name: 'Ballpress warna', defaultTara: 0, satuan: 'kg', prefix: 'B-WRN' },
];

export function getStoredSettings(): PrinterSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: PrinterSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function getStoredHistory(): WeighRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load history', e);
  }
  return [];
}

export function saveWeighRecord(record: WeighRecord): WeighRecord[] {
  try {
    const current = getStoredHistory();
    // Add to beginning of array
    const updated = [record, ...current.filter((r) => r.id !== record.id)];
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save history record', e);
    return [];
  }
}

export function deleteWeighRecord(id: string): WeighRecord[] {
  try {
    const current = getStoredHistory();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export function clearWeighHistory(): void {
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

export function getStoredCategories(): ItemCategoryPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load categories', e);
  }
  return DEFAULT_CATEGORIES;
}

export function saveStoredCategories(categories: ItemCategoryPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
}

export function getNextReceiptNumber(): string {
  try {
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const rawCounter = localStorage.getItem(STORAGE_KEYS.LAST_COUNTER);
    let counter = 1;
    if (rawCounter) {
      const parsed = JSON.parse(rawCounter);
      if (parsed.date === ymd) {
        counter = parsed.count + 1;
      }
    }
    localStorage.setItem(STORAGE_KEYS.LAST_COUNTER, JSON.stringify({ date: ymd, count: counter }));
    return `BALL-${ymd}-${String(counter).padStart(3, '0')}`;
  } catch {
    return `BALL-${Date.now().toString().slice(-6)}`;
  }
}
