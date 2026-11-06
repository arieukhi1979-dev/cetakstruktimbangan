import React, { useState, useEffect } from 'react';
import { WeighRecord, PrinterSettings, ItemCategoryPreset, WeightUnit } from '../types';
import { DigitalScale } from './DigitalScale';
import {
  Printer,
  Calendar,
  Package,
  User,
  Clock,
  Layers,
  FileText,
  DollarSign,
  Plus,
  RefreshCw,
  ExternalLink,
  Save,
  Check,
} from 'lucide-react';

interface WeighFormProps {
  settings: PrinterSettings;
  categories: ItemCategoryPreset[];
  currentReceiptNumber: string;
  onPrint: (record: WeighRecord) => Promise<boolean>;
  onPrintRawBT: (record: WeighRecord) => void;
  onPrintSystem: (record: WeighRecord) => void;
  onSaveWithoutPrint: (record: WeighRecord) => void;
  onReset: () => void;
  onAddCategory: (category: ItemCategoryPreset) => void;
  soundEnabled: boolean;
}

export const WeighForm: React.FC<WeighFormProps> = ({
  settings,
  categories,
  currentReceiptNumber,
  onPrint,
  onPrintRawBT,
  onPrintSystem,
  onSaveWithoutPrint,
  onReset,
  onAddCategory,
  soundEnabled,
}) => {
  // Form State - Default Sinergi Ballpress
  const [jenisBarang, setJenisBarang] = useState('Ballpress BN');
  const [kodeBarang, setKodeBarang] = useState('B-BN-001');
  const [tanggalProses, setTanggalProses] = useState(new Date().toISOString());
  const [isAutoTime, setIsAutoTime] = useState(true);
  // Direct Net Weight State (Langsung Netto untuk label hasil press)
  const [beratNetto, setBeratNetto] = useState<number>(120.0);
  const beratGross = beratNetto;
  const beratTara = 0;
  const [satuan, setSatuan] = useState<WeightUnit>('kg');
  const [operator, setOperator] = useState('Petugas Timbang');
  const [nomorLot, setNomorLot] = useState('BAL-01');
  const [shift, setShift] = useState('Shift Pagi (08:00 - 16:00)');
  const [catatan, setCatatan] = useState('');
  const [hargaPerSatuan, setHargaPerSatuan] = useState<number | undefined>(undefined);
  const [includePrice, setIncludePrice] = useState(false);

  // UI state
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatTara, setNewCatTara] = useState(0);

  const totalHarga = includePrice && hargaPerSatuan ? beratNetto * hargaPerSatuan : undefined;

  // Auto-time timer if enabled
  useEffect(() => {
    if (!isAutoTime) return;
    const timer = setInterval(() => {
      setTanggalProses(new Date().toISOString());
    }, 1000);
    return () => clearInterval(timer);
  }, [isAutoTime]);

  // Load saved operator
  useEffect(() => {
    const savedOp = localStorage.getItem('cetakstruk_last_operator');
    if (savedOp) setOperator(savedOp);
  }, []);

  // Handle select category chip
  const handleSelectCategory = (cat: ItemCategoryPreset) => {
    setJenisBarang(cat.name);
    setSatuan(cat.satuan);
    setKodeBarang(`${cat.prefix}-${String(Math.floor(Math.random() * 900) + 100)}`);
  };

  // Build current record object
  const buildCurrentRecord = (): WeighRecord => {
    return {
      id: `trx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      receiptNumber: currentReceiptNumber,
      jenisBarang: jenisBarang.trim() || 'Barang Umum',
      kodeBarang: kodeBarang.trim(),
      tanggalProses: isAutoTime ? new Date().toISOString() : tanggalProses,
      beratGross,
      beratTara,
      beratNetto,
      satuan,
      operator: operator.trim() || 'Operator Timbang',
      nomorLot: nomorLot.trim() || undefined,
      shift: shift || undefined,
      catatan: catatan.trim() || undefined,
      hargaPerSatuan: includePrice ? hargaPerSatuan : undefined,
      totalHarga,
      printedAt: new Date().toISOString(),
      printCount: 1,
    };
  };

  // Handle print
  const handlePrintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (beratNetto <= 0) {
      alert('Perhatian: Berat bersih (Netto) harus lebih besar dari 0');
      return;
    }

    setIsPrinting(true);
    setPrintSuccess(false);

    // Save operator for next time
    localStorage.setItem('cetakstruk_last_operator', operator);

    const record = buildCurrentRecord();
    const success = await onPrint(record);

    setIsPrinting(false);
    if (success) {
      setPrintSuccess(true);
      setTimeout(() => setPrintSuccess(false), 3000);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat: ItemCategoryPreset = {
      id: String(Date.now()),
      name: newCatName.trim(),
      defaultTara: Number(newCatTara) || 0,
      satuan: 'kg',
      prefix: newCatName.substring(0, 3).toUpperCase(),
    };
    onAddCategory(newCat);
    handleSelectCategory(newCat);
    setNewCatName('');
    setShowAddCatModal(false);
  };

  return (
    <div className="space-y-4">
      {/* 1. DIGITAL SCALE INDICATOR (TOP COMPONENT) */}
      <DigitalScale
        grossWeight={beratNetto}
        tareWeight={0}
        netWeight={beratNetto}
        unit={satuan}
        soundEnabled={soundEnabled}
        onGrossChange={setBeratNetto}
        onTareChange={() => {}}
        onUnitChange={setSatuan}
      />

      {/* 2. MAIN FORM INPUTS */}
      <form onSubmit={handlePrintSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-5">
        {/* Receipt Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-800/60">
              {currentReceiptNumber}
            </span>
            <span className="text-xs text-slate-400">Formulir Data Timbangan</span>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
            title="Reset data ke default"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Input</span>
          </button>
        </div>

        {/* FIELD 1: JENIS BARANG (MAIN REQUIREMENT) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-blue-400" />
              <span>Jenis Barang / Komoditas</span>
              <span className="text-rose-400">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowAddCatModal(true)}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <Plus className="w-3 h-3" />
              <span>Tambah Jenis</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <input
                type="text"
                required
                value={jenisBarang}
                onChange={(e) => setJenisBarang(e.target.value)}
                placeholder="Contoh: Ballpress BN, Ballpress BM, Mix..."
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-500"
              />
            </div>
            <div>
              <input
                type="text"
                value={kodeBarang}
                onChange={(e) => setKodeBarang(e.target.value)}
                placeholder="Kode SKU / Lot"
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-300 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Quick Selection Category Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className={`text-[11px] px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                  jenisBarang === cat.name
                    ? 'bg-blue-600 text-white border-blue-500 font-semibold shadow-md ring-1 ring-blue-400'
                    : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700/80 text-slate-300'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[9px] opacity-70 font-mono">({cat.prefix})</span>
              </button>
            ))}
          </div>
        </div>

        {/* FIELD 2: TANGGAL PROSES & WAKTU (MAIN REQUIREMENT) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Tanggal & Waktu */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Tanggal & Waktu Proses</span>
                <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsAutoTime(!isAutoTime);
                  if (!isAutoTime) setTanggalProses(new Date().toISOString());
                }}
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition cursor-pointer ${
                  isAutoTime
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isAutoTime ? '● Waktu Nyata (Auto)' : 'Manual'}
              </button>
            </div>

            {isAutoTime ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-mono text-emerald-300 font-medium">
                    {new Date(tanggalProses).toLocaleDateString('id-ID', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    - {new Date(tanggalProses).toLocaleTimeString('id-ID')}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">WIB</span>
              </div>
            ) : (
              <input
                type="datetime-local"
                value={tanggalProses.substring(0, 16)}
                onChange={(e) => setTanggalProses(new Date(e.target.value).toISOString())}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs font-mono text-white"
              />
            )}
          </div>

          {/* Shift & Nomor Lot */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Shift Kerja</span>
              </label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-2.5 py-2.5 text-xs text-white"
              >
                <option value="Shift Pagi (08:00 - 16:00)">Shift Pagi</option>
                <option value="Shift Siang (16:00 - 00:00)">Shift Siang</option>
                <option value="Shift Malam (00:00 - 08:00)">Shift Malam</option>
                <option value="Umum / Reguler">Reguler</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-300">
                No. Batch / Lot
              </label>
              <input
                type="text"
                value={nomorLot}
                onChange={(e) => setNomorLot(e.target.value)}
                placeholder="Contoh: LOT-01"
                className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-2.5 py-2.5 text-xs font-mono text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* FIELD 3: BERAT BARANG (LANGSUNG NETTO - TANPA POTONGAN TARA) */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Berat Bal Press (Langsung Netto)</span>
              <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/60">
              Langsung Netto (Tanpa Tara)
            </span>
          </div>

          <div className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-[11px] text-slate-400 block mb-1">
                Berat Bersih Bal Barang yang Sudah Dipress:
              </span>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={beratNetto || ''}
                  onChange={(e) => setBeratNetto(parseFloat(e.target.value) || 0)}
                  placeholder="Contoh: 125.5"
                  className="w-full bg-slate-900 border-2 border-emerald-500/60 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-2xl font-mono font-black text-emerald-400 pr-14 shadow-inner"
                />
                <span className="absolute right-3.5 top-3 text-base text-emerald-500 font-mono font-bold uppercase">
                  {satuan}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-400 sm:max-w-[220px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="font-semibold text-slate-300 block mb-0.5">Label Bal Press</span>
              Berat langsung dicetak sebagai berat bersih pada struk label untuk ditempel ke barang yang sudah dipress.
            </div>
          </div>
        </div>

        {/* OPTIONAL FIELD: Catatan */}
        <div className="pt-1">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-300">
              Catatan Bal / Keterangan (Opsional)
            </label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Kualitas Super, Gudang B, Siap Kirim..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        {/* Optional Price Calculation Toggle */}
        <div className="pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includePrice}
                onChange={(e) => setIncludePrice(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-950 w-4 h-4"
              />
              <span className="flex items-center gap-1 font-medium">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                Cantumkan Nilai / Harga per {satuan} pada Struk
              </span>
            </label>
            {includePrice && (
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Total: Rp {Math.round(totalHarga || 0).toLocaleString('id-ID')}
              </span>
            )}
          </div>

          {includePrice && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">
                  Harga Satuan (Rp / {satuan})
                </span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  placeholder="Contoh: 14500"
                  value={hargaPerSatuan || ''}
                  onChange={(e) => setHargaPerSatuan(parseFloat(e.target.value) || undefined)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">
                  Total Nilai Barang
                </span>
                <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-emerald-400">
                  Rp {Math.round(totalHarga || 0).toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="pt-2 space-y-2">
          {/* PRIMARY CETAK STRUK BUTTON */}
          <button
            type="submit"
            disabled={isPrinting || beratNetto <= 0}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition transform active:scale-[0.99] cursor-pointer ${
              printSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : beratNetto <= 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25'
            }`}
          >
            {printSuccess ? (
              <>
                <Check className="w-5 h-5 text-white animate-bounce" />
                <span>STRUK BERHASIL DICETAK!</span>
              </>
            ) : isPrinting ? (
              <>
                <RefreshCw className="w-5 h-5 text-white animate-spin" />
                <span>MENGIRIM KE PRINTER THERMAL...</span>
              </>
            ) : (
              <>
                <Printer className="w-5 h-5 text-white" />
                <span>CETAK LABEL HASIL PRESS ({settings.paperWidth})</span>
              </>
            )}
          </button>

          {/* SECONDARY PRINT OPTIONS (Android RawBT & Browser System Print) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {/* RawBT Android Direct Scheme */}
            <button
              type="button"
              onClick={() => onPrintRawBT(buildCurrentRecord())}
              className="py-2 px-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Kirim ke aplikasi Android RawBT / ESC POS Print Service"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Cetak via RawBT (Android)</span>
            </button>

            {/* Standard Browser / Android Spooler Print */}
            <button
              type="button"
              onClick={() => onPrintSystem(buildCurrentRecord())}
              className="py-2 px-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Cetak via Layanan Cetak Android Spooler"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cetak System Print</span>
            </button>

            {/* Save without print */}
            <button
              type="button"
              onClick={() => {
                const rec = buildCurrentRecord();
                onSaveWithoutPrint(rec);
              }}
              className="py-2 px-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simpan ke Riwayat Saja</span>
            </button>
          </div>
        </div>
      </form>

      {/* MODAL: TAMBAH KATEGORI / JENIS BARANG BARU */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form
            onSubmit={handleCreateCategory}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-slate-200 space-y-4"
          >
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              Tambah Jenis Barang Baru
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Nama Barang / Komoditas</label>
              <input
                type="text"
                required
                autoFocus
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Contoh: Biji Kakao Kering"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Default Tara / Kemasan (kg)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newCatTara}
                onChange={(e) => setNewCatTara(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCatModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
