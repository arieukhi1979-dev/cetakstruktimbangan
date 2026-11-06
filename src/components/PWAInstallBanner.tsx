import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border-b border-blue-500/30 px-3 py-2 text-xs md:text-sm text-blue-100 flex items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow">
          <Smartphone className="w-4 h-4 text-white" />
        </div>
        <div className="truncate">
          <span className="font-semibold text-white">Pasang Aplikasi di Android:</span>{' '}
          <span className="text-blue-200 hidden sm:inline">
            Akses langsung tanpa internet & terhubung ke printer lebih cepat.
          </span>
          <span className="text-blue-200 sm:hidden">Jadikan aplikasi di layar utama HP.</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isInstallable ? (
          <button
            onClick={install}
            className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-medium px-3 py-1 rounded-md text-xs transition shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        ) : (
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1.5 bg-blue-600/70 hover:bg-blue-600 text-white font-medium px-2.5 py-1 rounded-md text-xs transition cursor-pointer"
          >
            <span>Cara Pasang</span>
          </button>
        )}

        <button
          onClick={() => setDismissed(true)}
          className="text-blue-300 hover:text-white p-1 rounded-md hover:bg-blue-800/50 cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-400" />
                Pasang di HP Android
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              {isIOS ? (
                <>
                  Di Safari iOS: Tekan tombol <strong>Share (Bagikan)</strong> di bawah layar, lalu pilih{' '}
                  <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.
                </>
              ) : (
                <>
                  Di Chrome Android: Tekan menu titik tiga <span className="font-bold text-white">⋮</span> di pojok kanan atas browser Chrome, lalu pilih{' '}
                  <strong className="text-blue-300">"Tambahkan ke Layar Utama"</strong> atau{' '}
                  <strong className="text-blue-300">"Instal Aplikasi"</strong>.
                </>
              )}
            </p>
            <div className="bg-slate-800/80 rounded-xl p-3 text-xs space-y-2 mb-4 border border-slate-700">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-4 h-4" />
                <span>Bisa dibuka langsung layaknya aplikasi Play Store</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-4 h-4" />
                <span>Mendukung koneksi langsung printer Bluetooth ESC/POS</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-4 h-4" />
                <span>Bekerja lancar di tablet & smartphone Android</span>
              </div>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
