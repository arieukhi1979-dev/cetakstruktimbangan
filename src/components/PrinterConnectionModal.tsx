import React, { useState } from 'react';
import { PrinterDeviceState, PrinterSettings } from '../types';
import { printerService } from '../utils/bluetoothPrinter';
import { buildTestPrintPayload } from '../utils/escpos';
import { soundManager } from '../utils/audioEffects';
import {
  Bluetooth,
  Usb,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Printer,
  Sliders,
  HelpCircle,
  Smartphone,
  Zap,
} from 'lucide-react';

interface PrinterConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  printerState: PrinterDeviceState;
  settings: PrinterSettings;
  onOpenGuide: () => void;
}

export const PrinterConnectionModal: React.FC<PrinterConnectionModalProps> = ({
  isOpen,
  onClose,
  printerState,
  settings,
  onOpenGuide,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const isBluetoothSupported = printerService.isWebBluetoothAvailable();
  const isSerialSupported = printerService.isWebSerialAvailable();

  const handleConnectBluetooth = async () => {
    setTestSuccess(null);
    if (settings.soundEnabled) soundManager.playBeep(800, 0.05);
    await printerService.connectBluetooth();
  };

  const handleConnectSerial = async () => {
    setTestSuccess(null);
    if (settings.soundEnabled) soundManager.playBeep(800, 0.05);
    await printerService.connectSerial();
  };

  const handleSimulationMode = () => {
    printerService.setSimulationMode();
    if (settings.soundEnabled) soundManager.playSuccessChime();
  };

  const handleDisconnect = () => {
    printerService.disconnect();
    setTestSuccess(null);
  };

  const handleTestPrint = async () => {
    setIsTesting(true);
    setTestSuccess(null);
    if (settings.soundEnabled) {
      soundManager.playPrintSound(800);
    }

    try {
      const testBytes = buildTestPrintPayload(settings);
      const ok = await printerService.printBytes(testBytes);
      setTestSuccess(ok);
    } catch {
      setTestSuccess(false);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Bluetooth className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Koneksi Printer Struk</h3>
              <p className="text-xs text-slate-400">Hubungkan printer thermal Bluetooth / USB</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Active Status Card */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              printerState.connected
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  printerState.connected
                    ? 'bg-emerald-400 animate-pulse'
                    : printerState.connecting
                    ? 'bg-amber-400 animate-spin'
                    : 'bg-slate-600'
                }`}
              />
              <div>
                <span className="text-xs font-semibold block text-white">
                  {printerState.connected
                    ? printerState.deviceName || 'Printer Terhubung'
                    : printerState.connecting
                    ? 'Sedang Mencari Printer...'
                    : 'Belum Terhubung ke Printer'}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {printerState.connected
                    ? `Mode: ${
                        printerState.type === 'bluetooth'
                          ? 'Bluetooth ESC/POS'
                          : printerState.type === 'serial'
                          ? 'USB OTG Serial'
                          : 'Virtual Simulator'
                      }`
                    : 'Pilih metode koneksi di bawah'}
                </span>
              </div>
            </div>

            {printerState.connected && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-xs px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 rounded-lg transition cursor-pointer"
              >
                Putuskan
              </button>
            )}
          </div>

          {/* Error Message if any */}
          {printerState.lastError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{printerState.lastError}</span>
            </div>
          )}

          {/* Connection Method Buttons */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pilih Saluran Koneksi
            </label>

            {/* 1. Bluetooth Connection (Primary for Android) */}
            <button
              type="button"
              onClick={handleConnectBluetooth}
              disabled={printerState.connecting}
              className="w-full p-3.5 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-800/80 hover:to-indigo-800/80 border border-blue-500/40 rounded-xl text-left flex items-center justify-between transition cursor-pointer group shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition">
                  <Bluetooth className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Pindai Printer Bluetooth</span>
                    <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.2 rounded font-normal">
                      Direkomendasikan di Android
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    POS-58, GOOJPRT, Panda, Eppos, Iware, Sunmi, dll.
                  </p>
                </div>
              </div>
              {printerState.connecting ? (
                <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
              ) : (
                <div className="text-xs text-blue-400 font-semibold">Pindai →</div>
              )}
            </button>

            {/* 2. USB OTG / Serial Connection */}
            <button
              type="button"
              onClick={handleConnectSerial}
              disabled={printerState.connecting}
              className="w-full p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-left flex items-center justify-between transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-200 shrink-0">
                  <Usb className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    Sambungkan Kabel USB OTG
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Untuk printer thermal desktop/kasir via kabel USB
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400">Hubungkan →</span>
            </button>

            {/* 3. Virtual Simulation Mode */}
            <button
              type="button"
              onClick={handleSimulationMode}
              className="w-full p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-left flex items-center justify-between transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-300">
                    Mode Simulasi Virtual POS
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Uji coba cetak & visual tanpa menghubungkan alat fisik
                  </p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-medium">Gunakan</span>
            </button>
          </div>

          {/* Test Print Section */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Uji Coba Cetak (Test Print)</span>
              {testSuccess === true && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Print Terkirim!
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleTestPrint}
              disabled={isTesting || !printerState.connected}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition cursor-pointer ${
                printerState.connected
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Mencetak Lembar Tes...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>
                    {printerState.connected
                      ? 'Cetak Struk Tes ke Printer'
                      : 'Hubungkan Printer Dulu untuk Tes'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Android Pairing Help Box */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5 text-slate-400">
            <div className="flex items-center justify-between text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                Tips Koneksi Android:
              </span>
              <button
                type="button"
                onClick={onOpenGuide}
                className="text-blue-400 hover:text-blue-300 text-[11px] underline cursor-pointer"
              >
                Lihat Panduan Lengkap
              </button>
            </div>
            <p className="text-[11px] leading-relaxed">
              1. Pastikan Bluetooth di HP aktif dan printer sudah berpasangan (PIN:{' '}
              <span className="text-white font-mono font-bold">0000</span> atau{' '}
              <span className="text-white font-mono font-bold">1234</span>).
            </p>
            <p className="text-[11px] leading-relaxed">
              2. Gunakan browser <strong className="text-slate-200">Google Chrome</strong> di Android
              untuk fitur Web Bluetooth langsung.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
