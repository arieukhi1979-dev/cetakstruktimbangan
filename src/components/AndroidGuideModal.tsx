import React, { useState } from 'react';
import {
  Smartphone,
  Bluetooth,
  CheckCircle2,
  X,
  Download,
  HelpCircle,
  Usb,
  Copy,
  Check,
  Share2,
  ExternalLink,
} from 'lucide-react';

interface AndroidGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidGuideModal: React.FC<AndroidGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'install' | 'bluetooth'>('install');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore
    }
  };

  const handleShareLink = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Sinergi Ballpress - Label Hasil Press',
          text: 'Buka dan pasang aplikasi Sinergi Ballpress di HP Android:',
          url: currentUrl,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Panduan Penggunaan di HP Android</h3>
              <p className="text-xs text-slate-400">SINERGI BALLPRESS • Bantul Yogyakarta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('install')}
            className={`flex-1 py-3 px-4 border-b-2 flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'install'
                ? 'border-blue-500 text-blue-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Cara Install di HP</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bluetooth')}
            className={`flex-1 py-3 px-4 border-b-2 flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'bluetooth'
                ? 'border-blue-500 text-blue-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Bluetooth className="w-4 h-4" />
            <span>Koneksi Printer</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-300">
          {activeTab === 'install' ? (
            <div className="space-y-4">
              {/* Card Share URL to Android */}
              <div className="bg-gradient-to-r from-blue-950/70 to-indigo-950/70 border border-blue-600/40 rounded-xl p-3.5 space-y-2">
                <span className="font-bold text-white block text-xs">
                  1. Buka Link Aplikasi di HP Android Anda
                </span>
                <p className="text-[11px] text-blue-200">
                  Kirimkan tautan aplikasi ini ke HP Android Anda (misal via WhatsApp), lalu buka menggunakan browser <strong>Google Chrome</strong>:
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Link Berhasil Disalin!' : 'Salin Link Aplikasi'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareLink}
                    className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition cursor-pointer"
                    title="Bagikan ke WhatsApp"
                  >
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <span>Bagikan</span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Install in Android Chrome */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <span className="font-bold text-white block text-sm border-b border-slate-800 pb-2">
                  2. Langkah Pasang ke Layar Depan HP (Home Screen)
                </span>

                <div className="space-y-3 text-[11px] leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      A
                    </span>
                    <div>
                      <strong className="text-white block">Tekan Tombol "Install" di Bagian Atas:</strong>
                      Jika muncul banner biru <em>"Pasang Aplikasi di Android"</em> di bagian atas layar HP, cukup tekan tombol <strong>"Install"</strong>.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      B
                    </span>
                    <div>
                      <strong className="text-white block">Atau Lewat Menu Titik Tiga (⋮) Chrome:</strong>
                      Tekan ikon <strong>titik tiga (⋮)</strong> di sudut kanan atas browser Google Chrome HP Anda.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      C
                    </span>
                    <div>
                      <strong className="text-white block">Pilih "Instal Aplikasi" / "Tambahkan ke Layar Utama":</strong>
                      Cari dan tekan menu <strong>"Instal Aplikasi"</strong> (atau <em>"Add to Home Screen"</em>).
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                      D
                    </span>
                    <div>
                      <strong className="text-white block">Selesai! Aplikasi Siap Digunakan:</strong>
                      Ikon <strong>SINERGI BALLPRESS</strong> akan otomatis muncul di layar utama HP Anda dan dapat dibuka langsung tanpa bilah browser layaknya aplikasi Play Store.
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Box */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-[11px]">
                <span className="font-semibold text-slate-200 block">Kelebihan Setelah Diinstall di Android:</span>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Bisa dibuka langsung dengan 1 ketukan dari layar HP</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Dukungan penuh koneksi Bluetooth ke printer struk thermal</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Dapat berjalan cepat dan menyimpan riwayat penimbangan offline</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Method 1: Bluetooth Pairing */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
                <span className="font-bold text-white block text-sm border-b border-slate-800 pb-2">
                  Langkah Menghubungkan Printer Bluetooth
                </span>

                <ol className="space-y-2.5 text-[11px] leading-relaxed">
                  <li className="flex items-start gap-2">
                    <strong className="text-blue-400 shrink-0">1.</strong>
                    <span>
                      <strong>Nyalakan Printer:</strong> Pastikan baterai terisi dan kertas thermal terpasang dengan benar (sisi licin menghadap pemanas).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="text-blue-400 shrink-0">2.</strong>
                    <span>
                      <strong>Pairing di Bluetooth Android:</strong>
                      <br />
                      Buka <em>Pengaturan HP &gt; Bluetooth &gt; Cari Perangkat</em>.
                      <br />
                      Pilih nama printer Anda (misal: <code>POS-58</code>, <code>MPT-II</code>, <code>RPP02N</code>, <code>GOOJPRT</code>).
                      <br />
                      Jika meminta PIN, masukkan <strong className="text-white font-mono font-bold">0000</strong> atau <strong className="text-white font-mono font-bold">1234</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="text-blue-400 shrink-0">3.</strong>
                    <span>
                      <strong>Buka Aplikasi &amp; Pindai:</strong>
                      <br />
                      Di aplikasi ini, tekan tombol <strong>"Pilih Printer"</strong> di bagian atas &gt; klik <strong>"Pindai Printer Bluetooth"</strong> &gt; pilih printer Anda.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="text-blue-400 shrink-0">4.</strong>
                    <span>
                      <strong>Cetak Label:</strong> Tekan tombol <strong>"CETAK LABEL HASIL PRESS"</strong>. Printer akan langsung mencetak data bal press.
                    </span>
                  </li>
                </ol>
              </div>

              {/* RawBT App Alternative */}
              <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-3.5 space-y-2 text-[11px]">
                <div className="flex items-center gap-2 text-indigo-300 font-bold">
                  <Download className="w-4 h-4" />
                  <span>Alternatif: Cetak via Aplikasi RawBT</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Jika printer Bluetooth Anda adalah tipe lama yang tidak terdeteksi oleh browser, instal aplikasi gratis <strong>RawBT Print Service</strong> dari Google Play Store. Di aplikasi ini tinggal klik tombol <strong>"Cetak via RawBT"</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            SINERGI BALLPRESS • 081325886272
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
