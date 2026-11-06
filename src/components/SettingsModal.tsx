import React, { useState } from 'react';
import { PrinterSettings } from '../types';
import { Settings, X, Save, Sliders, Store, FileText, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PrinterSettings;
  onSave: (newSettings: PrinterSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<PrinterSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Pengaturan Struk & Toko</h3>
              <p className="text-xs text-slate-400">Sesuaikan header, footer, dan format cetak</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Official Logo Banner */}
          <div className="p-3 bg-white rounded-xl flex items-center justify-between border border-slate-700 shadow-sm">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo Sinergi Ballpress"
                className="h-10 w-auto object-contain"
              />
              <div>
                <span className="font-black text-slate-900 text-xs block">SINERGI BALLPRESS</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Logo Resmi Aktif di Header &amp; Struk</span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Terpasang
            </span>
          </div>

          {/* Toko / Usaha Details */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Header Toko / Gudang</span>
            </h4>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Nama Usaha / Gudang</label>
              <input
                type="text"
                required
                value={formData.namaUsaha}
                onChange={(e) => setFormData({ ...formData, namaUsaha: e.target.value })}
                placeholder="SINERGI BALLPRESS"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Sub-Judul / Keterangan</label>
              <input
                type="text"
                value={formData.subJudul}
                onChange={(e) => setFormData({ ...formData, subJudul: e.target.value })}
                placeholder="LABEL RESMI HASIL PRESS"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Alamat / Lokasi</label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  placeholder="Bantul, D.I. Yogyakarta"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">No. Telepon / WA</label>
                <input
                  type="text"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  placeholder="081325886282"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Paper and Printer Settings */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Format Kertas Thermal</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Lebar Kertas</label>
                <select
                  value={formData.paperWidth}
                  onChange={(e) => setFormData({ ...formData, paperWidth: e.target.value as '58mm' | '80mm' })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="58mm">58 mm (Rol Mini)</option>
                  <option value="80mm">80 mm (Rol Lebar)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Feed Spasi Potong</label>
                <select
                  value={formData.feedLines}
                  onChange={(e) => setFormData({ ...formData, feedLines: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value={2}>2 Baris</option>
                  <option value={3}>3 Baris (Standar)</option>
                  <option value={4}>4 Baris</option>
                  <option value={6}>6 Baris (Mudah disobek)</option>
                </select>
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-2 pt-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.cutPaper}
                  onChange={(e) => setFormData({ ...formData, cutPaper: e.target.checked })}
                  className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900 w-4 h-4"
                />
                <span>Perintah Potong Kertas Otomatis (Auto Cut)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.showTaraGross}
                  onChange={(e) => setFormData({ ...formData, showTaraGross: e.target.checked })}
                  className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900 w-4 h-4"
                />
                <span>Cetak Rincian Berat Bruto (Kotor) &amp; Tara</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.showBarcode}
                  onChange={(e) => setFormData({ ...formData, showBarcode: e.target.checked })}
                  className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900 w-4 h-4"
                />
                <span>Tampilkan Barcode Nomor Nota di Struk</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.showSignature}
                  onChange={(e) => setFormData({ ...formData, showSignature: e.target.checked })}
                  className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900 w-4 h-4"
                />
                <span>Tampilkan Kolom Tanda Tangan Petugas &amp; Supir</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.soundEnabled}
                  onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                  className="rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900 w-4 h-4"
                />
                <span>Efek Suara Mesin Printer &amp; Timbangan (Web Audio)</span>
              </label>
            </div>
          </div>

          {/* Footer Text */}
          <div className="space-y-1 pt-3 border-t border-slate-800">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Catatan / Pesan Footer Struk</span>
            </label>
            <textarea
              rows={2}
              value={formData.footerPesan}
              onChange={(e) => setFormData({ ...formData, footerPesan: e.target.value })}
              placeholder="Pesan di bawah struk..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs leading-relaxed"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengaturan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
