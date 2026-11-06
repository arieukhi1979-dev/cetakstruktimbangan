import React, { useState } from 'react';
import { WeighRecord, PrinterSettings } from '../types';
import {
  History,
  X,
  Printer,
  Trash2,
  Download,
  Search,
  Eye,
  FileSpreadsheet,
  Layers,
  Scale,
  Calendar,
} from 'lucide-react';

interface HistoryListProps {
  isOpen: boolean;
  onClose: () => void;
  history: WeighRecord[];
  settings: PrinterSettings;
  onReprint: (record: WeighRecord) => void;
  onSelectPreview: (record: WeighRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  isOpen,
  onClose,
  history,
  settings,
  onReprint,
  onSelectPreview,
  onDeleteRecord,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');

  if (!isOpen) return null;

  // Filtered records
  const filtered = history.filter((item) => {
    const matchesSearch =
      item.jenisBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nomorLot && item.nomorLot.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDate = !filterDate || item.tanggalProses.startsWith(filterDate);
    return matchesSearch && matchesDate;
  });

  // Calculate totals
  const totalNetto = filtered.reduce((acc, curr) => acc + curr.beratNetto, 0);
  const totalGross = filtered.reduce((acc, curr) => acc + curr.beratGross, 0);
  const totalTara = filtered.reduce((acc, curr) => acc + curr.beratTara, 0);
  const avgNetto = filtered.length > 0 ? totalNetto / filtered.length : 0;

  // Export to CSV
  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = [
      'No. Nota',
      'Tanggal Proses',
      'Waktu',
      'Jenis Barang',
      'Kode Barang',
      'Bruto (kg)',
      'Tara (kg)',
      'Netto (kg)',
      'Satuan',
      'Operator',
      'No. Lot',
      'Shift',
      'Catatan',
      'Harga Satuan',
      'Total Harga',
      'Jumlah Cetak',
    ];

    const rows = filtered.map((r) => {
      const d = new Date(r.tanggalProses);
      return [
        `"${r.receiptNumber}"`,
        `"${d.toLocaleDateString('id-ID')}"`,
        `"${d.toLocaleTimeString('id-ID')}"`,
        `"${r.jenisBarang}"`,
        `"${r.kodeBarang}"`,
        r.beratGross,
        r.beratTara,
        r.beratNetto,
        r.satuan,
        `"${r.operator}"`,
        `"${r.nomorLot || ''}"`,
        `"${r.shift || ''}"`,
        `"${r.catatan || ''}"`,
        r.hargaPerSatuan || 0,
        r.totalHarga || 0,
        r.printCount,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_timbangan_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return `${d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} ${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Riwayat Timbang &amp; Cetak</h3>
              <p className="text-xs text-slate-400">
                Total {history.length} transaksi penimbangan tersimpan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aggregated KPI Summary Bar */}
        {/* Aggregated KPI Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-4 bg-slate-950/70 border-b border-slate-800 text-xs">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">TOTAL BAL PRESS</span>
            <span className="text-lg font-bold text-white font-mono">{filtered.length} Bal</span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-emerald-400 block font-medium">TOTAL BERAT NETTO</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              {totalNetto.toFixed(2)} kg
            </span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-blue-400 block font-medium">STATUS BERAT</span>
            <span className="text-xs font-bold text-blue-300 font-mono flex items-center gap-1 mt-1">
              ✓ LANGSUNG NETTO
            </span>
          </div>
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-cyan-400 block font-medium">RATA-RATA / BAL</span>
            <span className="text-lg font-bold text-cyan-400 font-mono">
              {avgNetto.toFixed(2)} kg
            </span>
          </div>
        </div>

        {/* Filters and Actions Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Cari jenis barang, nota, operator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500"
              />
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filtered.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-semibold transition cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            {history.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin menghapus SEMUA data riwayat penimbangan?')) {
                    onClearAll();
                  }
                }}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Hapus Semua Riwayat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Records List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Scale className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-medium">Belum ada data penimbangan.</p>
              <p className="text-xs">Data struk yang Anda cetak akan otomatis tersimpan di sini.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
              >
                {/* Info Left */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-900/60">
                      {item.receiptNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDate(item.tanggalProses)}
                    </span>
                    {item.nomorLot && (
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                        {item.nomorLot}
                      </span>
                    )}
                    {item.printCount > 1 && (
                      <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800/60 px-1.5 py-0.2 rounded font-semibold">
                        Cetak {item.printCount}x
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white truncate">
                      {item.jenisBarang}
                    </span>
                    {item.kodeBarang && (
                      <span className="text-xs text-slate-500 font-mono">
                        ({item.kodeBarang})
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>
                      Berat Bal: <strong className="text-emerald-400 font-mono font-bold">{item.beratNetto} {item.satuan} (Netto)</strong>
                    </span>
                    <span>
                      Petugas: <strong className="text-slate-300">{item.operator}</strong>
                    </span>
                    {item.catatan && (
                      <span className="italic text-slate-400">"{item.catatan}"</span>
                    )}
                  </div>
                </div>

                {/* Netto and Actions Right */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      NETTO (BERSIH)
                    </span>
                    <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                      {item.beratNetto.toFixed(2)} {item.satuan}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* View in preview */}
                    <button
                      type="button"
                      onClick={() => {
                        onSelectPreview(item);
                        onClose();
                      }}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
                      title="Lihat di Pratinjau Struk"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Reprint */}
                    <button
                      type="button"
                      onClick={() => onReprint(item)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-sm"
                      title="Cetak Ulang ke Printer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Ulang</span>
                    </button>

                    {/* Delete single */}
                    <button
                      type="button"
                      onClick={() => onDeleteRecord(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                      title="Hapus baris ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/60 flex justify-between items-center text-xs">
          <span className="text-slate-400">
            Menampilkan {filtered.length} dari {history.length} data
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
