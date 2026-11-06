export type WeightUnit = 'kg' | 'g' | 'ton';

export interface WeighRecord {
  id: string;
  receiptNumber: string;
  jenisBarang: string;
  kodeBarang: string;
  tanggalProses: string; // ISO string
  beratGross: number;
  beratTara: number;
  beratNetto: number;
  satuan: WeightUnit;
  operator: string;
  nomorLot?: string;
  shift?: string;
  catatan?: string;
  hargaPerSatuan?: number;
  totalHarga?: number;
  printedAt?: string;
  printCount: number;
}

export interface PrinterSettings {
  namaUsaha: string;
  subJudul: string;
  alamat: string;
  telepon: string;
  footerPesan: string;
  paperWidth: '58mm' | '80mm';
  feedLines: number;
  cutPaper: boolean;
  showBarcode: boolean;
  showQRCode: boolean;
  showOperator: boolean;
  showTaraGross: boolean;
  showSignature: boolean;
  autoPrintOnSave: boolean;
  soundEnabled: boolean;
  darkReceipt: boolean;
}

export type ConnectionType = 'none' | 'bluetooth' | 'serial' | 'rawbt' | 'system';

export interface PrinterDeviceState {
  type: ConnectionType;
  deviceName: string | null;
  connected: boolean;
  connecting: boolean;
  lastError: string | null;
  batteryLevel?: number | null;
}

export interface ItemCategoryPreset {
  id: string;
  name: string;
  defaultTara: number;
  satuan: WeightUnit;
  prefix: string;
}
