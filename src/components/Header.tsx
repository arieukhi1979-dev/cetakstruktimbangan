import React from 'react';
import { Printer, Bluetooth, Settings, History, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { PrinterDeviceState } from '../types';

interface HeaderProps {
  printerState: PrinterDeviceState;
  onOpenPrinterModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenGuideModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  historyCount: number;
  namaUsaha?: string;
  lokasi?: string;
}

export const Header: React.FC<HeaderProps> = ({
  printerState,
  onOpenPrinterModal,
  onOpenSettingsModal,
  onOpenHistoryModal,
  onOpenGuideModal,
  soundEnabled,
  onToggleSound,
  historyCount,
  namaUsaha = 'SINERGI BALLPRESS',
  lokasi = 'Bantul, D.I. Yogyakarta',
}) => {
  return (
    <header className="bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm sm:text-base text-white tracking-tight truncate">
                {namaUsaha}
              </h1>
              <span className="bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0">
                Bantul POS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden xs:block truncate">
              {lokasi} • Cetak Struk Timbang Ballpress
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Printer Connection Status Pill / Button */}
          <button
            onClick={onOpenPrinterModal}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border transition shadow-sm cursor-pointer ${
              printerState.connected
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50'
                : printerState.connecting
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 animate-pulse'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
            }`}
            title="Pengaturan Koneksi Printer"
          >
            <Bluetooth className={`w-3.5 h-3.5 ${printerState.connected ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline">
              {printerState.connected
                ? printerState.deviceName || 'Printer Terhubung'
                : printerState.connecting
                ? 'Menyambungkan...'
                : 'Pilih Printer'}
            </span>
            <span className="md:hidden">
              {printerState.connected ? 'Terhubung' : 'Printer'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                printerState.connected
                  ? 'bg-emerald-400 animate-ping'
                  : printerState.connecting
                  ? 'bg-amber-400 animate-bounce'
                  : 'bg-rose-400'
              }`}
            />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800/80 border-slate-700 text-blue-400 hover:text-blue-300'
                : 'bg-slate-800/50 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? 'Suara Printer Aktif' : 'Suara Printer Senyap'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Android Connection Guide */}
          <button
            onClick={onOpenGuideModal}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Panduan Koneksi Bluetooth Android"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Panduan</span>
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistoryModal}
            className="relative p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Riwayat Timbang & Cetak"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Riwayat</span>
            {historyCount > 0 && (
              <span className="bg-indigo-600 text-white font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                {historyCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettingsModal}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs transition cursor-pointer"
            title="Pengaturan Struk & Toko"
            aria-label="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
