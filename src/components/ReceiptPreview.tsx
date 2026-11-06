import React, { useState } from 'react';
import { WeighRecord, PrinterSettings } from '../types';
import { generateReceiptPlainText } from '../utils/escpos';
import { Copy, Share2, Check, Printer, FileText, Sparkles } from 'lucide-react';

interface ReceiptPreviewProps {
  record: WeighRecord | null;
  settings: PrinterSettings;
  isPrinting?: boolean;
  onPrintNow?: () => void;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  record,
  settings,
  isPrinting = false,
  onPrintNow,
}) => {
  const [copied, setCopied] = useState(false);
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(settings.paperWidth || '58mm');

  // Fallback demo record if null
  const displayRecord: WeighRecord = record || {
    id: 'demo_1',
    receiptNumber: 'BALL-20261105-001',
    jenisBarang: 'Ballpress BN',
    kodeBarang: 'B-BN-001',
    tanggalProses: new Date().toISOString(),
    beratGross: 121.0,
    beratTara: 1.0,
    beratNetto: 120.0,
    satuan: 'kg',
    operator: 'Petugas Timbang',
    nomorLot: 'BAL-01',
    shift: 'Shift Pagi (08:00 - 16:00)',
    catatan: 'Press Padat, Kawat Strapping Aman',
    hargaPerSatuan: undefined,
    totalHarga: undefined,
    printedAt: new Date().toISOString(),
    printCount: 1,
  };

  const plainText = generateReceiptPlainText(displayRecord, { ...settings, paperWidth });

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Struk Timbang - ${displayRecord.receiptNumber}`,
          text: plainText,
        });
      } catch {
        handleCopyText();
      }
    } else {
      handleCopyText();
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const formatTime = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const is58 = paperWidth === '58mm';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col items-center">
      {/* Top Header of Preview Panel */}
      <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Pratinjau Struk Thermal
            </h3>
            <span className="text-[11px] text-slate-400">
              Format ESC/POS Rol Kertas
            </span>
          </div>
        </div>

        {/* Paper width selector: 58mm or 80mm */}
        <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setPaperWidth('58mm')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              is58 ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            58 mm
          </button>
          <button
            type="button"
            onClick={() => setPaperWidth('80mm')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
              !is58 ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            80 mm
          </button>
        </div>
      </div>

      {/* Realistic Printer Slot & Thermal Paper Roll Container */}
      <div className="w-full flex flex-col items-center">
        {/* Printer Output Slot Bar */}
        <div
          className={`h-3 rounded-full bg-slate-950 border-2 border-slate-700/80 shadow-inner mb-[-6px] z-10 ${
            is58 ? 'w-[290px]' : 'w-[360px]'
          }`}
        />

        {/* Thermal Receipt Paper */}
        <div
          className={`bg-white text-black font-thermal text-[11px] sm:text-xs leading-tight p-4 shadow-2xl rounded-t-sm relative transition-all duration-300 ${
            isPrinting ? 'animate-pulse translate-y-2' : ''
          } ${is58 ? 'w-[280px]' : 'w-[350px]'}`}
          style={{
            boxShadow: '0 20px 30px -10px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.05)',
          }}
        >
          {/* Header with Official Logo */}
          <div className="text-center space-y-1">
            <div className="flex justify-center pb-1">
              <img
                src="/logo.png"
                alt="Logo Sinergi Ballpress"
                className="h-12 sm:h-14 w-auto max-w-[200px] object-contain"
              />
            </div>
            <h4 className="font-black text-sm sm:text-base tracking-tight uppercase leading-snug text-black">
              {settings.namaUsaha || 'SINERGI BALLPRESS'}
            </h4>
            {settings.subJudul && (
              <p className="text-[10px] uppercase font-bold text-gray-800">{settings.subJudul}</p>
            )}
            {settings.alamat && (
              <p className="text-[9px] text-gray-600">{settings.alamat}</p>
            )}
            {settings.telepon && (
              <p className="text-[9px] font-semibold text-gray-700">Telp/WA: {settings.telepon}</p>
            )}
          </div>

          <div className="my-2 border-t border-dashed border-gray-400" />

          {/* Struk / Label Title */}
          <div className="text-center font-black text-xs uppercase tracking-wider py-1 border-y-2 border-black bg-white text-black">
            LABEL HASIL PRESS
          </div>

          <div className="my-1 border-t border-dashed border-gray-400" />

          {/* Meta Details */}
          <div className="space-y-0.5 text-[10px] sm:text-[11px]">
            <div className="flex justify-between">
              <span className="text-gray-600">No. Bal</span>
              <span className="font-bold">{displayRecord.receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tgl Proses</span>
              <span className="font-semibold">{formatDate(displayRecord.tanggalProses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Waktu</span>
              <span className="font-semibold">{formatTime(displayRecord.tanggalProses)}</span>
            </div>
            {displayRecord.shift && (
              <div className="flex justify-between">
                <span className="text-gray-600">Shift</span>
                <span>{displayRecord.shift.split(' ')[0]} {displayRecord.shift.split(' ')[1] || ''}</span>
              </div>
            )}
            {displayRecord.nomorLot && (
              <div className="flex justify-between">
                <span className="text-gray-600">Batch / Lot</span>
                <span className="font-mono">{displayRecord.nomorLot}</span>
              </div>
            )}
          </div>

          <div className="my-2 border-t border-dashed border-gray-400" />

          {/* MAIN REQUIREMENT 1: JENIS BARANG */}
          <div className="py-1">
            <span className="text-[9px] uppercase tracking-wider text-gray-600 block">
              JENIS BARANG / KOMODITAS:
            </span>
            <div className="font-black text-sm sm:text-base uppercase tracking-tight text-gray-950 mt-0.5">
              {displayRecord.jenisBarang}
            </div>
            {displayRecord.kodeBarang && (
              <div className="text-[10px] text-gray-600 font-mono">
                Kode: {displayRecord.kodeBarang}
              </div>
            )}
          </div>

          <div className="my-2 border-t-2 border-black" />

          {/* MAIN REQUIREMENT 3: BERAT BARANG (LANGSUNG NETTO - JUMBO 3X BESAR) */}
          <div className="space-y-1">
            {/* JUMBO 3X BERAT BERSIH NETTO BOX - BACKGROUND PUTIH, TULISAN HITAM */}
            <div className="bg-white text-black rounded-lg p-3 text-center my-3 border-4 border-black shadow-xs">
              <span className="text-[11px] font-black uppercase tracking-widest text-black block mb-1">
                ★ BERAT BERSIH (NETTO) ★
              </span>
              <div className="flex items-baseline justify-center gap-1.5 py-1">
                <span className="text-5xl sm:text-6xl font-black tracking-tight font-mono leading-none text-black">
                  {displayRecord.beratNetto.toFixed(2)}
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-black uppercase">
                  {displayRecord.satuan}
                </span>
              </div>
            </div>

            {displayRecord.catatan && (
              <div className="text-[9px] text-gray-600 pt-1 italic">
                Ket: {displayRecord.catatan}
              </div>
            )}
          </div>

          <div className="my-2 border-t border-dashed border-gray-400" />

          {/* Footer Text */}
          {settings.footerPesan && (
            <p className="text-[9px] text-center text-gray-600 mt-1 leading-snug">
              {settings.footerPesan}
            </p>
          )}

          <div className="text-[8px] text-center text-gray-500 mt-2 font-mono">
            {displayRecord.printCount > 1
              ? `* CETAK ULANG KE-${displayRecord.printCount} *`
              : '* ASLI *'}
          </div>

          {/* Zigzag Paper Tear Edge at bottom */}
          <div className="absolute -bottom-2 left-0 right-0 h-2 flex overflow-hidden">
            {Array.from({ length: is58 ? 28 : 35 }).map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-2 bg-white transform rotate-45 -translate-y-1 shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Toolbar below Receipt */}
      <div className="w-full mt-5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
            title="Salin teks struk ke clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
            title="Bagikan ke WhatsApp atau aplikasi lain"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Bagikan</span>
          </button>
        </div>

        {onPrintNow && (
          <button
            type="button"
            onClick={onPrintNow}
            disabled={isPrinting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Pratinjau Ini</span>
          </button>
        )}
      </div>
    </div>
  );
};
