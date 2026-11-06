/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  WeighRecord,
  PrinterSettings,
  PrinterDeviceState,
  ItemCategoryPreset,
} from './types';
import {
  getStoredSettings,
  saveStoredSettings,
  getStoredHistory,
  saveWeighRecord,
  deleteWeighRecord,
  clearWeighHistory,
  getStoredCategories,
  saveStoredCategories,
  getNextReceiptNumber,
} from './utils/storage';
import { printerService } from './utils/bluetoothPrinter';
import { buildEscPosPayload } from './utils/escpos';
import { soundManager } from './utils/audioEffects';

import { Header } from './components/Header';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { WeighForm } from './components/WeighForm';
import { ReceiptPreview } from './components/ReceiptPreview';
import { PrinterConnectionModal } from './components/PrinterConnectionModal';
import { SettingsModal } from './components/SettingsModal';
import { HistoryList } from './components/HistoryList';
import { AndroidGuideModal } from './components/AndroidGuideModal';
import {
  Printer,
  Bluetooth,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // App States
  const [settings, setSettings] = useState<PrinterSettings>(getStoredSettings);
  const [history, setHistory] = useState<WeighRecord[]>(getStoredHistory);
  const [categories, setCategories] = useState<ItemCategoryPreset[]>(getStoredCategories);
  const [currentReceiptNumber, setCurrentReceiptNumber] = useState<string>(getNextReceiptNumber);
  const [selectedPreviewRecord, setSelectedPreviewRecord] = useState<WeighRecord | null>(null);

  // Printer Device Connection State
  const [printerState, setPrinterState] = useState<PrinterDeviceState>(printerService.getState());

  // Modal Controls
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Printing & Feedback State
  const [isPrinting, setIsPrinting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Subscribe to Bluetooth printer connection status changes
  useEffect(() => {
    const unsubscribe = printerService.subscribe((state) => {
      setPrinterState(state);
    });

    // Auto-update to SINERGI BALLPRESS & clean label mode (no barcode, no signature)
    if (
      settings.telepon !== '081325886282' ||
      settings.showBarcode !== false ||
      settings.showSignature !== false ||
      settings.showOperator !== false
    ) {
      const updated = {
        ...settings,
        namaUsaha: 'SINERGI BALLPRESS',
        subJudul: 'LABEL RESMI HASIL PRESS',
        alamat: 'Bantul, D.I. Yogyakarta',
        telepon: '081325886282',
        footerPesan: 'Label Barang Resmi Sinergi Ballpress - Bantul Yogyakarta',
        showTaraGross: false,
        showBarcode: false,
        showQRCode: false,
        showOperator: false,
        showSignature: false,
      };
      setSettings(updated);
      saveStoredSettings(updated);
    }

    return () => unsubscribe();
  }, []);

  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success',
    duration = 4000
  ) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, duration);
  };

  // Toggle Sound Effect
  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    setSettings(updated);
    saveStoredSettings(updated);
    if (updated.soundEnabled) {
      soundManager.playBeep(880, 0.08);
    }
  };

  // Save Settings
  const handleSaveSettings = (newSettings: PrinterSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    showNotification('Pengaturan struk berhasil disimpan', 'success');
  };

  // Add Category Preset
  const handleAddCategory = (newCat: ItemCategoryPreset) => {
    const updated = [...categories, newCat];
    setCategories(updated);
    saveStoredCategories(updated);
    showNotification(`Kategori "${newCat.name}" ditambahkan`, 'success');
  };

  // Reset Form
  const handleResetForm = () => {
    setCurrentReceiptNumber(getNextReceiptNumber());
    if (settings.soundEnabled) soundManager.playBeep(500, 0.05);
    showNotification('Formulir berhasil direset', 'info');
  };

  // Primary Print Handler
  const handlePrint = async (record: WeighRecord): Promise<boolean> => {
    setIsPrinting(true);
    setSelectedPreviewRecord(record);

    // Play realistic stepping motor buzz audio
    if (settings.soundEnabled) {
      soundManager.playPrintSound(1000);
    }

    try {
      const payload = buildEscPosPayload(record, settings);

      // If not connected to any printer yet, automatically prompt connection or use simulation
      if (!printerState.connected) {
        // Run simulated print and notify user
        printerService.setSimulationMode();
        showNotification(
          'Mencetak ke mode simulasi (Hubungkan Bluetooth jika ingin mencetak fisik ke kertas)',
          'info',
          5000
        );
      }

      const success = await printerService.printBytes(payload);

      if (success) {
        // Save to history
        const updatedHistory = saveWeighRecord({
          ...record,
          printedAt: new Date().toISOString(),
        });
        setHistory(updatedHistory);

        // Advance to next receipt number
        setCurrentReceiptNumber(getNextReceiptNumber());

        showNotification(
          `Struk ${record.receiptNumber} (${record.jenisBarang} - ${record.beratNetto} ${record.satuan}) berhasil dicetak!`,
          'success'
        );
        return true;
      } else {
        showNotification(
          printerState.lastError || 'Gagal mengirim data ke printer. Periksa Bluetooth Anda.',
          'error'
        );
        return false;
      }
    } catch (err: any) {
      console.error('Print failure:', err);
      showNotification('Terjadi kesalahan saat mencetak: ' + (err.message || ''), 'error');
      return false;
    } finally {
      setIsPrinting(false);
    }
  };

  // Print via Android RawBT intent
  const handlePrintRawBT = (record: WeighRecord) => {
    setSelectedPreviewRecord(record);
    const payload = buildEscPosPayload(record, settings);
    printerService.printViaRawBT(payload);

    // Save to history
    const updatedHistory = saveWeighRecord({
      ...record,
      printedAt: new Date().toISOString(),
    });
    setHistory(updatedHistory);
    setCurrentReceiptNumber(getNextReceiptNumber());
    showNotification(`Membuka RawBT untuk ${record.receiptNumber}`, 'info');
  };

  // Print via System Spooler / Browser
  const handlePrintSystem = (record: WeighRecord) => {
    setSelectedPreviewRecord(record);
    const updatedHistory = saveWeighRecord({
      ...record,
      printedAt: new Date().toISOString(),
    });
    setHistory(updatedHistory);
    setCurrentReceiptNumber(getNextReceiptNumber());

    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Save Without Print
  const handleSaveWithoutPrint = (record: WeighRecord) => {
    const updatedHistory = saveWeighRecord({
      ...record,
      printCount: 0,
    });
    setHistory(updatedHistory);
    setSelectedPreviewRecord(record);
    setCurrentReceiptNumber(getNextReceiptNumber());
    showNotification(`Data ${record.receiptNumber} disimpan ke riwayat`, 'success');
  };

  // Reprint previous transaction
  const handleReprint = async (record: WeighRecord) => {
    if (settings.soundEnabled) soundManager.playPrintSound(900);
    const payload = buildEscPosPayload(
      { ...record, printCount: record.printCount + 1 },
      settings
    );

    if (!printerState.connected) {
      printerService.setSimulationMode();
    }

    const success = await printerService.printBytes(payload);
    if (success) {
      const updated = saveWeighRecord({
        ...record,
        printCount: record.printCount + 1,
        printedAt: new Date().toISOString(),
      });
      setHistory(updated);
      showNotification(`Cetak ulang ${record.receiptNumber} berhasil!`, 'success');
    }
  };

  // Delete single history item
  const handleDeleteRecord = (id: string) => {
    const updated = deleteWeighRecord(id);
    setHistory(updated);
    showNotification('Data riwayat dihapus', 'info');
  };

  // Clear all history
  const handleClearAllHistory = () => {
    clearWeighHistory();
    setHistory([]);
    showNotification('Semua riwayat berhasil dikosongkan', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. Android PWA Install Banner */}
      <PWAInstallBanner />

      {/* 2. Top Navigation Bar */}
      <Header
        printerState={printerState}
        onOpenPrinterModal={() => setIsPrinterModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        soundEnabled={settings.soundEnabled}
        onToggleSound={handleToggleSound}
        historyCount={history.length}
        namaUsaha={settings.namaUsaha}
        lokasi={settings.alamat}
      />

      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 px-4 w-full max-w-md">
          <div
            className={`p-3 rounded-xl shadow-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-bounce ${
              notification.type === 'success'
                ? 'bg-emerald-900/95 border-emerald-500 text-emerald-100'
                : notification.type === 'error'
                ? 'bg-rose-900/95 border-rose-500 text-rose-100'
                : 'bg-blue-900/95 border-blue-500 text-blue-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : notification.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs opacity-75 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 no-print">
        {/* Quick Connection Notification if Disconnected */}
        {!printerState.connected && (
          <div className="mb-4 bg-gradient-to-r from-blue-950/70 to-slate-900 border border-blue-800/50 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                <Bluetooth className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm">
                <span className="font-bold text-white block">
                  Printer Thermal Belum Terhubung
                </span>
                <span className="text-slate-300">
                  Sambungkan ke printer Bluetooth (POS-58, GOOJPRT, Panda, Eppos, dll.) untuk cetak langsung dari HP Android.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsPrinterModalOpen(true)}
                className="flex-1 sm:flex-initial py-2 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer text-center"
              >
                Sambungkan Printer
              </button>
              <button
                type="button"
                onClick={() => setIsGuideModalOpen(true)}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                Panduan
              </button>
            </div>
          </div>
        )}

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (Inputs & Scale) - 7 cols on desktop */}
          <div className="lg:col-span-7 space-y-4">
            <WeighForm
              settings={settings}
              categories={categories}
              currentReceiptNumber={currentReceiptNumber}
              onPrint={handlePrint}
              onPrintRawBT={handlePrintRawBT}
              onPrintSystem={handlePrintSystem}
              onSaveWithoutPrint={handleSaveWithoutPrint}
              onReset={handleResetForm}
              onAddCategory={handleAddCategory}
              soundEnabled={settings.soundEnabled}
            />
          </div>

          {/* Right Column (Live Thermal Receipt Preview) - 5 cols on desktop */}
          <div className="lg:col-span-5 space-y-4 sticky top-16">
            <ReceiptPreview
              record={selectedPreviewRecord}
              settings={settings}
              isPrinting={isPrinting}
              onPrintNow={() => {
                if (selectedPreviewRecord) {
                  handlePrint(selectedPreviewRecord);
                }
              }}
            />

            {/* Quick Operational Info Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  Informasi Operasional Android
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-400">
                  v1.2 POS
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Aplikasi ini dirancang khusus untuk operasional kasir, gudang, dan pos penimbangan di HP Android. Mendukung standar perintah <strong>ESC/POS</strong> untuk printer mini Bluetooth 58mm &amp; 80mm.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-slate-500 font-mono">
                <span className="bg-slate-950 px-2 py-0.5 rounded">✓ Web Bluetooth BLE</span>
                <span className="bg-slate-950 px-2 py-0.5 rounded">✓ Web Serial OTG</span>
                <span className="bg-slate-950 px-2 py-0.5 rounded">✓ Android RawBT</span>
                <span className="bg-slate-950 px-2 py-0.5 rounded">✓ PWA Standalone</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden Thermal Print Container for Window.print() */}
      <div className="hidden print-only font-thermal text-black bg-white">
        {selectedPreviewRecord && (
          <div className="p-2 space-y-1">
            <div className="text-center">
              <h2 className="font-bold text-sm uppercase">{settings.namaUsaha}</h2>
              {settings.subJudul && <p className="text-[10px]">{settings.subJudul}</p>}
              {settings.alamat && <p className="text-[9px]">{settings.alamat}</p>}
              {settings.telepon && <p className="text-[9px]">Telp: {settings.telepon}</p>}
              <div className="my-1 border-t border-black" />
              <p className="font-black text-xs uppercase">LABEL HASIL PRESS</p>
              <div className="my-1 border-t border-black" />
            </div>

            <div className="text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>No. Bal:</span>
                <span className="font-bold">{selectedPreviewRecord.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal:</span>
                <span>{new Date(selectedPreviewRecord.tanggalProses).toLocaleDateString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{new Date(selectedPreviewRecord.tanggalProses).toLocaleTimeString('id-ID')}</span>
              </div>
            </div>

            <div className="my-1 border-t border-black" />

            <div className="py-1">
              <div className="text-[9px] uppercase">JENIS BARANG:</div>
              <div className="text-xs font-bold uppercase">{selectedPreviewRecord.jenisBarang}</div>
              {selectedPreviewRecord.kodeBarang && (
                <div className="text-[10px]">Kode: {selectedPreviewRecord.kodeBarang}</div>
              )}
            </div>

            <div className="my-1 border-t border-black" />

            <div className="text-center py-3 border-4 border-black bg-white text-black rounded my-2">
              <span className="text-[10px] uppercase font-black block mb-1 text-black">BERAT BERSIH (NETTO):</span>
              <span className="text-4xl font-black font-mono block text-black">
                {selectedPreviewRecord.beratNetto} {selectedPreviewRecord.satuan.toUpperCase()}
              </span>
            </div>

            <div className="my-2 border-t border-black" />

            {settings.footerPesan && (
              <p className="text-[9px] text-center">{settings.footerPesan}</p>
            )}

            <div className="h-6" />
          </div>
        )}
      </div>

      {/* Modals */}
      <PrinterConnectionModal
        isOpen={isPrinterModalOpen}
        onClose={() => setIsPrinterModalOpen(false)}
        printerState={printerState}
        settings={settings}
        onOpenGuide={() => {
          setIsPrinterModalOpen(false);
          setIsGuideModalOpen(true);
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <HistoryList
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        settings={settings}
        onReprint={handleReprint}
        onSelectPreview={(rec) => setSelectedPreviewRecord(rec)}
        onDeleteRecord={handleDeleteRecord}
        onClearAll={handleClearAllHistory}
      />

      <AndroidGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
